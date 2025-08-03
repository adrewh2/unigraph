import { getColor, useTheme } from "@aesgraph/app-shell";
import { Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import "./DocumentationSearch.css";

interface SearchResult {
  filePath: string;
  title: string;
  matches: Array<{
    line: number;
    text: string;
    highlightedText: string;
  }>;
  score: number;
}

interface SearchIndex {
  [filePath: string]: {
    title: string;
    content: string;
    lines: string[];
  };
}

interface DocumentationSearchProps {
  onFileSelect: (filePath: string) => void;
  selectedFile?: string;
}

const DocumentationSearch: React.FC<DocumentationSearchProps> = ({
  onFileSelect,
  selectedFile,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndex, setSearchIndex] = useState<SearchIndex>({});
  const [isIndexBuilt, setIsIndexBuilt] = useState(false);

  // Helper function to index files recursively
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

  // Build search index from all documentation files
  const buildSearchIndex = useCallback(async () => {
    if (isIndexBuilt) return;

    setIsSearching(true);
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
      setIsIndexBuilt(true);
    } catch (error) {
      console.error("Error building search index:", error);
    } finally {
      setIsSearching(false);
    }
  }, [indexFiles, isIndexBuilt]);

  // Perform search with debouncing
  const performSearch = useCallback(
    async (term: string) => {
      console.log("Performing search for:", term);
      console.log("Index built:", isIndexBuilt);
      console.log("Search index keys:", Object.keys(searchIndex));

      if (!term.trim() || !isIndexBuilt) {
        console.log("Search skipped - no term or index not built");
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const results: SearchResult[] = [];
      const searchLower = term.toLowerCase();

      // Search through all indexed files
      for (const [filePath, fileData] of Object.entries(searchIndex)) {
        console.log(`Searching in file: ${filePath}`);
        const matches: Array<{
          line: number;
          text: string;
          highlightedText: string;
        }> = [];
        let score = 0;

        // Search in title
        if (fileData.title.toLowerCase().includes(searchLower)) {
          score += 10;
          console.log(`Title match found in ${filePath}`);
        }

        // Search in content lines
        for (let i = 0; i < fileData.lines.length; i++) {
          const line = fileData.lines[i];
          const lineLower = line.toLowerCase();

          if (lineLower.includes(searchLower)) {
            // Highlight the matched text
            const regex = new RegExp(
              `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
              "gi"
            );
            const highlightedText = line.replace(regex, "<mark>$1</mark>");

            matches.push({
              line: i + 1,
              text: line,
              highlightedText,
            });
            score += 1;
          }
        }

        if (matches.length > 0) {
          console.log(`Found ${matches.length} matches in ${filePath}`);
          results.push({
            filePath,
            title: fileData.title,
            matches,
            score,
          });
        }
      }

      console.log("Search results:", results);
      // Sort by score (highest first)
      results.sort((a, b) => b.score - a.score);
      console.log("Setting search results:", results);
      setSearchResults(results);
      setIsSearching(false);
    },
    [searchIndex, isIndexBuilt]
  );

  // Debounced search effect
  useEffect(() => {
    console.log("Search effect triggered - searchTerm:", searchTerm);
    const timeoutId = setTimeout(() => {
      console.log("Executing search for:", searchTerm);
      performSearch(searchTerm);
    }, 300);

    return () => {
      console.log("Clearing timeout for:", searchTerm);
      clearTimeout(timeoutId);
    };
  }, [searchTerm, performSearch]);

  // Build index on mount
  useEffect(() => {
    buildSearchIndex();
  }, [buildSearchIndex]);

  // Debug search results changes
  useEffect(() => {
    console.log("Search results changed:", searchResults);
  }, [searchResults]);

  // Debug search term changes
  useEffect(() => {
    console.log("Search term changed to:", searchTerm);
  }, [searchTerm]);

  // Debug isSearching changes
  useEffect(() => {
    console.log("isSearching changed to:", isSearching);
  }, [isSearching]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("Search input changed to:", newValue);
    setSearchTerm(newValue);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleResultClick = (filePath: string) => {
    onFileSelect(filePath);
  };

  return (
    <div className="documentation-search">
      <div style={{ color: "green", padding: "5px", fontSize: "12px" }}>
        COMPONENT RENDERED - searchTerm: {searchTerm}, results:{" "}
        {searchResults.length}
      </div>
      <div className="search-header">
        <div className="search-input-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            style={{
              color: getColor(theme.colors, "text"),
              backgroundColor: getColor(theme.colors, "background"),
              borderColor: getColor(theme.colors, "border"),
            }}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {isSearching && (
        <div className="search-loading">Building search index...</div>
      )}

      <div style={{ border: "2px solid red", padding: "10px", margin: "10px" }}>
        ALWAYS VISIBLE - searchTerm: &quot;{searchTerm}&quot;, results:{" "}
        {searchResults.length}, searching: {isSearching.toString()}
      </div>

      <div
        className="search-results"
        style={{ border: "2px solid blue", padding: "10px" }}
      >
        <div
          style={{ color: "green", fontWeight: "bold", marginBottom: "10px" }}
        >
          Search Results ({searchResults.length})
        </div>

        <div
          style={{
            color: "purple",
            padding: "10px",
            border: "1px solid purple",
          }}
        >
          CONDITIONAL DEBUG: searchTerm exists? {searchTerm ? "YES" : "NO"},
          isSearching? {isSearching ? "YES" : "NO"}, results.length === 0?{" "}
          {searchResults.length === 0 ? "YES" : "NO"}
        </div>

        {isSearching ? (
          <div
            style={{ color: "orange", textAlign: "center", padding: "20px" }}
          >
            Searching...
          </div>
        ) : searchResults.length === 0 ? (
          <div style={{ color: "gray", textAlign: "center", padding: "20px" }}>
            No results found for &quot;{searchTerm}&quot;
          </div>
        ) : (
          <div className="results-list">
            <div
              style={{
                color: "orange",
                padding: "10px",
                border: "1px solid orange",
              }}
            >
              RENDERING RESULTS LIST - Found {searchResults.length} results
            </div>
            {searchResults.map((result, index) => (
              <div
                key={`${result.filePath}-${index}`}
                className="search-result"
                onClick={() => handleResultClick(result.filePath)}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "12px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedFile === result.filePath ? "#007acc" : "#f5f5f5",
                  color: selectedFile === result.filePath ? "white" : "black",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  {result.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: selectedFile === result.filePath ? "#ccc" : "#666",
                    marginBottom: "8px",
                  }}
                >
                  {result.filePath}
                </div>
                <div>
                  {result.matches.slice(0, 2).map((match, matchIndex) => (
                    <div
                      key={matchIndex}
                      style={{ fontSize: "12px", marginBottom: "4px" }}
                    >
                      <span
                        style={{
                          color:
                            selectedFile === result.filePath ? "#ccc" : "#999",
                        }}
                      >
                        Line {match.line}:
                      </span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: match.highlightedText,
                        }}
                      />
                    </div>
                  ))}
                  {result.matches.length > 2 && (
                    <div
                      style={{
                        fontSize: "11px",
                        color:
                          selectedFile === result.filePath ? "#ccc" : "#999",
                        fontStyle: "italic",
                      }}
                    >
                      +{result.matches.length - 2} more matches
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationSearch;
