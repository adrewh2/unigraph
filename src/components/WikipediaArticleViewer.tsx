import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  fixWikipediaLinks,
  replaceUnigraphUrlsWithLocalhost,
} from "../utils/urlUtils";
import { DefinitionPopup, DefinitionPopupData } from "./common/DefinitionPopup";

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

// Helper to highlight terms in HTML (wrap with span)
const highlightCustomTerms = (
  html: string,
  terms: Record<string, string>
): string => {
  console.log("terms are ", terms);
  if (!terms || Object.keys(terms).length === 0) return html;
  const sortedTerms = Object.keys(terms).sort((a, b) => b.length - a.length);
  let result = html;
  sortedTerms.forEach((term) => {
    if (!term) return;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?<!<span[^>]*?>)\\b(${safeTerm})\\b(?![^<]*?</span>)`,
      "g"
    );
    result = result.replace(
      regex,
      `<span class="wikipedia-defined-term" data-term="$1">$1</span>`
    );
  });
  return result;
};

type WikipediaArticleViewerProps = {
  style?: React.CSSProperties;
  highlightKeywords?: string[];
  initialArticle?: string;
  customTerms?: Record<string, string>;
};

export const WikipediaArticleViewer: React.FC<WikipediaArticleViewerProps> = ({
  style = {},
  highlightKeywords = [],
  initialArticle = "Wikipedia",
  customTerms = {},
}) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string>(initialArticle);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [articleHistory, setArticleHistory] = useState<string[]>([
    initialArticle,
  ]);
  const cssInjected = useRef(false);
  const language = "en";
  const popupRef = useRef<HTMLDivElement>(null);
  const [terms] = useState<Record<string, string>>(customTerms);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [activeDefinition, setActiveDefinition] =
    useState<DefinitionPopupData | null>(null);

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

          // Highlight custom terms in the HTML
          htmlContent = highlightCustomTerms(htmlContent, terms);

          // Apply keyword highlighting
          if (highlightKeywords && highlightKeywords.length > 0) {
            htmlContent = highlightKeywordsFunc(htmlContent, highlightKeywords);
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
    [language, highlightKeywords, terms]
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

  // Enhanced handleMouseDown for popup dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeDefinition) return;

    // Only initiate drag on the header, not on the close button
    if ((e.target as HTMLElement).tagName === "BUTTON") return;

    setDragStart({
      x: e.clientX - activeDefinition.position.x,
      y: e.clientY - activeDefinition.position.y,
    });

    setActiveDefinition({
      ...activeDefinition,
      isDragging: true,
    });

    e.preventDefault();
  };

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragStart || !activeDefinition?.isDragging) return;

      setActiveDefinition((prev) =>
        prev
          ? {
              ...prev,
              position: {
                x: e.clientX - (dragStart?.x ?? 0),
                y: e.clientY - (dragStart?.y ?? 0),
              },
            }
          : prev
      );
    },
    [dragStart, activeDefinition?.isDragging]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!activeDefinition?.isDragging) return;

    setActiveDefinition((prev) =>
      prev
        ? {
            ...prev,
            isDragging: false,
          }
        : prev
    );

    setDragStart(null);
  }, [activeDefinition]);

  // Add global mouse move and up event listeners for dragging
  useEffect(() => {
    if (activeDefinition?.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDefinition, dragStart, handleMouseMove, handleMouseUp]);

  // Setup event handlers for term definition popups
  useEffect(() => {
    if (!contentRef.current || !html) return;

    const termElements = contentRef.current.querySelectorAll(
      ".wikipedia-defined-term"
    );

    if (termElements.length === 0) return;

    const handleTermClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const element = e.currentTarget as HTMLElement;
      const termText = element.getAttribute("data-term");
      if (!termText || !terms[termText]) return;

      const rect = element.getBoundingClientRect();
      const positionX = rect.left + rect.width / 2 + window.scrollX;
      const positionY = rect.top + window.scrollY - 24;

      if (activeDefinition && activeDefinition.term === termText) {
        setActiveDefinition(null);
      } else {
        setActiveDefinition({
          term: termText,
          definition: terms[termText],
          position: {
            x: positionX,
            y: positionY,
          },
          isDragging: false,
        });
      }
    };

    // Clean up previous listeners to prevent duplicates
    termElements.forEach((element) => {
      element.removeEventListener("click", handleTermClick as EventListener);
    });

    // Setup new listeners
    termElements.forEach((element) => {
      element.addEventListener("click", handleTermClick as EventListener);
      (element as HTMLElement).onclick = (e: any) => {
        handleTermClick(e);
      };
    });

    // Close popup when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDefinition && popupRef.current) {
        if (
          !popupRef.current.contains(e.target as Node) &&
          !Array.from(termElements).some((el) => el.contains(e.target as Node))
        ) {
          setActiveDefinition(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      termElements.forEach((element) => {
        element.removeEventListener("click", handleTermClick as EventListener);
        (element as HTMLElement).onclick = null;
      });
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [html, terms, activeDefinition]);

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
        ref={contentRef}
        dangerouslySetInnerHTML={html ? { __html: html } : undefined}
        onClick={(e) => {
          // Add direct click handler for term definitions
          const target = e.target as HTMLElement;
          if (target.classList.contains("wikipedia-defined-term")) {
            const termText = target.getAttribute("data-term");
            if (termText && terms[termText]) {
              e.preventDefault();
              e.stopPropagation();

              const rect = target.getBoundingClientRect();
              const positionX = rect.left + rect.width / 2 + window.scrollX;
              const positionY = rect.top + window.scrollY - 24;

              if (activeDefinition && activeDefinition.term === termText) {
                setActiveDefinition(null);
              } else {
                setActiveDefinition({
                  term: termText,
                  definition: terms[termText],
                  position: {
                    x: positionX,
                    y: positionY,
                  },
                  isDragging: false,
                });
              }
            }
          }
        }}
      />

      {/* Setup link handlers after render */}
      <div
        style={{ display: "none" }}
        ref={(el) => {
          if (!el || !contentRef.current || !html) return;

          // Attach click handlers to Wikipedia links
          setTimeout(() => {
            const container = contentRef.current;
            if (!container) return;

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
          }, 300);
        }}
      />

      {activeDefinition &&
        createPortal(
          <DefinitionPopup
            popup={activeDefinition}
            onClose={() => setActiveDefinition(null)}
            onMouseDown={handleMouseDown}
            popupRef={popupRef as React.RefObject<HTMLDivElement>}
          />,
          document.body
        )}
    </div>
  );
};

export default WikipediaArticleViewer;
