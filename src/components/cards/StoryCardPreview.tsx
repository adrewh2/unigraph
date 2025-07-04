import React from "react";
import MarkdownViewer from "../common/MarkdownViewer";
import { StoryNode } from "../types/StoryTypes";

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
  return (
    <div
      key={node.id}
      className="child-card"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "100%",
      }}
    >
      <h3
        className="child-card-title"
        style={{
          margin: "0 0 12px 0",
          overflow: "visible",
          wordWrap: "break-word",
          hyphens: "auto",
          lineHeight: "1.3",
          maxHeight: "2.6em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {node.title}
      </h3>

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
              overrideMarkdown={markdownContent}
              imageStyle={{
                maxWidth: "180px",
                maxHeight: "140px",
                objectFit: "contain",
                display: "block",
                margin: "0 auto 12px auto",
              }}
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
