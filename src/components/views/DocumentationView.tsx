import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useCallback, useMemo, useState } from "react";
import { getContrastingTextColors } from "../../utils/colorUtils";
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

  // Get dynamic text colors based on background
  const backgroundColor = getColor(theme.colors, "background");
  const textColors = getContrastingTextColors(backgroundColor);

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
              color: textColors.primary,
            }}
          >
            <h2
              style={{
                color: textColors.primary,
              }}
            >
              Documentation Browser
            </h2>
            <p
              style={{
                color: textColors.secondary,
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
                  color: textColors.primary,
                }}
              >
                Available Documentation
              </h3>
              <ul>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    Overview
                  </strong>{" "}
                  - Introduction and motivation for Unigraph
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    User Guide
                  </strong>{" "}
                  - How to use Unigraph features
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
                    Quick Guides
                  </strong>{" "}
                  - Step-by-step tutorials
                </li>
                <li
                  style={{
                    color: textColors.secondary,
                  }}
                >
                  <strong style={{ color: textColors.primary }}>
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
    [selectedFile, theme.colors, textColors]
  );

  return (
    <div
      className="documentation-view"
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: textColors.primary,
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
