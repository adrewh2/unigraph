import React from "react";

type WikipediaArticleViewerProps = {
  title: string; // Wikipedia article title, e.g. "Factor graph"
  language?: string; // e.g. "en"
  style?: React.CSSProperties;
};

export const WikipediaArticleViewer: React.FC<WikipediaArticleViewerProps> = ({
  title,
  language = "en",
  style = {},
}) => {
  const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://${language}.wikipedia.org/wiki/${encodedTitle}`;

  return (
    <iframe
      src={url}
      title={`Wikipedia: ${title}`}
      style={{
        width: "100%",
        minHeight: 600,
        border: "none",
        borderRadius: 8,
        background: "#fff",
        ...style,
      }}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      loading="lazy"
    />
  );
};

export default WikipediaArticleViewer;
