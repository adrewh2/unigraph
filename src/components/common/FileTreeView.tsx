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

        // For now, we'll build the tree manually since we need to handle
        // both public/markdowns and docs directories
        const tree: FileNode[] = [
          {
            name: "markdowns",
            path: "/markdowns",
            type: "directory",
            children: [
              {
                name: "unigraph",
                path: "/markdowns/unigraph",
                type: "directory",
                children: [
                  {
                    name: "UnigraphOverview.md",
                    path: "/markdowns/unigraph/UnigraphOverview.md",
                    type: "file",
                  },
                ],
              },
            ],
          },
          {
            name: "docs",
            path: "/docs",
            type: "directory",
            children: [
              {
                name: "overview",
                path: "/docs/overview",
                type: "directory",
                children: [
                  {
                    name: "motivation.md",
                    path: "/docs/overview/motivation.md",
                    type: "file",
                  },
                  {
                    name: "goals.md",
                    path: "/docs/overview/goals.md",
                    type: "file",
                  },
                  {
                    name: "currentProjects.md",
                    path: "/docs/overview/currentProjects.md",
                    type: "file",
                  },
                ],
              },
              {
                name: "userGuide",
                path: "/docs/userGuide",
                type: "directory",
                children: [
                  {
                    name: "analysis.md",
                    path: "/docs/userGuide/analysis.md",
                    type: "file",
                  },
                  {
                    name: "definitions.md",
                    path: "/docs/userGuide/definitions.md",
                    type: "file",
                  },
                  {
                    name: "fileManagement.md",
                    path: "/docs/userGuide/fileManagement.md",
                    type: "file",
                  },
                ],
              },
              {
                name: "quickGuides",
                path: "/docs/quickGuides",
                type: "directory",
                children: [
                  {
                    name: "importingFromDot.md",
                    path: "/docs/quickGuides/importingFromDot.md",
                    type: "file",
                  },
                  {
                    name: "importingFromMermaid.md",
                    path: "/docs/quickGuides/importingFromMermaid.md",
                    type: "file",
                  },
                  {
                    name: "loadingFromSvg.md",
                    path: "/docs/quickGuides/loadingFromSvg.md",
                    type: "file",
                  },
                ],
              },
            ],
          },
        ];

        setFileTree(tree);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching file tree:", err);
        setError("Failed to load file tree");
        setLoading(false);
      }
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
