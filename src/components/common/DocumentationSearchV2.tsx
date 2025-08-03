import React, { useCallback, useEffect, useState } from "react";
import "./DocumentationSearchV2.css";

interface SearchMatch {
  line: number;
  highlightedText: string;
}

interface SearchResult {
  filePath: string;
  title: string;
  matches: SearchMatch[];
}

interface SearchIndex {
  [filePath: string]: {
    title: string;
    content: string;
    lines: string[];
  };
}

const DocumentationSearchV2: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndex>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setSearching] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  // Helper function to index files recursively (same as V1)
  const indexFiles = useCallback(
    async (structure: any, basePath: string, index: SearchIndex) => {
      if (!structure.children) return;

      for (const child of structure.children) {
        console.log(`Processing child: ${child.path}, type: ${child.type}`);
        if (child.type === "file" && child.path.endsWith(".md")) {
          try {
            const fetchUrl = `${basePath}/${child.path}`;
            console.log(`Fetching file: ${fetchUrl}`);
            const response = await fetch(fetchUrl);
            if (response.ok) {
              const content = await response.text();
              const lines = content.split("\n");

              // Extract title from frontmatter or use filename
              let title = child.name.replace(".md", "");
              const frontMatterMatch = content.match(
                /^---\s*\n([\s\S]*?)\n---\s*\n/
              );
              if (frontMatterMatch) {
                const frontMatter = frontMatterMatch[1];
                const titleMatch = frontMatter.match(
                  /title:\s*["']([^"']+)["']/
                );
                if (titleMatch) {
                  title = titleMatch[1];
                } else {
                  const titleMatchNoQuotes =
                    frontMatter.match(/title:\s*([^\r\n]+)/);
                  if (titleMatchNoQuotes) {
                    title = titleMatchNoQuotes[1].trim();
                  }
                }
              }

              const indexKey = `${basePath}/${child.path}`;
              index[indexKey] = {
                title,
                content,
                lines,
              };
              console.log(`Indexed file: ${indexKey} with title: ${title}`);
            } else {
              console.log(`Failed to fetch ${fetchUrl}: ${response.status}`);
            }
          } catch (error) {
            console.debug(`Could not index ${child.path}:`, error);
          }
        } else if (child.children) {
          console.log(`Recursing into directory: ${child.path}`);
          await indexFiles(child, basePath, index);
        }
      }
    },
    []
  );

  // Build search index (same pattern as V1)
  const buildSearchIndex = useCallback(async () => {
    console.log("Building search index...");
    const index: SearchIndex = {};

    try {
      // Load markdowns structure
      const markdownsResponse = await fetch("/markdowns-structure.json");
      if (markdownsResponse.ok) {
        const markdownsData = await markdownsResponse.json();
        console.log("Markdowns structure:", markdownsData);
        await indexFiles(markdownsData, "/markdowns", index);
      }

      // Load docs structure
      const docsResponse = await fetch("/docs-structure.json");
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        console.log("Docs structure:", docsData);
        await indexFiles(docsData, "/docs", index);
      }

      console.log("Final search index:", index);
      setSearchIndex(index);
      setIsIndexed(true);
      console.log(
        "Search index built with",
        Object.keys(index).length,
        "files"
      );
    } catch (error) {
      console.error("Failed to build search index:", error);
      setIsIndexed(true); // Mark as indexed even if failed to avoid infinite loading
    }
  }, [indexFiles]);

  // Perform search
  const performSearch = useCallback(
    (term: string) => {
      if (!term.trim() || !isIndexed) {
        setSearchResults([]);
        return;
      }

      setSearching(true);

      const results: SearchResult[] = [];
      const lowerTerm = term.toLowerCase();

      Object.entries(searchIndex).forEach(([filePath, fileData]) => {
        const matches: SearchMatch[] = [];

        // Search in lines
        fileData.lines.forEach((line, lineIndex) => {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes(lowerTerm)) {
            // Highlight the match
            const regex = new RegExp(`(${term})`, "gi");
            const highlightedText = line.replace(
              regex,
              '<mark style="background-color: yellow; color: black;">$1</mark>'
            );

            matches.push({
              line: lineIndex + 1,
              highlightedText,
            });
          }
        });

        // Search in title
        if (fileData.title.toLowerCase().includes(lowerTerm)) {
          const regex = new RegExp(`(${term})`, "gi");
          const highlightedTitle = fileData.title.replace(
            regex,
            '<mark style="background-color: yellow; color: black;">$1</mark>'
          );

          if (matches.length === 0) {
            matches.push({
              line: 0,
              highlightedText: `Title: ${highlightedTitle}`,
            });
          }
        }

        if (matches.length > 0) {
          results.push({
            filePath,
            title: fileData.title,
            matches,
          });
        }
      });

      // Sort by relevance (title matches first, then by number of matches)
      results.sort((a, b) => {
        const aHasTitleMatch = a.matches.some((m) => m.line === 0);
        const bHasTitleMatch = b.matches.some((m) => m.line === 0);

        if (aHasTitleMatch && !bHasTitleMatch) return -1;
        if (!aHasTitleMatch && bHasTitleMatch) return 1;

        return b.matches.length - a.matches.length;
      });

      setSearchResults(results);
      setSearching(false);
    },
    [searchIndex, isIndexed]
  );

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      performSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Handle result click
  const handleResultClick = (filePath: string) => {
    // TODO: Implement file opening logic
    console.log("Clicked on:", filePath);
  };

  // Build index on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn("Indexing timeout reached, marking as indexed");
      setIsIndexed(true);
    }, 10000); // 10 second timeout

    buildSearchIndex().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [buildSearchIndex]);

  return (
    <div className="documentation-search-v2">
      <div className="search-header">
        <h3>Search Documentation</h3>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for text..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {!isIndexed && <span className="indexing-status">Indexing...</span>}
        </div>
      </div>

      <div className="search-content">
        {isSearching && (
          <div className="search-status">
            <span>Searching...</span>
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="no-results">
            <span>No results found for &quot;{searchTerm}&quot;</span>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="results-container">
            <div className="results-header">
              Found {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </div>
            <div className="results-list">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.filePath}-${index}`}
                  className="result-item"
                >
                  <div className="result-header">
                    <div
                      className="result-title"
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                    <div className="result-path">{result.filePath}</div>
                  </div>
                  <div className="result-matches">
                    {result.matches.slice(0, 3).map((match, matchIndex) => (
                      <div key={matchIndex} className="match-item">
                        <span className="match-line">Line {match.line}:</span>
                        <span
                          className="match-text"
                          dangerouslySetInnerHTML={{
                            __html: match.highlightedText,
                          }}
                        />
                      </div>
                    ))}
                    {result.matches.length > 3 && (
                      <div className="more-matches">
                        +{result.matches.length - 3} more matches
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationSearchV2;
