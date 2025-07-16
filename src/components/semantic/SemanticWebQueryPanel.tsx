import { StreamLanguage } from "@codemirror/language";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";
import React, { useState } from "react";
import SelectDropdown from "../common/SelectDropdown";

// Predefined SPARQL endpoints
const ENDPOINTS = [
  { label: "DBpedia", value: "https://dbpedia.org/sparql" },
  { label: "Wikidata", value: "https://query.wikidata.org/sparql" },
  { label: "Europeana", value: "https://sparql.europeana.eu/" },
  { label: "Custom...", value: "custom" },
];

interface SemanticWebQueryPanelProps {
  onResultsToSceneGraph?: (bindings: any[]) => void;
  defaultEndpoint?: string;
  defaultQuery?: string;
  isDarkMode?: boolean;
}

const DEFAULT_QUERY = `SELECT ?subject ?predicate ?object WHERE {
  ?subject ?predicate ?object
} LIMIT 10`;

const SemanticWebQueryPanel: React.FC<SemanticWebQueryPanelProps> = ({
  onResultsToSceneGraph,
  defaultEndpoint,
  defaultQuery,
  isDarkMode = false,
}) => {
  const [endpoint, setEndpoint] = useState(
    ENDPOINTS.find((e) => e.value === defaultEndpoint) || ENDPOINTS[0]
  );
  const [customEndpoint, setCustomEndpoint] = useState("");
  const [query, setQuery] = useState(defaultQuery || DEFAULT_QUERY);
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveEndpoint =
    endpoint.value === "custom" ? customEndpoint : endpoint.value;

  const handleRunQuery = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setColumns([]);
    try {
      const url = `${effectiveEndpoint}?query=${encodeURIComponent(query)}&format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.results || !data.head)
        throw new Error("Malformed SPARQL result");
      setColumns(data.head.vars);
      setResults(data.results.bindings);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEndpointChange = (opt: any) => {
    setEndpoint(opt);
    if (opt.value !== "custom") setCustomEndpoint("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
        background: isDarkMode ? "#18181b" : "#fff",
        color: isDarkMode ? "#fff" : undefined,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontWeight: 500 }}>Endpoint:</span>
        <div style={{ minWidth: 220 }}>
          <SelectDropdown
            options={ENDPOINTS}
            value={endpoint}
            onChange={handleEndpointChange}
            isDarkMode={isDarkMode}
          />
        </div>
        {endpoint.value === "custom" && (
          <input
            type="text"
            placeholder="Enter custom endpoint URL"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            style={{
              minWidth: 320,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
              background: isDarkMode ? "#23232a" : undefined,
              color: isDarkMode ? "#fff" : undefined,
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontWeight: 500 }}>SPARQL Query:</span>
        <div
          style={{
            borderRadius: 6,
            border: "1px solid #ccc",
            overflow: "hidden",
            background: isDarkMode ? "#23232a" : undefined,
          }}
        >
          <CodeMirror
            value={query}
            height="180px"
            theme={isDarkMode ? oneDark : undefined}
            extensions={[StreamLanguage.define(sparql)]}
            onChange={(value) => setQuery(value)}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              foldGutter: true,
              autocompletion: true,
            }}
            style={{
              fontSize: 15,
              fontFamily: "monospace",
              background: isDarkMode ? "#23232a" : undefined,
              color: isDarkMode ? "#fff" : undefined,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleRunQuery}
            disabled={loading || !effectiveEndpoint}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Running..." : "Run Query"}
          </button>
          {onResultsToSceneGraph && results && results.length > 0 && (
            <button
              onClick={() => onResultsToSceneGraph(results)}
              style={{
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Add Results to SceneGraph
            </button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", marginTop: 8 }}>
        {error && (
          <div style={{ color: "#dc2626", marginBottom: 8 }}>
            Error: {error}
          </div>
        )}
        {results && results.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: isDarkMode ? "#23232a" : "#fff",
              color: isDarkMode ? "#fff" : undefined,
            }}
          >
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      borderBottom: "2px solid #e5e7eb",
                      textAlign: "left",
                      padding: "6px 10px",
                      fontWeight: 600,
                      background: isDarkMode ? "#18181b" : "#f3f4f6",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        padding: "6px 10px",
                        fontFamily: "monospace",
                        fontSize: 14,
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row[col]?.value || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {results && results.length === 0 && (
          <div style={{ color: "#888" }}>No results.</div>
        )}
      </div>
    </div>
  );
};

export default SemanticWebQueryPanel;
