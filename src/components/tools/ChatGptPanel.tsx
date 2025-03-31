import { FileJson, MessageSquare } from "lucide-react";
import React, { useRef, useState } from "react";
import { GET_DEFAULT_RENDERING_CONFIG } from "../../controllers/RenderingManager";
import useAppConfigStore, {
  getCurrentSceneGraph,
} from "../../store/appConfigStore";
import { addNotification } from "../../store/notificationStore";
import {
  importChatGptConversation,
  importChatGptFromFile,
} from "../../utils/chatGptImporter";
import "./ChatGptPanel.css";

interface ChatGptPanelProps {
  isDarkMode?: boolean;
}

const ChatGptPanel: React.FC<ChatGptPanelProps> = ({ isDarkMode = false }) => {
  const [url, setUrl] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [recentImports, setRecentImports] = React.useState<string[]>([]);
  const [createMessageNodes, setCreateMessageNodes] = useState<boolean>(true); // Add checkbox state
  const { currentSceneGraph } = useAppConfigStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recent imports from localStorage on component mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("chatgpt-recent-imports");
      if (saved) {
        setRecentImports(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load recent imports:", error);
    }
  }, []);

  // Save a URL to recent imports
  const saveToRecentImports = (url: string) => {
    // Only save valid URLs
    if (!url.includes("chatgpt.com/share/")) return;

    const updated = [
      url,
      ...recentImports.filter((item) => item !== url),
    ].slice(0, 5);
    setRecentImports(updated);
    try {
      localStorage.setItem("chatgpt-recent-imports", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent imports:", error);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) {
      addNotification({
        message: "Please enter a valid ChatGPT share URL",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const conversationNodeId = await importChatGptConversation(
        url,
        currentSceneGraph,
        createMessageNodes // Pass the checkbox state
      );
      if (conversationNodeId) {
        // Save to recent imports
        saveToRecentImports(url);
        setUrl(""); // Clear input after successful import
      }
    } catch (error) {
      console.error("Error in ChatGPT import:", error);
      addNotification({
        message: "Failed to import ChatGPT conversation",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const conversationNodeId = await importChatGptFromFile(
        file,
        currentSceneGraph,
        createMessageNodes // Pass the checkbox state
      );
      if (conversationNodeId) {
        const newRenderingConfig = GET_DEFAULT_RENDERING_CONFIG(
          getCurrentSceneGraph().getGraph(),
          getCurrentSceneGraph().getDisplayConfig()
        );
        getCurrentSceneGraph().getData().displayConfig = newRenderingConfig;
        getCurrentSceneGraph().notifyGraphChanged();
        addNotification({
          message: `Successfully imported conversation from ${file.name}`,
          type: "success",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error importing file:", error);
      addNotification({
        message: "Failed to import conversation from file",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <div className={`chatgpt-panel ${isDarkMode ? "dark" : ""}`}>
      <div className="chatgpt-panel-header">
        <MessageSquare size={18} />
        <span>Import ChatGPT Conversations</span>
      </div>

      <div className="chatgpt-panel-content">
        <p className="chatgpt-description">
          Import shared ChatGPT conversations to create a network of
          interconnected messages as graph nodes.
        </p>

        <div className="import-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={createMessageNodes}
              onChange={(e) => setCreateMessageNodes(e.target.checked)}
            />
            <span className="checkbox-label">
              Create individual nodes for each message
            </span>
            {/* <span className="option-description">
              {createMessageNodes
                ? "Each message will be its own node in the graph."
                : "Only one node with the full conversation will be created."}
            </span> */}
          </label>
        </div>

        <div className="chatgpt-url-container">
          <input
            type="text"
            className="chatgpt-url-input"
            placeholder="https://chatgpt.com/share/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            className="chatgpt-import-button"
            onClick={handleImport}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? "Importing..." : "Import"}
          </button>
        </div>

        <div className="chatgpt-file-import">
          <p className="chatgpt-or">Or import from file</p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <button
            className="chatgpt-file-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <FileJson size={16} />
            Select JSON File
          </button>
        </div>

        {recentImports.length > 0 && (
          <div className="chatgpt-recent">
            <h4>Recent Imports</h4>
            <ul className="chatgpt-recent-list">
              {recentImports.map((recentUrl, index) => {
                // Extract the ID from the URL for display
                const urlId = recentUrl.split("/").pop();
                return (
                  <li key={index} className="chatgpt-recent-item">
                    <button
                      className="chatgpt-recent-button"
                      onClick={() => setUrl(recentUrl)}
                      title={recentUrl}
                    >
                      <MessageSquare size={14} />
                      <span>{urlId}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatGptPanel;
