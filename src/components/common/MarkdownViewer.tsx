import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import React, { useEffect, useRef, useState } from "react";
import "./MarkdownViewer.css"; // Import CSS file

// Define interfaces for our popup
interface DefinitionPopup {
  term: string;
  definition: string;
  position: { x: number; y: number };
}

interface MarkdownViewerProps {
  filename: string;
  excerpt?: boolean;
  excerptLength?: number;
}

function MarkdownViewer({
  filename,
  excerpt = false,
  excerptLength = 150,
}: MarkdownViewerProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState<Record<string, string>>({});
  const [activeDefinition, setActiveDefinition] =
    useState<DefinitionPopup | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Configure marked with proper LaTeX support
    const renderer = {
      code(this: any, codeObj: { text: string; lang?: string }) {
        const { text, lang } = codeObj;
        if (lang === "latex" || lang === "math" || lang === "tex") {
          try {
            const renderedLatex = katex.renderToString(text, {
              displayMode: true,
              throwOnError: false,
            });
            return `<div class="latex-block">${renderedLatex}</div>`;
          } catch (error) {
            console.error("LaTeX rendering error:", error);
            return `<div class="latex-error">LaTeX rendering error: ${error instanceof Error ? error.message : String(error)}</div>`;
          }
        }
        return `<pre><code class="language-${lang}">${text}</code></pre>`;
      },

      // Add custom text renderer to handle term linking
      text(this: any, token: any) {
        // token: Text | Escape
        // This will be populated once we have the terms
        return token.text;
      },
    };

    marked.use({ renderer });

    // Function to parse YAML frontmatter
    const parseFrontmatter = (
      markdown: string
    ): {
      content: string;
      metadata: Record<string, any>;
    } => {
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
      const match = markdown.match(frontmatterRegex);

      if (!match) {
        return { content: markdown, metadata: {} };
      }

      try {
        // Basic YAML parsing (for simple key-value pairs)
        const yamlContent = match[1];
        const metadata: Record<string, any> = {};

        // Parse simple key-value pairs
        yamlContent.split("\n").forEach((line) => {
          const [key, ...valueParts] = line
            .split(":")
            .map((part) => part.trim());
          if (key && valueParts.length) {
            const value = valueParts.join(":").trim();
            metadata[key] = value;
          }
        });

        // Parse terms if they exist
        if (metadata.terms && typeof metadata.terms === "string") {
          try {
            // Format expected: term1: definition1, term2: definition2
            const termsObj: Record<string, string> = {};
            metadata.terms.split(",").forEach((termPair: string) => {
              const [term, definition] = termPair
                .split(":")
                .map((s) => s.trim());
              if (term && definition) {
                termsObj[term] = definition;
              }
            });
            metadata.terms = termsObj;
          } catch (e) {
            console.error("Error parsing terms:", e);
            metadata.terms = {};
          }
        }

        return {
          content: match[2],
          metadata,
        };
      } catch (error) {
        console.error("Error parsing frontmatter:", error);
        return { content: markdown, metadata: {} };
      }
    };

    // Process text to handle inline LaTeX and terms
    const processText = (
      text: string,
      definedTerms: Record<string, string>
    ) => {
      // Handle display equations: $$...$$
      let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: true,
            throwOnError: false,
          });
        } catch (error) {
          console.error("Display LaTeX error:", error);
          return `$$${latex}$$`;
        }
      });

      // Handle inline equations: $...$
      processed = processed.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
        try {
          return katex.renderToString(latex, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (error) {
          console.error("Inline LaTeX error:", error);
          return `$${latex}$`;
        }
      });

      // Process terms for highlighting
      if (Object.keys(definedTerms).length > 0) {
        // Create regex that matches whole words that are defined terms
        const termRegex = new RegExp(
          "\\b(" +
            Object.keys(definedTerms)
              .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
              .join("|") +
            ")\\b",
          "gi"
        );

        processed = processed.replace(termRegex, (match) => {
          const term = match;
          // Create a span with data attributes for the term
          return `<span class="defined-term" data-term="${term}">${term}</span>`;
        });
      }

      return processed;
    };

    // Fix the path construction
    const normalizedFilename = filename.startsWith("/")
      ? filename.substring(1)
      : filename;
    const filePath = normalizedFilename.endsWith(".md")
      ? `/storyCardFiles/${normalizedFilename}`
      : `/storyCardFiles/${normalizedFilename}.md`;

    console.log(`Attempting to fetch markdown from: ${filePath}`);

    // Try loading the file
    fetch(filePath)
      .then((res) => {
        if (!res.ok) {
          // Try alternate path
          const alternatePath = `/storyCards/${normalizedFilename}${
            !normalizedFilename.endsWith(".md") ? ".md" : ""
          }`;
          console.log(`First path failed, trying: ${alternatePath}`);
          return fetch(alternatePath).then((altRes) => {
            if (!altRes.ok) {
              throw new Error(`Failed to load markdown from both paths`);
            }
            return altRes.text();
          });
        }
        return res.text();
      })
      .then((markdown) => {
        // Parse frontmatter to extract metadata including terms
        const { content, metadata } = parseFrontmatter(markdown);

        // Extract terms from metadata
        const definedTerms: Record<string, string> = metadata.terms || {};
        setTerms(definedTerms);

        // Pre-process markdown for LaTeX and terms
        const processedMarkdown = processText(content, definedTerms);

        // If excerpt is requested, truncate the content
        const finalContent = excerpt
          ? processedMarkdown.substring(0, excerptLength) + "..."
          : processedMarkdown;

        // Parse markdown to HTML
        const parsed = marked.parse(finalContent);
        if (parsed instanceof Promise) {
          parsed.then((htmlStr) => {
            setHtml(htmlStr);
            setLoading(false);
          });
        } else {
          setHtml(parsed);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading markdown:", err);
        setError(
          `Error loading markdown: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setLoading(false);
      });
  }, [filename, excerpt, excerptLength]);

  // Add event handlers after content is rendered
  useEffect(() => {
    if (contentRef.current && !loading) {
      console.log("Setting up term click handlers");

      // Use setTimeout to ensure DOM is fully rendered before attaching events
      setTimeout(() => {
        // Find all defined terms
        const termElements = contentRef.current?.querySelectorAll(".defined-term");
        console.log(`Found ${termElements?.length || 0} term elements`);

        if (!termElements || termElements.length === 0) return;

        // Add click handlers to each term
        const handleTermClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();

          const element = e.currentTarget as HTMLElement;
          const termText = element.getAttribute("data-term");
          console.log(`Term clicked: ${termText}`);

          if (!termText || !terms[termText]) return;

          // Position the popup near the clicked term
          const rect = element.getBoundingClientRect();

          setActiveDefinition({
            term: termText,
            definition: terms[termText],
            position: {
              x: rect.left + window.scrollX,
              y: rect.bottom + window.scrollY + 5,
            },
          });
        };

        termElements.forEach((element) => {
          // Remove any existing listeners first to prevent duplicates
          element.removeEventListener("click", handleTermClick as EventListener);
          element.addEventListener("click", handleTermClick as EventListener);

          // Add direct onclick attribute as a backup approach
          (element as HTMLElement).onclick = (e) => {
            handleTermClick(e);
          };
        });
      }, 100); // Short delay to ensure DOM is ready

      // Close popup when clicking outside
      const handleClickOutside = (e: MouseEvent) => {
        if (activeDefinition) {
          const popupElement = document.querySelector(".definition-popup");
          const clickedOnPopup =
            popupElement && popupElement.contains(e.target as Node);

          if (!clickedOnPopup) {
            setActiveDefinition(null);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Clean up all event listeners
        const termElements = contentRef.current?.querySelectorAll(".defined-term");
        termElements?.forEach((element) => {
          // Clean up without referencing the specific handler
          (element as HTMLElement).onclick = null;
        });
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [html, loading, terms]); // Remove activeDefinition to prevent re-attaching handlers

  if (loading) {
    return <div className="markdown-loading">Loading...</div>;
  }

  if (error) {
    return <div className="markdown-error">{error}</div>;
  }

  return (
    <div className="markdown-container" style={{ position: "relative" }}>
      <div
        ref={contentRef}
        className={`markdown-content ${excerpt ? "markdown-excerpt" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          // Delegate click handling for defined terms
          const target = e.target as HTMLElement;
          if (target.classList.contains("defined-term")) {
            const termText = target.getAttribute("data-term");
            if (termText && terms[termText]) {
              const rect = target.getBoundingClientRect();
              setActiveDefinition({
                term: termText,
                definition: terms[termText],
                position: {
                  x: rect.left + window.scrollX,
                  y: rect.bottom + window.scrollY + 5,
                },
              });
            }
          }
        }}
      />

      {activeDefinition && (
        <div
          className="definition-popup"
          style={{
            position: "absolute", // Ensure position is absolute
            top: `${activeDefinition.position.y}px`,
            left: `${activeDefinition.position.x}px`,
            zIndex: 1000, // Ensure high z-index
          }}
        >
          <h4>{activeDefinition.term}</h4>
          <p>{activeDefinition.definition}</p>
          <button onClick={() => setActiveDefinition(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default MarkdownViewer;
