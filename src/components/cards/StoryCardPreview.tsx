import React from "react";
import MarkdownViewer from "../common/MarkdownViewer";
import { StoryNode } from "../types/StoryTypes";
import { extractFirstImageSrc, removeFirstImage } from "../utils/markdownUtils";

interface StoryCardPreviewProps {
  node: StoryNode;
  onClick: () => void;
  markdownContent?: string;
}

const StoryCardPreview: React.FC<StoryCardPreviewProps> = ({
  node,
  onClick,
  markdownContent,
}) => {
  let firstImageSrc: string | null = null;
  let markdownWithoutFirstImage: string | undefined = undefined;

  if (markdownContent) {
    firstImageSrc = extractFirstImageSrc(markdownContent);
    markdownWithoutFirstImage = removeFirstImage(markdownContent);
  }

  return (
    <div
      key={node.id}
      className="child-card"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent content from overflowing
        maxHeight: "100%", // Ensure it doesn't grow beyond container
      }}
    >
      <h3
        className="child-card-title"
        style={{
          margin: "0 0 12px 0",
          // Updated styles to allow text wrapping
          overflow: "visible",
          wordWrap: "break-word",
          hyphens: "auto",
          lineHeight: "1.3",
          maxHeight: "2.6em", // Limit to approximately 2 lines
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {node.title}
      </h3>

      {firstImageSrc && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
            flexShrink: 0, // Prevent image from shrinking
          }}
        >
          <img
            src={firstImageSrc}
            alt={node.title}
            style={{
              maxWidth: "90%",
              maxHeight: 140,
              objectFit: "contain",
              display: "block",
              borderRadius: 8,
              background: "#f5f7fa",
            }}
          />
        </div>
      )}

      <div
        style={{
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
        }}
      >
        {node.markdownFile ? (
          <div style={{ overflow: "hidden", maxHeight: "100%" }}>
            <MarkdownViewer
              filename={node.markdownFile}
              excerpt={true}
              excerptLength={150}
              overrideMarkdown={markdownWithoutFirstImage}
            />
          </div>
        ) : (
          <p
            className="child-card-description"
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
            }}
          >
            {node.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StoryCardPreview;
