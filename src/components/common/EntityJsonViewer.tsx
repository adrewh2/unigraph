import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

interface EntityJsonViewerProps {
  entity: any;
  onClose?: () => void;
}

const EntityJsonViewer: React.FC<EntityJsonViewerProps> = ({
  entity,
  onClose,
}) => {
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!entity) return;

    const entityData = entity.getData?.() || entity.data || entity;
    const entityId = entity.getId?.() || entity.id || "Unknown";
    const entityType = entity.getType?.() || entity.type || "Unknown";

    const fullEntity = {
      id: entityId,
      type: entityType,
      data: entityData,
    };

    // Create a new tab
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;

    windowRef.current = newWindow;

    // Create a React root in the new tab
    const root = newWindow.document.createElement("div");
    root.id = "json-viewer-root";
    newWindow.document.body.appendChild(root);

    // Add basic styles to the new window
    const style = newWindow.document.createElement("style");
    style.textContent = `
      body { 
        font-family: 'Courier New', monospace; 
        background: #1e1e1e; 
        color: #d4d4d4; 
        padding: 20px; 
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }
      #json-viewer-root {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #404040;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }
      .header h1 {
        margin: 0;
        color: #4ec9b0;
        font-size: 18px;
      }
      .header p {
        margin: 5px 0 0 0;
        color: #9cdcfe;
        font-size: 12px;
      }
      .controls {
        display: flex;
        gap: 10px;
      }
      .copy-btn {
        background: #007acc;
        border: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 12px;
      }
      .copy-btn:hover {
        background: #005a9e;
      }
      .close-btn {
        background: #404040;
        border: none;
        color: #d4d4d4;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        font-size: 12px;
      }
      .close-btn:hover {
        background: #505050;
      }
      .json-content {
        background: #2d2d2d; 
        padding: 20px; 
        border-radius: 8px; 
        overflow: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        flex: 1;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
      }
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .notification.show {
        opacity: 1;
      }
    `;
    newWindow.document.head.appendChild(style);

    // Create the React component content
    const JsonViewerContent = () => {
      const [showNotification, setShowNotification] = React.useState(false);

      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(
            JSON.stringify(fullEntity, null, 2)
          );
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        } catch (err) {
          console.error("Failed to copy: ", err);
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = JSON.stringify(fullEntity, null, 2);
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
        }
      };

      const handleClose = () => {
        newWindow.close();
      };

      return (
        <>
          <div className="header">
            <div>
              <h1>Entity: {entityId}</h1>
              <p>Type: {entityType}</p>
            </div>
            <div className="controls">
              <button className="copy-btn" onClick={copyToClipboard}>
                Copy JSON
              </button>
              <button className="close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
          <div className="json-content">
            {JSON.stringify(fullEntity, null, 2)}
          </div>
          {showNotification && (
            <div className="notification show">JSON copied to clipboard!</div>
          )}
        </>
      );
    };

    // Render the React component in the new window
    const rootElement = createRoot(root);
    rootElement.render(<JsonViewerContent />);

    // Handle window close
    const handleWindowClose = () => {
      onClose?.();
    };

    newWindow.addEventListener("beforeunload", handleWindowClose);

    // Cleanup function
    return () => {
      if (newWindow && !newWindow.closed) {
        newWindow.removeEventListener("beforeunload", handleWindowClose);
        newWindow.close();
      }
    };
  }, [entity, onClose]);

  // This component doesn't render anything in the main window
  return null;
};

export default EntityJsonViewer;
