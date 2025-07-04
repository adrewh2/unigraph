import katex from "katex";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import React, { useEffect, useState } from "react";

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
    };

    marked.use({ renderer });

    // Process text to handle inline LaTeX
    const processText = (text: string) => {
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
          const alternatePath = `/storyCards/${normalizedFilename}${!normalizedFilename.endsWith(".md") ? ".md" : ""}`;
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
        // Pre-process markdown for LaTeX
        const processedMarkdown = processText(markdown);

        // If excerpt is requested, truncate the content
        const content = excerpt
          ? processedMarkdown.substring(0, excerptLength) + "..."
          : processedMarkdown;

        // Parse markdown to HTML
        const parsed = marked.parse(content);
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
          `Error loading markdown: ${err instanceof Error ? err.message : String(err)}`
        );
        setLoading(false);
      });
  }, [filename, excerpt, excerptLength]);

  if (loading) {
    return <div className="markdown-loading">Loading...</div>;
  }

  if (error) {
    return <div className="markdown-error">{error}</div>;
  }

  return (
    <div
      className={`markdown-content ${excerpt ? "markdown-excerpt" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownViewer;
