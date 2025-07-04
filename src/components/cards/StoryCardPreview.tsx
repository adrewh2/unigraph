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
    <div key={node.id} className="child-card" onClick={onClick}>
      <h3 className="child-card-title">{node.title}</h3>

      <div
        style={{
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          position: "relative",
        }}
      >
        {node.markdownFile ? (
          <div
            style={{
              overflow: "hidden",
              maxHeight: "100%",
              width: "100%",
            }}
          >
            <MarkdownViewer
              filename={node.markdownFile}
              excerpt={true}
              excerptLength={250}
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
          <p className="child-card-description">{node.description}</p>
        )}
      </div>
    </div>
  );
};

export default StoryCardPreview;
