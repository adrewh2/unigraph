import { getColor, useTheme } from "@aesgraph/app-shell";
import { debounce } from "lodash";
import { FileText, Search, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Document, searchDocuments } from "../../api/documentsApi";
import { useAuth } from "../../hooks/useAuth";

export interface DocumentSearchResult {
  document: Document;
  matchType: "title" | "content";
  preview?: string;
  highlightedPreview?: string;
}

interface DocumentContentSearchProps {
  projectId?: string;
  onResultSelect?: (result: DocumentSearchResult) => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

export const DocumentContentSearch: React.FC<DocumentContentSearchProps> = ({
  projectId,
  onResultSelect,
  placeholder = "Search document content...",
  maxResults = 10,
  className = "",
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Helper function to extract preview text around search term
  const extractPreview = useCallback(
    (content: string, searchTerm: string, _maxLength: number = 200): string => {
      if (!content || !searchTerm) return "";

      const lowerContent = content.toLowerCase();
      const lowerSearchTerm = searchTerm.toLowerCase();
      const index = lowerContent.indexOf(lowerSearchTerm);

      if (index === -1) return "";

      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + searchTerm.length + 150);

      let preview = content.substring(start, end);

      // Add ellipses if we truncated
      if (start > 0) preview = "..." + preview;
      if (end < content.length) preview = preview + "...";

      return preview;
    },
    []
  );

  // Helper function to highlight search terms in preview
  const highlightSearchTerm = useCallback(
    (text: string, searchTerm: string): string => {
      if (!text || !searchTerm) return text;

      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    },
    []
  );

  // Perform search with debouncing
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (!user?.id) {
        console.error("Cannot search: user must be signed in");
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const documents = await searchDocuments({
          searchTerm: term,
          userId: user.id,
          projectId,
        });

        const results: DocumentSearchResult[] = documents
          .slice(0, maxResults)
          .map((doc) => {
            // Check if match is in title or content
            const titleMatch = doc.title
              .toLowerCase()
              .includes(term.toLowerCase());
            const contentMatch = doc.content
              ?.toLowerCase()
              .includes(term.toLowerCase());

            const matchType: "title" | "content" = titleMatch
              ? "title"
              : "content";
            let preview = "";
            let highlightedPreview = "";

            if (contentMatch && doc.content) {
              preview = extractPreview(doc.content, term);
              highlightedPreview = highlightSearchTerm(preview, term);
            } else if (titleMatch) {
              preview = doc.title;
              highlightedPreview = highlightSearchTerm(preview, term);
            }

            return {
              document: doc,
              matchType,
              preview,
              highlightedPreview,
            };
          });

        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching documents:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [user?.id, projectId, maxResults, extractPreview, highlightSearchTerm]
  );

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle result selection
  const handleResultSelect = useCallback(
    (result: DocumentSearchResult) => {
      onResultSelect?.(result);
      // Keep results visible after selection
    },
    [onResultSelect]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  }, []);

  // Show sign-in message if user is not authenticated
  if (!user?.id) {
    return (
      <div
        style={{
          textAlign: "center",
          color: getColor(theme.colors, "textSecondary"),
          fontSize: "14px",
          marginTop: "40px",
        }}
      >
        Please sign in to search documents
      </div>
    );
  }

  return (
    <div
      className={`document-content-search ${className}`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div className="search-input-wrapper" style={{ position: "relative" }}>
        <Search
          size={16}
          style={{
            color: getColor(theme.colors, "textSecondary"),
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          style={{
            width: "100%",
            padding: "8px 36px 8px 36px",
            border: `1px solid ${getColor(theme.colors, "border")}`,
            borderRadius: "6px",
            fontSize: "13px",
            backgroundColor: getColor(theme.colors, "background"),
            color: getColor(theme.colors, "text"),
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: getColor(theme.colors, "textSecondary"),
              padding: "2px",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div
          className="search-results-container"
          style={{
            flex: 1,
            backgroundColor: getColor(theme.colors, "background"),
            border: `1px solid ${getColor(theme.colors, "border")}`,
            borderRadius: "6px",
            marginTop: "8px",
            overflowY: "auto",
            minHeight: 0, // Important for flex child to shrink
          }}
        >
          {searchResults.map((result, index) => (
            <div
              key={result.document.id}
              className="search-result-item"
              onClick={() => handleResultSelect(result)}
              style={{
                padding: "12px",
                cursor: "pointer",
                borderBottom:
                  index < searchResults.length - 1
                    ? `1px solid ${getColor(theme.colors, "border")}`
                    : "none",
                // "&:hover": {
                //   backgroundColor: getColor(
                //     theme.colors,
                //     "backgroundSecondary"
                //   ),
                // },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getColor(
                  theme.colors,
                  "backgroundSecondary"
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <FileText
                  size={16}
                  style={{
                    color: getColor(theme.colors, "textSecondary"),
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: getColor(theme.colors, "text"),
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {result.matchType === "title" &&
                    result.highlightedPreview ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result.highlightedPreview,
                        }}
                      />
                    ) : (
                      result.document.title
                    )}
                  </div>
                  {result.matchType === "content" &&
                    result.highlightedPreview && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: getColor(theme.colors, "textSecondary"),
                          lineHeight: "1.4",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: result.highlightedPreview,
                        }}
                      />
                    )}
                  <div
                    style={{
                      fontSize: "11px",
                      color: getColor(theme.colors, "textSecondary"),
                      marginTop: "4px",
                      opacity: 0.7,
                    }}
                  >
                    Match in {result.matchType}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div
          style={{
            flex: 1,
            backgroundColor: getColor(theme.colors, "background"),
            border: `1px solid ${getColor(theme.colors, "border")}`,
            borderRadius: "6px",
            padding: "20px",
            textAlign: "center",
            fontSize: "14px",
            color: getColor(theme.colors, "textSecondary"),
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Searching...
        </div>
      )}

      {/* No results message */}
      {showResults &&
        searchResults.length === 0 &&
        searchTerm &&
        !isSearching && (
          <div
            style={{
              flex: 1,
              backgroundColor: getColor(theme.colors, "background"),
              border: `1px solid ${getColor(theme.colors, "border")}`,
              borderRadius: "6px",
              padding: "20px",
              textAlign: "center",
              fontSize: "14px",
              color: getColor(theme.colors, "textSecondary"),
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No documents found matching &ldquo;{searchTerm}&rdquo;
          </div>
        )}

      <style>{`
        .search-highlight {
          background-color: ${getColor(theme.colors, "primary")}25;
          color: ${getColor(theme.colors, "primary")};
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DocumentContentSearch;
