import React, { useEffect, useRef, useState } from "react";
import {
  fixWikipediaLinks,
  getUnigraphBaseUrl,
  replaceUnigraphUrlsWithLocalhost,
} from "../utils/urlUtils";

// Add a utility function to extract article title from Wikipedia URLs
const extractWikipediaTitle = (url: string): string | null => {
  // Handle both relative and absolute URLs
  const wikiPathRegex = /\/wiki\/([^#?]*)/;
  const match = url.match(wikiPathRegex);
  return match ? decodeURIComponent(match[1].replace(/_/g, " ")) : null;
};

// Helper function to highlight keywords in HTML content
const highlightKeywordsFunc = (
  html: string,
  keywords: string[] = []
): string => {
  if (!keywords || keywords.length === 0) return html;

  let result = html;
  keywords.forEach((keyword) => {
    if (!keyword || keyword.trim() === "") return;

    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // This regex looks for the keyword between HTML tags
    const regex = new RegExp(`(>)([^<>]*?)(${safeKeyword})([^<>]*?)(<)`, "gi");
    result = result.replace(
      regex,
      (_, before, pre, match, post, after) =>
        `${before}${pre}<span style="background-color: yellow; color: black; border-radius: 2px; padding: 0 2px;">${match}</span>${post}${after}`
    );
  });

  return result;
};

type WikipediaArticleViewerFactorGraphProps = {
  style?: React.CSSProperties;
  highlightKeywords?: string[];
  initialArticle?: string;
};

export const WikipediaArticleViewer_FactorGraph: React.FC<
  WikipediaArticleViewerFactorGraphProps
> = ({
  style = {},
  highlightKeywords = [],
  initialArticle = "Factor graph",
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string>(initialArticle);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Add breadcrumb history state
  const [articleHistory, setArticleHistory] = useState<string[]>([
    initialArticle,
  ]);
  const cssInjected = useRef(false);
  const language = "en";

  // Wikipedia CSS links for <link rel="stylesheet" ... />
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

  // Function to fetch and display a Wikipedia article
  const fetchWikipediaArticle = React.useCallback(
    async (articleTitle: string) => {
      setIsLoading(true);
      setError(null);
      let cancelled = false;

      try {
        const encodedTitle = encodeURIComponent(
          articleTitle.replace(/ /g, "_")
        );
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&origin=*&prop=text`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (cancelled) return;

        if (data.parse && data.parse.text) {
          let htmlContent = data.parse.text["*"];

          // Fix Wikipedia relative URLs to make links work
          htmlContent = fixWikipediaLinks(htmlContent, language);

          // Apply keyword highlighting
          if (highlightKeywords && highlightKeywords.length > 0) {
            htmlContent = highlightKeywordsFunc(htmlContent, highlightKeywords);
          }

          // Force insert the iframe without relying on heading detection
          const unigraphBaseUrl = getUnigraphBaseUrl();

          // Only add Unigraph visualization for Factor graph article
          if (articleTitle.toLowerCase() === "factor graph") {
            const unigraphIframe = `
              <div style="margin: 20px 0; display: block; width: 100%;">
                <h4>Interactive Unigraph Visualization</h4>
                <iframe 
                  src="${unigraphBaseUrl}/?graph=unigraph&view=ForceGraph3d" 
                  width="100%" 
                  height="500" 
                  style="border: 1px solid #ccc; display: block; margin: 0 auto; background: #fff;" 
                  title="Unigraph unigraph"
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
          }

          setHtml(replaceUnigraphUrlsWithLocalhost(htmlContent));
        } else {
          setError("Article not found or could not be loaded.");
        }
      } catch (e) {
        if (!cancelled) setError(`Failed to fetch Wikipedia article: ${e}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }

      return () => {
        cancelled = true;
      };
    },
    [language, highlightKeywords]
  );

  // Load the initial article
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    fetchWikipediaArticle(currentArticle).then((fn) => {
      cleanupFn = fn;
    });
    return () => {
      if (cleanupFn) cleanupFn();
    };
  }, [currentArticle, fetchWikipediaArticle]);

  // Navigate to a specific article with history tracking
  const navigateToArticle = (title: string) => {
    // If navigating to a new article that's not the current one
    if (title !== currentArticle) {
      setCurrentArticle(title);

      // Update history - if we're navigating to an article already in our history,
      // truncate the history up to that point
      const existingIndex = articleHistory.indexOf(title);
      if (existingIndex >= 0) {
        // Article exists in history, truncate to that point
        setArticleHistory(articleHistory.slice(0, existingIndex + 1));
      } else {
        // New article, add to history
        setArticleHistory((prevHistory) => [...prevHistory, title]);
      }

      // Scroll back to top
      window.scrollTo(0, 0);
    }
  };

  // Event handler for link clicks
  const handleLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (anchor && anchor.href) {
      const title = extractWikipediaTitle(anchor.href);
      if (title) {
        e.preventDefault();
        navigateToArticle(title);
      }
    }
  };

  if (error) return <div style={style}>Error: {error}</div>;
  if (isLoading) return <div style={style}>Loading...</div>;

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
    >
      {/* Add a navigation header with breadcrumbs */}
      <div
        style={{
          marginBottom: 20,
          borderBottom: "1px solid #ddd",
          paddingBottom: 10,
        }}
      >
        <h2>{currentArticle}</h2>

        {/* Breadcrumb trail */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 10,
            fontSize: "0.9em",
          }}
        >
          <span style={{ marginRight: 8, color: "#666" }}>Path:</span>
          {articleHistory.map((article, index) => (
            <React.Fragment key={`${article}-${index}`}>
              {index > 0 && (
                <span style={{ margin: "0 8px", color: "#999" }}>&gt;</span>
              )}
              <button
                onClick={() => navigateToArticle(article)}
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  color: article === currentArticle ? "#333" : "#0645ad",
                  fontWeight: article === currentArticle ? "bold" : "normal",
                  textDecoration:
                    article === currentArticle ? "none" : "underline",
                }}
              >
                {article}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Render article content */}
      <div
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
        ref={(container) => {
          if (!container || !html) return;

          // Add click event listeners to all links in the container
          setTimeout(() => {
            // Attach click handlers to Wikipedia links
            container.querySelectorAll("a").forEach((link) => {
              // Remove existing listeners first to avoid duplicates
              link.removeEventListener(
                "click",
                handleLinkClick as EventListener
              );

              if (link.getAttribute("href")) {
                // If it's a Wikipedia article link, intercept it
                if (extractWikipediaTitle(link.href)) {
                  link.addEventListener(
                    "click",
                    handleLinkClick as EventListener
                  );
                } else {
                  // For external links, open in new tab
                  link.setAttribute("target", "_blank");
                }
              }
            });

            // Add Unigraph iframe for factor graph example if needed
            if (currentArticle.toLowerCase() === "factor graph") {
              // Find the target image with "Example factor graph" caption
              const images = container.querySelectorAll("img");
              let targetImage = null;

              for (const img of Array.from(images)) {
                // Check caption (could be in figcaption or nearby element)
                const caption =
                  img.closest("figure")?.querySelector("figcaption")
                    ?.textContent ||
                  img.alt ||
                  img.title ||
                  img.parentElement?.nextElementSibling?.textContent;

                if (
                  caption &&
                  caption.toLowerCase().includes("example factor graph")
                ) {
                  targetImage = img;
                  break;
                }

                // Also check parent figure or div that might contain the image
                const parentFigure = img.closest("figure, div.thumb");
                if (
                  parentFigure &&
                  parentFigure.textContent &&
                  parentFigure.textContent
                    .toLowerCase()
                    .includes("example factor graph")
                ) {
                  targetImage = img;
                  break;
                }
              }

              // If we found the image or its container
              if (targetImage) {
                const targetContainer =
                  targetImage.closest("figure, div.thumb") ||
                  targetImage.parentElement;
                if (targetContainer) {
                  console.log("Found target image for second iframe");

                  // Create second iframe using the utility function for base URL
                  const unigraphBaseUrl = getUnigraphBaseUrl();

                  const secondIframe = document.createElement("div");
                  secondIframe.innerHTML = `
                    <div style="margin: 20px 0; display: block; width: 100%;">
                      <h4>Interactive Unigraph Visualization (Factor Graph Example)</h4>
                      <iframe 
                        src="${unigraphBaseUrl}/?graph=unigraph&view=ForceGraph3d" 
                        width="100%" 
                        height="450" 
                        style="border: 1px solid #ccc; display: block; margin: 0 auto; background: #fff;" 
                        title="Unigraph Factor Graph Example"
                        allowfullscreen>
                      </iframe>
                    </div>
                  `;

                  // Insert after the image container
                  if (secondIframe.firstElementChild) {
                    targetContainer.insertAdjacentElement(
                      "afterend",
                      secondIframe.firstElementChild
                    );
                  }
                }
              }
            }
          }, 500); // Small delay to ensure DOM is ready
        }}
      />
    </div>
  );
};

export default WikipediaArticleViewer_FactorGraph;
