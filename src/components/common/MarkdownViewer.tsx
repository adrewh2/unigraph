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

    // Fix the path construction to ensure we're using the correct location
    // Normalize the path and handle file extension
    const normalizedFilename = filename.startsWith("/")
      ? filename.substring(1)
      : filename;
    const filePath = normalizedFilename.endsWith(".md")
      ? `/storyCardFiles/${normalizedFilename}`
      : `/storyCardFiles/${normalizedFilename}.md`;

    console.log(`Attempting to fetch markdown from: ${filePath}`);

    // Try the first path
    fetch(filePath)
      .then((res) => {
        if (!res.ok) {
          // If first path fails, try an alternative path (storyCards vs storyCardFiles)
          const alternatePath = `/storyCards/${normalizedFilename}${!normalizedFilename.endsWith(".md") ? ".md" : ""}`;
          console.log(`First path failed, trying alternate path: ${alternatePath}`);
          return fetch(alternatePath).then(altRes => {
            if (!altRes.ok) {
              throw new Error(
                `Failed to load markdown from both paths: ${filePath} and ${alternatePath}`
              );
            }
            return altRes.text();
          });
        }
        return res.text();
      })
      .then((markdown) => {
        // If excerpt is requested, truncate the content
        const content = excerpt
          ? `${markdown.substring(0, excerptLength)}...`
          : markdown;

        const result = marked(content);
        if (result instanceof Promise) {
          result.then((html) => {
            setHtml(html);
            setLoading(false);
          });
        } else {
          setHtml(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading markdown:", err);
        setError(`Error loading markdown: ${err.message}`);
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
