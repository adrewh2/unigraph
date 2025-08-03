import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useCallback, useMemo, useState } from "react";
import FileTreeView from "../common/FileTreeView";
import MarkdownViewer from "../common/MarkdownViewer";
import ResizableSplitter from "../common/ResizableSplitter";
import "./DocumentationView.css";

const DocumentationView: React.FC = () => {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const handleFileSelect = useCallback((filePath: string) => {
    setSelectedFile(filePath);
  }, []);

  const handleWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  const leftPanel = useMemo(
    () => (
      <div
        className="documentation-sidebar"
        style={{
          backgroundColor: getColor(theme.colors, "backgroundSecondary"),
          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
          height: "100%",
        }}
      >
        <FileTreeView
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
        />
      </div>
    ),
    [theme.colors, handleFileSelect, selectedFile]
  );

  const rightPanel = useMemo(
    () => (
      <div
        className="documentation-content"
        style={{
          height: "100%",
          overflow: "auto",
        }}
      >
        {selectedFile ? (
          <div style={{ height: "100%" }}>
            <MarkdownViewer filename={selectedFile} />
          </div>
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
    ),
    [selectedFile, theme.colors]
  );

  return (
    <div
      className="documentation-view"
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        height: "100%",
        width: "100%",
      }}
    >
      <ResizableSplitter
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        leftPanelWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
        minLeftWidth={200}
        maxLeftWidth={600}
        splitterWidth={6}
      />
    </div>
  );
};

export default DocumentationView;
