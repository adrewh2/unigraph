import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useState } from "react";
import FileTreeView from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import "./DocumentationView.css";

const DocumentationView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <div
      className="documentation-view"
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
      }}
    >
      <div
        className="documentation-sidebar"
        style={{
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <FileTreeView
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      </div>
      <div className="documentation-content">
        {selectedFile ? (
          <MarkdownViewer filename={selectedFile} />
        ) : (
          <div
            className="documentation-welcome"
            style={{
              color: getColor(theme.colors, "text"),
            }}
          >
            <h2
              style={{
                color: getColor(theme.colors, "text"),
              }}
            >
              Documentation Browser
            </h2>
            <p
              style={{
                color: getColor(theme.colors, "textSecondary"),
              }}
            >
              Select a file from the sidebar to view its contents. The
              documentation includes guides, tutorials, and reference materials
              for Unigraph.
            </p>
            <div
              className="documentation-features"
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              <h3
                style={{
                  color: getColor(theme.colors, "text"),
                }}
              >
                Available Documentation
              </h3>
              <ul>
                <li
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                  }}
                >
                  <strong style={{ color: getColor(theme.colors, "text") }}>
                    Overview
                  </strong>{" "}
                  - Introduction and motivation for Unigraph
                </li>
                <li
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                  }}
                >
                  <strong style={{ color: getColor(theme.colors, "text") }}>
                    User Guide
                  </strong>{" "}
                  - How to use Unigraph features
                </li>
                <li
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                  }}
                >
                  <strong style={{ color: getColor(theme.colors, "text") }}>
                    Quick Guides
                  </strong>{" "}
                  - Step-by-step tutorials
                </li>
                <li
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                  }}
                >
                  <strong style={{ color: getColor(theme.colors, "text") }}>
                    Markdowns
                  </strong>{" "}
                  - Additional documentation files
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
