import React, { useState } from "react";
import FileTreeView from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import "./DocumentationView.css";

const DocumentationView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="documentation-view">
      <div className="documentation-sidebar">
        <FileTreeView
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      </div>
      <div className="documentation-content">
        {selectedFile ? (
          <MarkdownViewer filename={selectedFile} />
        ) : (
          <div className="documentation-welcome">
            <h2>Documentation Browser</h2>
            <p>
              Select a file from the sidebar to view its contents. The
              documentation includes guides, tutorials, and reference materials
              for Unigraph.
            </p>
            <div className="documentation-features">
              <h3>Available Documentation</h3>
              <ul>
                <li>
                  <strong>Overview</strong> - Introduction and motivation for
                  Unigraph
                </li>
                <li>
                  <strong>User Guide</strong> - How to use Unigraph features
                </li>
                <li>
                  <strong>Quick Guides</strong> - Step-by-step tutorials
                </li>
                <li>
                  <strong>Markdowns</strong> - Additional documentation files
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationView;
