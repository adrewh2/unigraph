import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import "./FileTreeView.css";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  isExpanded?: boolean;
}

interface FileTreeViewProps {
  rootPath?: string;
  onFileSelect?: (filePath: string) => void;
  selectedFile?: string;
  className?: string;
}

const FileTreeView: React.FC<FileTreeViewProps> = ({
  rootPath = "/markdowns",
  onFileSelect,
  selectedFile,
  className = "",
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the file tree structure
  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load markdowns structure
        const markdownsResponse = await fetch("/markdowns-structure.json");
        let markdownsTree: FileNode[] = [];

        if (markdownsResponse.ok) {
          const markdownsData = await markdownsResponse.json();
          markdownsTree = convertStructureToFileNodes(
            markdownsData,
            "/markdowns"
          );
        } else {
          console.warn(
            "Could not load markdowns structure:",
            markdownsResponse.status
          );
        }

        // Load docs structure
        const docsResponse = await fetch("/docs-structure.json");
        let docsTree: FileNode[] = [];

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          docsTree = convertStructureToFileNodes(docsData, "/docs");
        } else {
          console.warn("Could not load docs structure:", docsResponse.status);
        }

        // Combine both trees
        const combinedTree = [...markdownsTree, ...docsTree];

        if (combinedTree.length === 0) {
          setError(
            "No documentation structure found. Please run 'npm run generate-structures' to generate the file tree."
          );
        } else {
          setFileTree(combinedTree);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching file tree:", err);
        setError("Failed to load file tree");
        setLoading(false);
      }
    };

    // Helper function to convert structure to FileNode format
    const convertStructureToFileNodes = (
      structure: any,
      basePath: string
    ): FileNode[] => {
      if (!structure.children) return [];

      return structure.children.map((child: any) => {
        const node: FileNode = {
          name: child.name || child.path.split("/").pop() || "Unknown",
          path: `${basePath}/${child.path}`,
          type: child.type,
        };

        if (child.children && child.children.length > 0) {
          node.children = convertStructureToFileNodes(child, basePath);
        }

        return node;
      });
    };

    fetchFileTree();
  }, [rootPath]);

  const toggleNode = (node: FileNode) => {
    if (node.type === "directory") {
      setFileTree((prevTree) => {
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
    } else if (onFileSelect) {
      onFileSelect(node.path);
    }
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedFile === node.path;
    const isExpanded = node.isExpanded || depth === 0; // Root nodes are expanded by default

    return (
      <div key={node.path}>
        <div
          className={`file-tree-node ${isSelected ? "selected" : ""}`}
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => toggleNode(node)}
        >
          <div className="file-tree-node-content">
            {node.type === "directory" ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="file-tree-icon" size={16} />
                ) : (
                  <ChevronRight className="file-tree-icon" size={16} />
                )}
                {isExpanded ? (
                  <FolderOpen className="file-tree-icon" size={16} />
                ) : (
                  <Folder className="file-tree-icon" size={16} />
                )}
              </>
            ) : (
              <>
                <div className="file-tree-icon-placeholder" />
                <FileText className="file-tree-icon" size={16} />
              </>
            )}
            <span className="file-tree-name">{node.name}</span>
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
      <div className={`file-tree-container ${className}`}>
        <div className="file-tree-loading">Loading file tree...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`file-tree-container ${className}`}>
        <div className="file-tree-error">
          <h3>Error Loading File Tree</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-tree-container ${className}`}>
      <div className="file-tree-header">
        <h3>Documentation</h3>
      </div>
      <div className="file-tree-content">
        {fileTree.map((node) => renderNode(node))}
      </div>
    </div>
  );
};

export default FileTreeView;
