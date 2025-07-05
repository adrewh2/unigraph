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

          // Force insert the iframe without relying on heading detection
          const unigraphIframe = `
            <div style="margin: 20px 0; display: block; width: 100%;">
              <h4>Interactive Unigraph Visualization</h4>
              <iframe 
                src="https://unigraph.vercel.app/?graph=AcademicsKG" 
                width="100%" 
                height="500" 
                style="border: 1px solid #ccc; display: block; margin: 0 auto; background: #fff;" 
                title="Unigraph AcademicsKG"
                allowfullscreen>
              </iframe>
            </div>
          `;

          // Find a good insertion point - either after an example heading or at a specific point in the document
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, "text/html");

          console.log(
            "Sections in article:",
            Array.from(doc.querySelectorAll("h2, h3, h4, h5, h6")).map((el) =>
              el.textContent?.replace(/\[.*?\]/g, "").trim()
            )
          );

          // Try multiple approaches to find the right location
          let insertionDone = false;

          // Approach 1: Look for example heading
          const heading = Array.from(
            doc.querySelectorAll("h2, h3, h4, h5, h6")
          ).find((el) => {
            const text =
              el.textContent
                ?.replace(/\[.*?\]/g, "")
                .trim()
                .toLowerCase() || "";
            return (
              text.includes("example factor graph") ||
              text.includes("example of factor graph")
            );
          });

          if (heading) {
            console.log("Found heading:", heading.textContent);
            const container = document.createElement("div");
            container.innerHTML = unigraphIframe;
            heading.insertAdjacentHTML("afterend", unigraphIframe);
            insertionDone = true;
            htmlContent = doc.documentElement.innerHTML;
          }

          // Approach 2: Insert after a specific paragraph
          if (!insertionDone) {
            // Find a paragraph containing "factor graph"
            const paragraphs = Array.from(doc.querySelectorAll("p"));
            const targetParagraph = paragraphs.find((p) =>
              p.textContent?.toLowerCase().includes("factor graph")
            );

            if (targetParagraph) {
              console.log(
                "Inserting after paragraph containing 'factor graph'"
              );
              targetParagraph.insertAdjacentHTML("afterend", unigraphIframe);
              insertionDone = true;
              htmlContent = doc.documentElement.innerHTML;
            }
          }

          // Approach 3: Fallback - insert at the beginning of the article
          if (!insertionDone) {
            console.log("Fallback: Inserting at the beginning");
            const firstElem = doc.querySelector(".mw-parser-output");
            if (firstElem) {
              firstElem.insertAdjacentHTML("afterbegin", unigraphIframe);
              htmlContent = doc.documentElement.innerHTML;
            } else {
              // Last resort - just prepend to the content
              htmlContent = unigraphIframe + htmlContent;
            }
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
