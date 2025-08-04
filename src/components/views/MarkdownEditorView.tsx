import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import { Download, Eye, EyeOff, FileText, Upload } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  createDocument,
  deleteDocument,
  deleteDocumentRecursive,
  getDocument,
  updateDocument,
} from "../../api/documentsApi";
import FileTreeView, { FileTreeInstance } from "../common/FileTreeView";
import "../common/MarkdownViewer.css";
import ResizableSplitter from "../common/ResizableSplitter";

interface MarkdownEditorViewProps {
  initialContent?: string;
  filename?: string;
  theme?: "dark" | "light";
  height?: string | number;
  showPreview?: boolean;
  onSave?: (content: string) => void;
  onLoad?: () => string;
  userId?: string;
  projectId?: string;
}

const defaultMarkdownContent = `# Welcome to Markdown Editor

This is a live markdown editor with preview capabilities.

## Features

- **Live Preview**: See your markdown rendered in real-time
- **Syntax Highlighting**: Full markdown syntax support
- **File Operations**: Save and load markdown files
- **Split View**: Edit and preview side by side

## Getting Started

1. Start typing in the editor
2. Use markdown syntax like \`**bold**\`, \`*italic*\`, \`# headings\`
3. See the preview update in real-time
4. Toggle preview visibility with the eye icon

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

## Lists

- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

## Links and Images

[Visit GitHub](https://github.com)

![Example Image](https://via.placeholder.com/300x200)

---

*Happy editing!*`;

const MarkdownEditorContent: React.FC<{
  selectedFile: string;
  content: string;
  onContentUpdate: (content: string) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onLoad: () => void;
  theme: any;
}> = ({
  selectedFile,
  content,
  onContentUpdate,
  showPreview,
  onTogglePreview,
  onSave,
  onLoad,
  theme,
}) => {
  const { sandpack } = useSandpack();
  const { code } = useActiveCode();

  // Sync content changes back to our state immediately
  useEffect(() => {
    if (selectedFile) {
      onContentUpdate(code);
    }
  }, [code, selectedFile, onContentUpdate]);

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100%" }}>
      {/* Toolbar */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          gap: 1,
          backgroundColor: getColor(theme.colors, "surface"),
          border: `1px solid ${getColor(theme.colors, "border")}`,
          borderRadius: 1,
          padding: 0.5,
        }}
      >
        <Tooltip title="Toggle Preview">
          <IconButton
            size="small"
            onClick={onTogglePreview}
            sx={{
              color: getColor(theme.colors, "text"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
            }}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Save File">
          <IconButton
            size="small"
            onClick={onSave}
            sx={{
              color: getColor(theme.colors, "text"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
            }}
          >
            <Download size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Load File">
          <IconButton
            size="small"
            onClick={onLoad}
            sx={{
              color: getColor(theme.colors, "text"),
              "&:hover": {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              },
            }}
          >
            <Upload size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          flex: showPreview ? 1 : 1,
          overflow: "hidden",
          borderRight: showPreview ? 1 : 0,
          borderColor: getColor(theme.colors, "border"),
        }}
      >
        <SandpackCodeEditor
          showLineNumbers
          showInlineErrors
          wrapContent
          showTabs={false}
        />
      </Box>

      {/* Preview */}
      {showPreview && (
        <>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <SandpackPreview />
          </Box>
        </>
      )}
    </Box>
  );
};

