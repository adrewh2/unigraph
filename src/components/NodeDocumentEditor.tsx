import { X } from "lucide-react";
import React from "react";
import { NodeId } from "../core/model/Node";
import { getCurrentSceneGraph } from "../store/appConfigStore";
import { useDocument, useDocumentStore } from "../store/documentStore";
import LexicalEditorV2 from "./LexicalEditor";
import "./NodeDocumentEditor.css";

interface NodeDocumentEditorProps {
  nodeId: NodeId;
  onClose: () => void;
}

const NodeDocumentEditor: React.FC<NodeDocumentEditorProps> = ({
  nodeId,
  onClose,
}) => {
  const sceneGraph = getCurrentSceneGraph();
  const node = sceneGraph.getNodeById(nodeId);
  const document = useDocument(nodeId);
  const { updateDocument } = useDocumentStore();

  // Get node details
  const nodeLabel = node?.getLabel() || `Node ${nodeId}`;
  const nodeType = node?.getType() || "Unknown";
  const nodeTags = Array.from(node?.getTags() || []);

  if (!document) {
    return (
      <div className="node-document-editor">
        <div className="node-document-header">
          <div className="node-document-title">
            <h2>{nodeLabel}</h2>
            <span className="node-document-type">{nodeType}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="node-document-loading">
          Document not found. Please try again.
        </div>
      </div>
    );
  }

  const handleSave = (content: string, tags?: string[]) => {
    // Save to document store
    updateDocument(nodeId, content, document.lexicalState, tags || nodeTags);

    // Also save to node's userData
    const node = sceneGraph.getNodeById(nodeId);
    if (node) {
      node.setUserData("document", {
        content,
        lexicalState: document.lexicalState,
        tags: tags || nodeTags,
        lastModified: Date.now(),
      });
    }
  };

  return (
    <div className="node-document-editor">
      <div className="node-document-header">
        <div className="node-document-title">
          <h2>{nodeLabel}</h2>
          <span className="node-document-type">{nodeType}</span>
        </div>
        <div className="node-document-actions">
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {nodeTags.length > 0 && (
        <div className="node-document-tags">
          {nodeTags.map((tag) => (
            <span key={tag} className="node-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="node-document-content">
        <LexicalEditorV2
          id={document.id}
          initialContent={document.content}
          onSave={handleSave}
          autoSaveInterval={10000}
        />
      </div>
    </div>
  );
};

export default NodeDocumentEditor;
