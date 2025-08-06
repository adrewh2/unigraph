export interface AnnotationHighlight {
  id: string;
  data: {
    selected_text: string;
    comment?: string;
    secondary_comment?: string;
    tags?: string[];
  };
}

export const createAnnotationHighlightingFunction = (annotations: any[]) => {
  return function () {
    console.log(
      "Annotation highlighting function executing with",
      annotations.length,
      "annotations"
    );

    let isHighlighting = false;
    let textNodesCache: Text[] | null = null;
    let highlightTimeout: number | null = null;

    function debounceHighlight(fn: () => void, delay: number) {
      return function () {
        if (highlightTimeout) {
          clearTimeout(highlightTimeout);
        }
        highlightTimeout = window.setTimeout(fn, delay);
      };
    }

    function clearExistingHighlights() {
      const existingHighlights = document.querySelectorAll(
        ".annotation-highlight"
      );
      if (existingHighlights.length > 0) {
        console.log(
          "Clearing",
          existingHighlights.length,
          "existing highlights"
        );
        existingHighlights.forEach(function (highlight) {
          const parent = highlight.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(highlight.textContent || ""),
              highlight
            );
            parent.normalize();
          }
        });
        textNodesCache = null;
      }
    }

    function getAllTextNodes(): Text[] {
      if (textNodesCache) {
        console.log("Using cached text nodes:", textNodesCache.length);
        return textNodesCache;
      }
      if (!document.body) {
        console.warn("Document body not available");
        return [];
      }
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode()) !== null) {
        textNodes.push(node as Text);
      }
      textNodesCache = textNodes;
      console.log("Cached", textNodes.length, "text nodes");
      return textNodes;
    }

    function highlightAnnotationsBatch() {
      if (isHighlighting) {
        console.log("Highlighting already in progress, skipping");
        return;
      }
      isHighlighting = true;
      console.log(
        "Starting batch highlighting for",
        annotations.length,
        "annotations"
      );

      try {
        clearExistingHighlights();
        const textNodes = getAllTextNodes();

        if (textNodes.length === 0) {
          console.warn("No text nodes found for highlighting");
          return;
        }

        console.log(
          "Sample text from document:",
          textNodes[0]?.textContent?.substring(0, 200) + "..."
        );

        let totalHighlights = 0;
        annotations.forEach(function (annotation, index) {
          if (annotation.data && annotation.data.selected_text) {
            const searchText = annotation.data.selected_text;
            const annotationId = annotation.id;
            console.log(
              "Processing annotation",
              index + 1,
              "/",
              annotations.length,
              ":",
              annotationId
            );
            console.log("Searching for text:", searchText);

            try {
              let highlightCount = 0;
              let foundNodes = 0;

              textNodes.forEach(function (textNode) {
                const text = textNode.textContent;
                if (text && text.includes(searchText)) {
                  foundNodes++;
                  console.log(
                    "Found text match in node:",
                    text.substring(0, 200) + "..."
                  );

                  // Simple string replacement approach
                  const index = text.indexOf(searchText);
                  if (index !== -1) {
                    const before = text.substring(0, index);
                    const after = text.substring(index + searchText.length);

                    const fragment = document.createDocumentFragment();
                    if (before) {
                      fragment.appendChild(document.createTextNode(before));
                    }

                    const span = document.createElement("span");
                    span.className = "annotation-highlight";
                    span.setAttribute("data-annotation-id", annotationId);
                    span.style.backgroundColor = "#ffeb3b";
                    span.style.cursor = "pointer";
                    span.style.borderRadius = "2px";
                    span.style.padding = "1px 2px";
                    span.style.transition = "background-color 0.2s ease";
                    span.textContent = searchText;
                    span.addEventListener("click", function () {
                      console.log("Annotation clicked:", annotationId);
                      window.parent.postMessage(
                        { type: "show-annotation", annotationId: annotationId },
                        "*"
                      );
                    });
                    fragment.appendChild(span);

                    if (after) {
                      fragment.appendChild(document.createTextNode(after));
                    }

                    if (textNode.parentNode) {
                      textNode.parentNode.replaceChild(fragment, textNode);
                    }

                    highlightCount++;
                  }
                }
              });

              totalHighlights += highlightCount;
              console.log(
                "Found",
                foundNodes,
                "matching nodes for annotation:",
                annotationId
              );
              if (highlightCount > 0) {
                console.log(
                  "Highlighted",
                  highlightCount,
                  "instances for annotation:",
                  annotationId
                );
              } else if (foundNodes === 0) {
                console.warn(
                  "No text nodes contained the search text for annotation:",
                  annotationId
                );
                console.warn("Search text was:", searchText);
              }
            } catch (error) {
              console.error(
                "Error processing annotation",
                annotationId,
                ":",
                error
              );
              console.warn("Problematic search text:", searchText);
              console.warn("Skipping this annotation due to error");
            }
          }
        });

        console.log(
          "Batch highlighting completed:",
          totalHighlights,
          "total highlights created"
        );
        if (totalHighlights === 0) {
          console.warn(
            "No highlights were created - text may not match exactly"
          );
        }
      } catch (error) {
        console.error("Error during batch highlighting:", error);
      } finally {
        isHighlighting = false;
      }
    }

    const debouncedHighlight = debounceHighlight(
      highlightAnnotationsBatch,
      100
    );

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", debouncedHighlight);
    } else if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      console.log("Document ready, starting highlighting");
      setTimeout(debouncedHighlight, 50);
    }

    window.addEventListener("load", function () {
      console.log("Window loaded, re-highlighting if needed");
      setTimeout(function () {
        if (
          document.querySelectorAll(".annotation-highlight").length === 0 &&
          annotations.length > 0
        ) {
          debouncedHighlight();
        }
      }, 200);
    });

    // Expose the function globally so it can be called from outside
    (window as any).highlightAnnotations = debouncedHighlight;
    console.log("Annotation highlighting function setup complete");
  };
};