export const MarkdownEditorView: React.FC<MarkdownEditorViewProps> = ({
  initialContent = defaultMarkdownContent,
  filename = "document.md",
  theme: _theme = "dark",
  height: _height = "100%",
  showPreview: _showPreview = true,
  onSave,
  onLoad,
  userId,
  projectId,
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState<boolean>(_showPreview);
  const [previewToggleCount, setPreviewToggleCount] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Create markdown editor file tree instance
  const markdownEditorInstance: FileTreeInstance = useMemo(
    () => ({
      id: "markdown-editor",
      name: "Markdown Files",
      dataSource: {
        id: "supabase-documents",
        name: "Supabase Documents",
        type: "supabase",
        config: {
          userId,
          projectId,
        },
      },
      rootPath: "/documents",
      hideEmptyFolders: true,
      onFileSelect: async (
        filePath: string,
        metadata?: Record<string, any>
      ) => {
        setSelectedFile(filePath);
        console.log("Selected file:", filePath, "Metadata:", metadata);

        if (metadata?.documentId) {
          setIsLoading(true);
          try {
            const document = await getDocument(metadata.documentId);
            // Always update content to ensure we have the latest version
            setContent(document.content || "");
            setCurrentDocumentId(document.id);
            console.log("Loaded document:", document);
          } catch (error) {
            console.error("Error loading document:", error);
            // Fallback to default content
            setContent(defaultMarkdownContent);
            setCurrentDocumentId(null);
          } finally {
            setIsLoading(false);
          }
        } else {
          // No document ID, use default content
          setContent(defaultMarkdownContent);
          setCurrentDocumentId(null);
        }
      },
      onCreateDocument: async (title: string, parentId?: string) => {
        try {
          const newDocument = await createDocument({
            title,
            content: `# ${title}\n\nStart writing your document here...`,
            extension: "md",
            metadata: {},
            data: {},
            project_id: projectId,
            parent_id: parentId,
          });
          console.log("Created new document:", newDocument);
          // The tree will refresh automatically when the parent component re-renders
        } catch (error) {
          console.error("Error creating document:", error);
          throw error;
        }
      },
      onCreateFolder: async (title: string, parentId?: string) => {
        try {
          // For folders, we create a document with "folder" extension
          const newFolder = await createDocument({
            title,
            content: `# ${title}\n\nThis is a folder. Add documents here.`,
            extension: "folder",
            metadata: { isFolder: true, type: "folder" },
            data: { type: "folder" },
            project_id: projectId,
            parent_id: parentId,
          });
          console.log("Created new folder:", newFolder);
          // The tree will refresh automatically when the parent component re-renders
        } catch (error) {
          console.error("Error creating folder:", error);
          throw error;
        }
      },
      onDeleteNode: async (
        filePath: string,
        metadata?: Record<string, any>
      ) => {
        const documentId = metadata?.documentId;
        if (!documentId) {
          console.error("No document ID found in metadata");
          return;
        }

        try {
          if (metadata.isFolder) {
            await deleteDocumentRecursive(documentId);
            console.log("Folder deleted recursively:", documentId);
          } else {
            await deleteDocument(documentId);
            console.log("Document deleted:", documentId);
          }

          if (currentDocumentId === documentId) {
            setContent(defaultMarkdownContent);
            setCurrentDocumentId(null);
            setSelectedFile(null);
          }
        } catch (error) {
          console.error("Error deleting document/folder:", error);
          throw error;
        }
      },
      onRenameNode: async (
        filePath: string,
        newTitle: string,
        metadata?: Record<string, any>
      ) => {
        const documentId = metadata?.documentId;
        if (!documentId) {
          console.error("No document ID found in metadata");
          return;
        }

        try {
          // Update the document title in Supabase
          await updateDocument({ id: documentId, title: newTitle });
          console.log("Document renamed:", documentId, "to", newTitle);
        } catch (error) {
          console.error("Error renaming document:", error);
          throw error;
        }
      },
    }),
    [userId, projectId]
  );

  // Create files object for Sandpack with proper theme integration
  const files = useMemo(
    () => ({
      [filename]: content,
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
    <style>
        :root {
            --border-color: ${getColor(theme.colors, "border")};
            --surface-color: ${getColor(theme.colors, "surface")};
            --background-color: ${getColor(theme.colors, "background")};
            --text-color: ${getColor(theme.colors, "text")};
            --text-secondary-color: ${getColor(theme.colors, "textSecondary")};
        }
        
        body {
            margin: 0;
            padding: 20px;
            background-color: var(--background-color);
            color: var(--text-color);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        
        .markdown-body {
            max-width: 800px;
            margin: 0 auto;
            color: var(--text-color);
            background-color: var(--background-color);
        }
        
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
            color: var(--text-color);
            border-bottom-color: var(--border-color);
        }
        
        .markdown-body p,
        .markdown-body li,
        .markdown-body blockquote {
            color: var(--text-color);
        }
        
        .markdown-body a {
            color: ${getColor(theme.colors, "link")};
        }
        
        .markdown-body a:hover {
            color: ${getColor(theme.colors, "linkHover")};
        }
        
        .markdown-body pre {
            background-color: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
        }
        
        .markdown-body code {
            background-color: var(--surface-color);
            color: var(--text-color);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 85%;
        }
        
        .markdown-body pre code {
            background-color: transparent;
            padding: 0;
        }
        
        .markdown-body blockquote {
            border-left: 4px solid var(--border-color);
            padding-left: 16px;
            color: var(--text-secondary-color);
        }
        
        .markdown-body table {
            border-collapse: collapse;
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
        }
        
        .markdown-body table th,
        .markdown-body table td {
            border: 1px solid var(--border-color);
            padding: 6px 13px;
        }
        
        .markdown-body table th {
            background-color: var(--surface-color);
            color: var(--text-color);
            font-weight: 600;
        }
        
        .markdown-body table td {
            background-color: var(--background-color);
            color: var(--text-color);
        }
        
        .markdown-body tr:nth-child(even) td {
            background-color: var(--surface-color);
        }
        
        .markdown-body hr {
            border-color: var(--border-color);
        }
        
        .markdown-body strong {
            color: var(--text-color);
        }
        
        .markdown-body em {
            color: var(--text-color);
        }
    </style>
</head>
<body>
    <div class="markdown-body" id="content"></div>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
        // Get the markdown content from the editor
        const markdownContent = \`${content.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        
        // Display the HTML
        document.getElementById('content').innerHTML = htmlContent;
        
        // Update content when it changes (this will be handled by Sandpack's file system)
        // The preview will automatically update when the file changes
    </script>
</body>
</html>`,
    }),
    [content, theme.colors]
  );

  // Create a stable key for SandpackProvider that only changes when necessary
  const sandpackKey = useMemo(() => {
    return `sandpack-${showPreview}-${previewToggleCount}-${currentDocumentId || "default"}`;
  }, [showPreview, previewToggleCount, currentDocumentId]);

  const handleContentUpdate = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleTogglePreview = useCallback(() => {
    setShowPreview((prev) => {
      const newValue = !prev;
      // Increment toggle count to force re-render
      setPreviewToggleCount((count) => count + 1);
      return newValue;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (onSave) {
      onSave(content);
    } else if (currentDocumentId) {
      // Save to Supabase
      try {
        await updateDocument({
          id: currentDocumentId,
          content,
        });
        console.log("Document saved to Supabase");
      } catch (error) {
        console.error("Error saving document:", error);
      }
    } else {
      // Default save behavior - download file
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [content, filename, onSave, currentDocumentId]);

  const handleLoad = useCallback(() => {
    if (onLoad) {
      const loadedContent = onLoad();
      setContent(loadedContent);
    } else {
      // Default load behavior - open file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md,.markdown,.txt";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            setContent(text);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  }, [onLoad]);

  const handleWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  const leftPanel = (
    <div
      style={{
        backgroundColor: getColor(theme.colors, "backgroundSecondary"),
        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
        height: "100%",
      }}
    >
      <FileTreeView
        instance={markdownEditorInstance}
        onFileSelect={markdownEditorInstance.onFileSelect}
        selectedFile={selectedFile || undefined}
        showHeader={true}
        headerTitle="Documents"
        showSearch={true}
        showCreateButtons={true}
        hideEmptyFolders={false}
      />
    </div>
  );

  const rightPanel = (
    <Box
      sx={{
        height: _height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        "& .sp-wrapper": {
          height: "100% !important",
          maxHeight: "100% !important",
        },
        "& .sp-layout": {
          height: "100% !important",
          maxHeight: "100% !important",
        },
        "& .sp-stack": {
          height: "100% !important",
        },
        "& .sp-code-editor": {
          height: "100% !important",
        },
        "& .sp-preview": {
          height: "100% !important",
        },
        "& .sp-preview-container": {
          height: "100% !important",
        },
        "& .sp-preview-iframe": {
          height: "100% !important",
        },
        "& .sp-preview-error": {
          height: "100% !important",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: 1,
          borderBottom: 1,
          borderColor: getColor(theme.colors, "border"),
          backgroundColor: getColor(theme.colors, "surface"),
        }}
      >
        <FileText
          size={16}
          style={{ marginRight: 8, color: getColor(theme.colors, "text") }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            color: getColor(theme.colors, "text"),
          }}
        >
          {selectedFile || filename}
          {isLoading && " (Loading...)"}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: getColor(theme.colors, "textSecondary"),
          }}
        >
          Markdown Editor
        </Typography>
      </Box>

      {/* Editor and Preview */}
      <Box sx={{ flex: 1, height: 0 }}>
        <SandpackProvider
          key={sandpackKey}
          template="static"
          files={files}
          theme={nightOwl}
          options={{
            autorun: true,
            activeFile: filename,
            visibleFiles: [filename],
          }}
        >
          <MarkdownEditorContent
            selectedFile={filename}
            content={content}
            onContentUpdate={handleContentUpdate}
            showPreview={showPreview}
            onTogglePreview={handleTogglePreview}
            onSave={handleSave}
            onLoad={handleLoad}
            theme={theme}
          />
        </SandpackProvider>
      </Box>
    </Box>
  );

  return (
    <div
      style={{
        height: _height,
        width: "100%",
        backgroundColor: getColor(theme.colors, "background"),
      }}
    >
      <ResizableSplitter
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        leftPanelWidth={sidebarWidth}
        onWidthChange={handleWidthChange}
        minLeftWidth={200}
        maxLeftWidth={600}
        splitterWidth={6}
      />
    </div>
  );
};

export default MarkdownEditorView;
