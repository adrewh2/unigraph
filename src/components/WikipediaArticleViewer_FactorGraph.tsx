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
          let htmlContent = data.parse.text["*"];
          // Inject iframe after "An example factor graph"
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, "text/html");
          const heading = Array.from(
            doc.querySelectorAll("h2, h3, h4, h5, h6")
          ).find(
            (el) =>
              el.textContent &&
              el.textContent
                .trim()
                .toLowerCase()
                .includes("an example factor graph")
          );
          if (heading && heading.parentNode) {
            const iframe = doc.createElement("iframe");
            iframe.src = "https://unigraph.vercel.app/?graph=AcademicsKG";
            iframe.width = "100%";
            iframe.height = "400";
            iframe.style.display = "block";
            iframe.style.border = "1px solid #ccc";
            iframe.style.margin = "16px 0";
            iframe.style.background = "#fff";
            iframe.setAttribute("title", "Unigraph AcademicsKG");
            // Insert after heading's next sibling if possible, else after heading
            if (heading.nextElementSibling) {
              heading.parentNode.insertBefore(iframe, heading.nextElementSibling);
            } else {
              heading.parentNode.appendChild(iframe);
            }
            htmlContent = doc.body.innerHTML;
          }
          if (!cancelled) setHtml(htmlContent);
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
        overflow: "auto",
        maxHeight: "80vh",
        ...style,
      }}
      className="mw-parser-output wikipedia-article-viewer"
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    />
  );
};

export default WikipediaArticleViewer_FactorGraph;
