import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useComponentLogger } from "../../hooks/useLogger";
import "./FileTreeView.css";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  isExpanded?: boolean;
  title?: string;
  order?: number; // Add order metadata
  displayName: string; // Will show title if available, otherwise name
  isIndex?: boolean; // Flag to identify index files
  metadata?: Record<string, any>; // Additional metadata for different data sources
}

export interface FileTreeDataSource {
  id: string;
  name: string;
  type: "json" | "supabase" | "custom";
  config: {
    url?: string; // For JSON data sources
    table?: string; // For Supabase data sources
    query?: string; // For custom data sources
    transform?: (data: any) => FileNode[]; // Custom transform function
  };
}

export interface FileTreeInstance {
  id: string;
  name: string;
  dataSource: FileTreeDataSource;
  rootPath?: string;
  hideEmptyFolders?: boolean;
  onFileSelect?: (filePath: string, metadata?: Record<string, any>) => void;
}

export interface FileTreeViewProps {
  instance: FileTreeInstance;
  selectedFile?: string;
  className?: string;
  showHeader?: boolean;
  headerTitle?: string;
  showSearch?: boolean;
}

const FileTreeView: React.FC<FileTreeViewProps> = ({
  instance,
  selectedFile,
  className = "",
  showHeader = true,
  headerTitle,
  showSearch = true,
}) => {
  const { theme } = useTheme();
  const log = useComponentLogger(`FileTreeView-${instance.id}`);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [filteredTree, setFilteredTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch the file tree structure based on data source
  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setLoading(true);
        setError(null);

        let treeData: FileNode[] = [];

        switch (instance.dataSource.type) {
          case "json":
            if (instance.dataSource.config.url) {
              const response = await fetch(instance.dataSource.config.url);
              if (response.ok) {
                const data = await response.json();
                treeData = await convertStructureToFileNodes(
                  data,
                  instance.rootPath || "/"
                );
              } else {
                log.warn(
                  `Could not load JSON structure from ${instance.dataSource.config.url}`,
                  {
                    status: response.status,
                  }
                );
              }
            }
            break;

          case "supabase":
            // TODO: Implement Supabase data source
            log.warn("Supabase data source not yet implemented");
            break;

          case "custom":
            if (instance.dataSource.config.transform) {
              // For custom data sources, we expect the data to be provided externally
              // This would typically be handled by a parent component
              log.info("Custom data source - expecting external data");
            }
            break;

          default:
            log.error(`Unknown data source type: ${instance.dataSource.type}`);
            setError(`Unknown data source type: ${instance.dataSource.type}`);
            setLoading(false);
            return;
        }

        // Process folder ordering on the tree
        const processedTree = await processFolderOrdering(treeData);

        // Debug: Log the final tree structure
        log.debug(
          "Final processed tree structure",
          processedTree.map((node) => ({
            name: node.name,
            displayName: node.displayName,
            type: node.type,
            order: node.order,
          }))
        );

        if (processedTree.length === 0) {
          setError(
            `No file structure found for ${instance.name}. Please check your data source configuration.`
          );
        } else {
          setFileTree(processedTree);
          setFilteredTree(processedTree);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching file tree:", err);
        setError("Failed to load file tree");
        setLoading(false);
      }
    };

    // Helper function to convert structure to FileNode format
    const convertStructureToFileNodes = async (
      structure: any,
      basePath: string
    ): Promise<FileNode[]> => {
      if (!structure.children) return [];

      const nodes = await Promise.all(
        structure.children.map(async (child: any) => {
          const name = child.name || child.path.split("/").pop() || "Unknown";
          let title: string | undefined;
          let displayName = name;
          let orderValue: number | undefined;
          const isIndexFile = name.toLowerCase() === "index.md";

          console.log(
            `Processing child: ${child.path}, name: ${name}, isIndex: ${isIndexFile}`
          );

          // For markdown files, use metadata from structure file
          if (child.type === "file" && child.path.endsWith(".md")) {
            // Use metadata from structure file if available
            if (child.title) {
              title = child.title;
              displayName = title;
            } else {
              // Fallback to filename
              displayName = name.replace(".md", "");
            }

            // Use order from structure file if available
            if (child.order !== undefined) {
              orderValue = child.order;
            }

            // Debug logging for index files
            if (isIndexFile) {
              console.log(
                `Index file ${child.path}: title="${title}", displayName="${displayName}", order="${orderValue}"`
              );
            }
          }

          const node: FileNode = {
            name,
            path: `${basePath}/${child.path}`,
            type: child.type,
            isExpanded: child.type === "directory", // Start directories as expanded
            title,
            displayName,
            order: orderValue,
            isIndex: isIndexFile,
            metadata: child.metadata || {},
          };

          if (child.children && child.children.length > 0) {
            node.children = await convertStructureToFileNodes(child, basePath);
          }

          return node;
        })
      );

      // Sort nodes by order before returning
      return sortNodesByOrder(nodes);
    };

    // Helper function to sort nodes by order and handle folder ordering
    const sortNodesByOrder = (nodes: FileNode[]): FileNode[] => {
      return nodes.sort((a, b) => {
        // If both have order, sort by order
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        // If only one has order, prioritize the one with order
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        // If neither has order, sort alphabetically by displayName
        return a.displayName.localeCompare(b.displayName);
      });
    };

    // Helper function to process folder ordering based on index files
    const processFolderOrdering = async (
      nodes: FileNode[]
    ): Promise<FileNode[]> => {
      const processedNodes = await Promise.all(
        nodes.map(async (node) => {
          if (node.type === "directory" && node.children) {
            // Process children recursively first
            node.children = await processFolderOrdering(node.children);

            // Find index file in the directory
            const indexFile = node.children.find((child) => child.isIndex);
            if (indexFile) {
              console.log(
                `Processing folder ${node.name}: indexFile.title="${indexFile.title}", indexFile.displayName="${indexFile.displayName}"`
              );
              // Apply the index file's order to the directory
              if (indexFile.order !== undefined) {
                node.order = indexFile.order;
                console.log(`Set folder ${node.name} order to ${node.order}`);
              }
              // Use the index file's title for the folder name if available
              if (indexFile.title) {
                const oldDisplayName = node.displayName;
                node.displayName = indexFile.title;
                console.log(
                  `Updated folder ${node.name} displayName from "${oldDisplayName}" to "${node.displayName}"`
                );
              } else {
                console.log(
                  `No title found in index file for folder ${node.name}`
                );
              }
            } else {
              console.log(`No index file found for folder ${node.name}`);
            }
            // Remove index files from children display
            node.children = node.children.filter((child) => !child.isIndex);
            // Sort the remaining children
            node.children = sortNodesByOrder(node.children);
          }
          return node;
        })
      );

      return sortNodesByOrder(processedNodes);
    };

    fetchFileTree();
  }, [instance, log]);

  // Filter tree based on search term and empty folder preference
  useEffect(() => {
    if (!searchTerm.trim() && !instance.hideEmptyFolders) {
      setFilteredTree(fileTree);
      return;
    }

    const filterTree = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch = searchTerm.trim()
            ? node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.displayName.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

          if (node.type === "file") {
            // Skip index files
            if (node.isIndex) {
              return null;
            }
            return matchesSearch ? node : null;
          } else {
            // For directories, check if any children match
            const filteredChildren = node.children
              ? filterTree(node.children)
              : [];

            const hasFiles = filteredChildren.some(
              (child) => child.type === "file"
            );
            const shouldShow = instance.hideEmptyFolders ? hasFiles : true;

            if (matchesSearch && shouldShow && filteredChildren.length > 0) {
              return {
                ...node,
                children: filteredChildren,
                isExpanded: true, // Expand directories that match search
              };
            }
            return null;
          }
        })
        .filter((node): node is FileNode => node !== null);
    };

    setFilteredTree(filterTree(fileTree));
  }, [searchTerm, instance.hideEmptyFolders, fileTree]);

  const toggleNode = (node: FileNode) => {
    if (node.type === "directory") {
      setFilteredTree((prevTree) => {
        const updateNode = (nodes: FileNode[]): FileNode[] => {
          return nodes.map((n) => {
            if (n.path === node.path) {
              return { ...n, isExpanded: !n.isExpanded };
            }
            if (n.children) {
              return { ...n, children: updateNode(n.children) };
            }
            return n;
          });
        };
        return updateNode(prevTree);
      });
    } else if (instance.onFileSelect) {
      instance.onFileSelect(node.path, node.metadata);
    }
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedFile === node.path;
    const isExpanded =
      node.isExpanded !== undefined ? node.isExpanded : depth === 0; // Root nodes start expanded but can be collapsed

    return (
      <div key={node.path}>
        <div
          className={`file-tree-node ${isSelected ? "selected" : ""}`}
          style={{
            paddingLeft: `${depth * 20}px`,
            backgroundColor: isSelected
              ? getColor(theme.colors, "primary")
              : "transparent",
            color: isSelected
              ? getColor(theme.colors, "textInverse")
              : getColor(theme.colors, "text"),
          }}
          onClick={() => toggleNode(node)}
        >
          <div className="file-tree-node-content">
            {node.type === "directory" ? (
              <>
                {isExpanded ? (
                  <ChevronDown
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                ) : (
                  <ChevronRight
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                )}
                {isExpanded ? (
                  <FolderOpen
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                ) : (
                  <Folder
                    className="file-tree-icon"
                    size={16}
                    style={{
                      color: isSelected
                        ? getColor(theme.colors, "textInverse")
                        : getColor(theme.colors, "textSecondary"),
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <div className="file-tree-icon-placeholder" />
                <FileText
                  className="file-tree-icon"
                  size={16}
                  style={{
                    color: isSelected
                      ? getColor(theme.colors, "textInverse")
                      : getColor(theme.colors, "textSecondary"),
                  }}
                />
              </>
            )}
            <span
              className="file-tree-name"
              style={{
                color: isSelected
                  ? getColor(theme.colors, "textInverse")
                  : getColor(theme.colors, "text"),
              }}
            >
              {node.displayName}
            </span>
          </div>
        </div>
        {node.type === "directory" && isExpanded && node.children && (
          <div className="file-tree-children">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`file-tree-container ${className}`}
        style={{
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "text"),
        }}
      >
        <div
          className="file-tree-loading"
          style={{
            color: getColor(theme.colors, "textSecondary"),
          }}
        >
          Loading file tree...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`file-tree-container ${className}`}
        style={{
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "text"),
        }}
      >
        <div
          className="file-tree-error"
          style={{
            color: getColor(theme.colors, "error"),
          }}
        >
          <h3
            style={{
              color: getColor(theme.colors, "error"),
            }}
          >
            Error Loading File Tree
          </h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`file-tree-container ${className}`}
      style={{
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
      }}
    >
      {showHeader && (
        <div
          className="file-tree-header"
          style={{
            backgroundColor: getColor(theme.colors, "backgroundSecondary"),
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          <h3
            style={{
              color: getColor(theme.colors, "text"),
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {headerTitle || instance.name}
          </h3>
          {showSearch && (
            <div className="file-tree-search">
              <div className="file-tree-search-input-wrapper">
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
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="file-tree-search-input"
                  style={{
                    padding: "8px 12px 8px 36px",
                    border: `1px solid ${getColor(theme.colors, "border")}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    backgroundColor: getColor(theme.colors, "background"),
                    color: getColor(theme.colors, "text"),
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="file-tree-content">
        {filteredTree.length === 0 && searchTerm ? (
          <div
            className="file-tree-no-results"
            style={{
              padding: "20px",
              textAlign: "center",
              color: getColor(theme.colors, "textSecondary"),
              fontSize: "13px",
            }}
          >
            No files or folders match &quot;{searchTerm}&quot;
          </div>
        ) : (
          filteredTree.map((node) => renderNode(node))
        )}
      </div>
    </div>
  );
};

export default FileTreeView;
