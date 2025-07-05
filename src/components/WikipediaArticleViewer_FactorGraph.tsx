import React, { useEffect, useRef, useState } from "react";

type WikipediaArticleViewerFactorGraphProps = {
  style?: React.CSSProperties;
  highlightKeywords?: string[];
};

export const WikipediaArticleViewer_FactorGraph: React.FC<
  WikipediaArticleViewerFactorGraphProps
> = ({ style = {} }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cssInjected = useRef(false);

  // Wikipedia CSS links for <link rel="stylesheet" ... />
  const language = "en";
  const cssLinks = [
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=site.styles&only=styles&skin=vector`,
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.content.parsoid|mediawiki.skinning.interface|mediawiki.skinning.content&only=styles&skin=vector`,
    `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=ext.cite.styles|ext.pygments&only=styles&skin=vector`,
  ];

  // Only inject CSS once per mount, and never remove it (prevents flicker)
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    cssLinks.forEach((href) => {
      if (!document.querySelector(`link[data-wiki-css][href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;
        link.setAttribute("data-wiki-css", "true");
        document.head.appendChild(link);
      }
    });
    // Do not remove CSS on unmount to avoid flicker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    // Only setHtml(null) if highlightKeywords changes, not on every render
    const fetchAndInject = async () => {
      try {
        const title = "Factor graph";
        const language = "en";
        const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&origin=*&prop=text`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.parse && data.parse.text) {
          if (!cancelled) setHtml(data.parse.text["*"]);
        } else {
          if (!cancelled) setError("Article not found or could not be loaded.");
        }
      } catch (e) {
        if (!cancelled) setError("Failed to fetch Wikipedia article." + e);
      }
    };
    fetchAndInject();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div style={style}>Error: {error}</div>;
  // Only show loading if html is null AND error is null (prevents flicker)
  if (html === null && !error) return <div style={style}>Loading...</div>;

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        maxWidth: 900,
        margin: "0 auto",
        ...style,
      }}
      className="mw-parser-output wikipedia-article-viewer"
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    />
  );
};

export default WikipediaArticleViewer_FactorGraph;
