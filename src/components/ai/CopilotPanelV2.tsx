import {
  AlertTriangle,
  Cloud,
  Database,
  Globe,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useChatHistoryStore, { ChatMessage } from "../../store/chatHistoryStore";
import { addNotification } from "../../store/notificationStore";
import { useUserStore } from "../../store/userStore";
import { getEnvVar } from "../../utils/envUtils";
import { supabase } from "../../utils/supabaseClient";
import {
  callLLMStudioAPI,
  checkLLMStudioAvailability,
} from "../applets/ChatGptImporter/services/llmStudioService";

interface CopilotPanelV2Props {
  className?: string;
  isDarkMode?: boolean;
}

// API provider types
type ApiProvider = "openai" | "llm-studio" | "live-chat";

const CopilotPanelV2: React.FC<CopilotPanelV2Props> = ({
  className,
  isDarkMode = true,
}) => {
  // Use chat history from store
  const { messages, addMessage, clearHistory } = useChatHistoryStore();

  // Use user store for authentication
  const { user, isSignedIn } = useUserStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [apiProvider, setApiProvider] = useState<ApiProvider>("llm-studio");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get OpenAI API key from environment (optional)
  const openaiApiKey = getEnvVar("VITE_OPENAI_API_KEY") || "";

  // Get live chat endpoint URL from environment
  const liveChatUrl =
    getEnvVar("VITE_LIVE_CHAT_URL") || getEnvVar("VITE_DEFAULT_CHAT_URL");

  // Determine if this is a custom endpoint or production
  const isCustomEndpoint = useCallback(() => {
    const defaultUrl = getEnvVar("VITE_DEFAULT_CHAT_URL");
    return liveChatUrl !== defaultUrl;
  }, [liveChatUrl]);

  const getEndpointType = () => {
    if (isCustomEndpoint()) {
      return "Custom";
    }
    return "Server";
  };

  // Check API availability and determine provider
  useEffect(() => {
    const checkApi = async () => {
      if (openaiApiKey) {
        // If we have an OpenAI API key, use that first
        setApiProvider("openai");
        setApiAvailable(true);
      } else if (liveChatUrl) {
        // If using a custom endpoint (like localhost), use live chat without auth requirement
        setApiProvider("live-chat");
        setApiAvailable(true);
      } else {
        // Check if LLM Studio is available
        try {
          const available = await checkLLMStudioAvailability();
          setApiProvider("llm-studio");
          setApiAvailable(available);
        } catch (error) {
          console.error("LLM Studio not available:", error);
          setApiAvailable(false);
        }
      }
    };

    checkApi();
  }, [openaiApiKey, liveChatUrl]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call OpenAI API
  const callOpenAIAPI = async (
    chatMessages: ChatMessage[]
  ): Promise<string> => {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: chatMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Call Live Chat API
  const callLiveChatAPI = async (
    chatMessages: ChatMessage[]
  ): Promise<string> => {
    if (!liveChatUrl) {
      throw new Error("Live chat URL not configured");
    }

    const response = await fetch(`${liveChatUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: chatMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Live Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      let response: string;
      const chatMessages = [...messages, userMessage];

      // Call appropriate API based on provider
      switch (apiProvider) {
        case "openai":
          response = await callOpenAIAPI(chatMessages);
          break;
        case "live-chat":
          response = await callLiveChatAPI(chatMessages);
          break;
        case "llm-studio":
          response = await callLLMStudioAPI(chatMessages, { temperature });
          break;
        default:
          throw new Error("No API provider available");
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);

      // Save to Supabase if user is signed in
      if (isSignedIn && user) {
        try {
          await supabase.from("chat_messages").insert([
            {
              user_id: user.id,
              role: userMessage.role,
              content: userMessage.content,
              timestamp: userMessage.timestamp.toISOString(),
            },
            {
              user_id: user.id,
              role: assistantMessage.role,
              content: assistantMessage.content,
              timestamp: assistantMessage.timestamp.toISOString(),
            },
          ]);
        } catch (error) {
          console.error("Error saving messages to Supabase:", error);
          // Don't block the UI for database errors
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      addNotification({
        type: "error",
        message: `Chat Error: ${error instanceof Error ? error.message : "Failed to send message"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    addNotification({
      type: "success",
      message: "Chat history has been cleared",
    });
  };

  const getApiStatusColor = () => {
    if (apiAvailable === null) return isDarkMode ? "#a0b7e2" : "#666";
    return apiAvailable ? "#4caf50" : "#f44336";
  };

  const getProviderIcon = () => {
    switch (apiProvider) {
      case "openai":
        return <Globe size={16} />;
      case "llm-studio":
        return <Database size={16} />;
      case "live-chat":
        return <Cloud size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getProviderLabel = () => {
    switch (apiProvider) {
      case "openai":
        return "OpenAI";
      case "llm-studio":
        return "LLM Studio";
      case "live-chat":
        return `Live Chat (${getEndpointType()})`;
      default:
        return "Unknown";
    }
  };

  // Define color scheme based on dark mode
  const colors = {
    background: isDarkMode ? "#1f2937" : "#ffffff",
    text: isDarkMode ? "#e0e0e0" : "#333333",
    textSecondary: isDarkMode ? "#a0b7e2" : "#666666",
    border: isDarkMode ? "#31415e" : "#e0e0e0",
    primary: isDarkMode ? "#4285f4" : "#2563eb",
    primaryForeground: "#ffffff",
    secondary: isDarkMode ? "#374151" : "#f8f9fa",
    secondaryForeground: isDarkMode ? "#e0e0e0" : "#333333",
    muted: isDarkMode ? "#2d3748" : "#f8f9fa",
    success: "#4caf50",
    error: "#f44336",
    warning: "#ff9800",
  };

  // Define inline styles to avoid external CSS conflicts
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      width: "100%",
      maxWidth: "100%",
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: "inherit",
      fontSize: "14px",
      lineHeight: "1.4",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: `1px solid ${colors.border}`,
      flexShrink: 0,
    },
    title: {
      fontSize: "16px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      margin: 0,
    },
    statusIndicator: {
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: getApiStatusColor(),
      marginLeft: "8px",
    },
    headerButtons: {
      display: "flex",
      gap: "8px",
    },
    button: {
      background: "none",
      border: "none",
      color: colors.textSecondary,
      cursor: "pointer",
      padding: "4px",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    messagesContainer: {
      flex: 1,
      padding: "16px",
      overflowY: "auto" as const,
      minHeight: "200px",
      maxHeight: "400px",
    },
    message: {
      marginBottom: "16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "4px",
    },
    messageHeader: {
      fontSize: "12px",
      color: colors.textSecondary,
      fontWeight: 500,
    },
    messageContent: {
      padding: "8px 12px",
      borderRadius: "8px",
      lineHeight: "1.5",
      whiteSpace: "pre-wrap" as const,
    },
    userMessage: {
      backgroundColor: colors.primary,
      color: colors.primaryForeground,
      alignSelf: "flex-end",
      maxWidth: "80%",
    },
    assistantMessage: {
      backgroundColor: colors.secondary,
      color: colors.secondaryForeground,
      alignSelf: "flex-start",
      maxWidth: "80%",
    },
    inputForm: {
      display: "flex",
      padding: "16px",
      gap: "8px",
      borderTop: `1px solid ${colors.border}`,
      flexShrink: 0,
    },
    input: {
      flex: 1,
      padding: "8px 12px",
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: "14px",
      outline: "none",
    },
    sendButton: {
      padding: "8px 16px",
      backgroundColor: colors.primary,
      color: colors.primaryForeground,
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "14px",
      fontWeight: 500,
    },
    settings: {
      padding: "16px",
      borderTop: `1px solid ${colors.border}`,
      backgroundColor: colors.muted,
    },
    settingsRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    slider: {
      width: "100px",
    },
    apiStatus: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: colors.textSecondary,
      marginTop: "8px",
    },
  };

  if (apiAvailable === false) {
    return (
      <div style={styles.container} className={className}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            <AlertTriangle size={16} />
            Copilot Chat
            <span style={styles.statusIndicator} />
          </h3>
        </div>
        <div
          style={{
            ...styles.messagesContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: colors.textSecondary }}>
            <AlertTriangle
              size={48}
              style={{ marginBottom: "16px", color: colors.warning }}
            />
            <h4>API Not Available</h4>
            <p>No AI chat service is currently available.</p>
            <p>Please configure an API key or check your connection.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          {getProviderIcon()}
          Copilot Chat
          <span style={styles.statusIndicator} />
        </h3>
        <div style={styles.headerButtons}>
          <button
            style={styles.button}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            style={styles.button}
            onClick={handleClearHistory}
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div style={styles.settings}>
          <div style={styles.settingsRow}>
            <label>Temperature: {temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={styles.slider}
            />
          </div>
          <div style={styles.apiStatus}>
            {getProviderIcon()}
            <span>{getProviderLabel()}</span>
            <span style={{ color: getApiStatusColor() }}>●</span>
            {apiAvailable ? "Connected" : "Disconnected"}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: colors.textSecondary,
              padding: "32px",
            }}
          >
            <p>Start a conversation with Copilot!</p>
            <p style={{ fontSize: "12px" }}>
              Ask questions, get help with code, or discuss ideas.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} style={styles.message}>
              <div style={styles.messageHeader}>
                {message.role === "user" ? "You" : "Copilot"} •{" "}
                {message.timestamp.toLocaleTimeString()}
              </div>
              <div
                style={{
                  ...styles.messageContent,
                  ...(message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage),
                }}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Copilot anything..."
          disabled={isLoading || !apiAvailable}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || !apiAvailable}
          style={{
            ...styles.sendButton,
            opacity: isLoading || !inputValue.trim() || !apiAvailable ? 0.6 : 1,
            cursor:
              isLoading || !inputValue.trim() || !apiAvailable
                ? "not-allowed"
                : "pointer",
          }}
        >
          <Send size={14} />
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default CopilotPanelV2;
