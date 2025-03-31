import { Send, Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../../services/WebLLMClient";
import {
  getCurrentModel,
  getSharedLLMClient,
  isClientReady,
  isModelLoading,
  switchModel,
} from "../../services/llmService";
import { addNotification } from "../../store/notificationStore";
import "./AIChatPanel.css";

// Available models for chat
const AVAILABLE_MODELS = [
  "Llama-3.1-8B-Instruct-q4f32_1-MLC",
  "TinyLlama-1.1B-Chat-v1.0-q4f32_1",
  "Llama-2-7b-chat-hf-q4f32_1",
];

type AvailableModel = (typeof AVAILABLE_MODELS)[number];

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  isDarkMode?: boolean;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ isDarkMode = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<AvailableModel>(
    (getCurrentModel() as AvailableModel) || "Llama-3.2-1B-Instruct-q4f16_1-MLC"
  );
  const [isLoading, setIsLoading] = useState(isModelLoading());
  const [isModelReady, setIsModelReady] = useState(isClientReady());
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize shared LLM client
  useEffect(() => {
    if (!isClientReady()) {
      setIsLoading(true);
      getSharedLLMClient()
        .then(() => {
          setIsModelReady(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsModelReady(true);
    }

    // Set up an interval to check if model status changed
    const checkInterval = setInterval(() => {
      setIsLoading(isModelLoading());
      setIsModelReady(isClientReady());
      if (selectedModel !== getCurrentModel()) {
        setSelectedModel(getCurrentModel() as AvailableModel);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [selectedModel]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load model when changed
  const loadModel = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await switchModel(selectedModel);
      setIsModelReady(true);
    } catch (error) {
      console.error("Error switching model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get shared LLM client
      const llmClient = await getSharedLLMClient();

      // Convert to ChatMessage format for WebLLMClient
      const chatMessages: ChatMessage[] = messages
        .concat(userMessage)
        .filter((msg) => msg.id !== "welcome" || messages.length <= 1) // Remove welcome message unless it's the only one
        .map(({ role, content }) => ({ role, content }));

      // Add a system message for context
      chatMessages.unshift({
        role: "system",
        content:
          "You are a helpful AI assistant. Provide concise, accurate answers.",
      });

      // Generate response
      const response = await llmClient.chatCompletion(chatMessages, {
        temperature,
        prompt: "Continue the conversation.",
      });

      // Add AI response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      addNotification({
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
        duration: 5000,
      });

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName as AvailableModel);

    // If model changed, we need to reload
    if (getCurrentModel() !== modelName) {
      loadModel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`ai-chat-panel ${isDarkMode ? "dark" : ""}`}>
      {/* Header with settings button */}
      <div className="ai-chat-header">
        <div className="ai-chat-title">AI Chat</div>
        <div className="ai-chat-actions">
          <button
            className="ai-chat-settings-button"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="ai-chat-settings">
          <div className="settings-group">
            <label htmlFor="model-select">Model:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={isLoading}
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="settings-group">
            <label htmlFor="temperature-slider">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>
          <button
            className="load-model-button"
            onClick={loadModel}
            disabled={isLoading}
          >
            {isModelReady ? "Reload Model" : "Load Model"}
          </button>
        </div>
      )}

      {/* Message history */}
      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`ai-chat-message ${message.role}`}>
            <div className="message-content">
              {message.content.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.content.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-chat-message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="ai-chat-input-container">
        <textarea
          className="ai-chat-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading && !isModelReady}
        />
        <button
          className="ai-chat-send-button"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || (isLoading && !isModelReady)}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;
