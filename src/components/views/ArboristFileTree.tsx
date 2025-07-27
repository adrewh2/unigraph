import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import {
  Code,
  File,
  FilePlus,
  FileText,
  FolderPlus,
  Image,
  Settings,
} from "lucide-react";
import React, { useMemo } from "react";
import { Tree } from "react-arborist";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface ArboristFileTreeProps {
  files: Record<string, string>;
  onFileSelect?: (filePath: string) => void;
  onFileCreate?: (path: string, content: string) => void;
  onFileDelete?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  selectedFile?: string;
  height?: string | number;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <Code size={16} />;
    case "html":
    case "htm":
    case "css":
    case "scss":
    case "sass":
    case "md":
    case "txt":
      return <FileText size={16} />;
    case "json":
      return <Settings size={16} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <Image size={16} />;
    default:
      return <File size={16} />;
  }
};

const buildFileTree = (files: Record<string, string>): FileNode[] => {
  const tree: FileNode[] = [];
  const fileMap = new Map<string, FileNode>();

  // Sort files by path
  const sortedFiles = Object.keys(files).sort();

  sortedFiles.forEach((filePath) => {
    const pathParts = filePath.split("/").filter((part) => part !== "");
    let currentPath = "";
    let parentNode: FileNode | null = null;

    // Create folder structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      currentPath += (currentPath ? "/" : "") + part;

      if (!fileMap.has(currentPath)) {
        const folderNode: FileNode = {
          id: currentPath,
          name: part,
          type: "folder",
          path: currentPath,
          children: [],
        };
        fileMap.set(currentPath, folderNode);

        if (parentNode) {
          parentNode.children!.push(folderNode);
        } else {
          tree.push(folderNode);
        }
      }
      parentNode = fileMap.get(currentPath)!;
    }

    // Create file node
    const fileName = pathParts[pathParts.length - 1];
    const fileNode: FileNode = {
      id: filePath,
      name: fileName,
      type: "file",
      path: filePath,
      content: files[filePath],
    };

    if (parentNode) {
      parentNode.children!.push(fileNode);
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
};

export const ArboristFileTree: React.FC<ArboristFileTreeProps> = ({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  selectedFile,
  height = "100%",
}) => {
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const handleCreateFile = () => {
    const newPath = "/new-file.js";
    onFileCreate?.(newPath, "// New file\n");
  };

  const handleCreateFolder = () => {
    const newPath = "/new-folder";
    onFileCreate?.(newPath, "");
  };

  return (
    <Box
      sx={{
        height,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#1f2937",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          borderBottom: 1,
          borderColor: "#374151",
          bgcolor: "#111827",
          color: "white",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: "white" }}
        >
          Explorer
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="New File">
            <IconButton
              size="small"
              onClick={handleCreateFile}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
              }}
            >
              <FilePlus size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Folder">
            <IconButton
              size="small"
              onClick={handleCreateFolder}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                },
              }}
            >
              <FolderPlus size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* React Arborist Tree */}
      <Box sx={{ flex: 1, overflow: "hidden", bgcolor: "#1f2937" }}>
        <Tree
          data={fileTree}
          indent={24}
          rowHeight={32}
          overscanCount={1}
          paddingTop={8}
          paddingBottom={8}
          className="file-tree"
        >
          {({ node, style, dragHandle }) => {
            const isSelected = selectedFile === node.data.path;
            const isFile = node.data.type === "file";

            return (
              <div
                ref={dragHandle}
                style={{
                  ...style,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  paddingRight: 8,
                  backgroundColor: isSelected
                    ? "rgba(79, 70, 229, 0.2)"
                    : "transparent",
                  borderLeft: isSelected
                    ? "3px solid #4f46e5"
                    : "3px solid transparent",
                  cursor: "pointer",
                  userSelect: "none",
                  color: isSelected ? "#4f46e5" : "#d1d5db",
                }}
                onClick={() => {
                  if (isFile) {
                    onFileSelect?.(node.data.path);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}
                >
                  <Box sx={{ color: isSelected ? "#4f46e5" : "#9ca3af" }}>
                    {getFileIcon(node.data.name)}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: isFile ? 400 : 500,
                      color: isSelected ? "#4f46e5" : "#d1d5db",
                    }}
                  >
                    {node.data.name}
                  </Typography>
                </Box>
              </div>
            );
          }}
        </Tree>
      </Box>
    </Box>
  );
};

export default ArboristFileTree;
