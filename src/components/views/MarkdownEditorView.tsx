import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { getColor, useTheme } from "@aesgraph/app-shell";
import { Box, Divider, Typography, IconButton, Tooltip } from "@mui/material";
import { FileText, Eye, EyeOff, Download, Upload } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import "../common/MarkdownViewer.css";

interface MarkdownEditorViewProps {
  initialContent?: string;
  filename?: string;
  theme?: "dark" | "light";
  height?: string | number;
  showPreview?: boolean;
  onSave?: (content: string) => void;
  onLoad?: () => string;
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
  theme
}) => {
  const { sandpack } = useSandpack();
  const { code } = useActiveCode();

  // Sync content changes back to our state
  useEffect(() => {
    if (selectedFile && code !== content) {
      onContentUpdate(code);
    }
  }, [code, selectedFile, content, onContentUpdate]);

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
              '&:hover': {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              }
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
              '&:hover': {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              }
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
              '&:hover': {
                backgroundColor: getColor(theme.colors, "surfaceHover"),
              }
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
}) => {
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(initialContent);
  const [showPreview, setShowPreview] = useState<boolean>(_showPreview);

  // Create files object for Sandpack with proper theme integration
  const files = {
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
        const markdownContent = \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
        
        // Convert markdown to HTML
        const htmlContent = marked.parse(markdownContent);
        
        // Display the HTML
        document.getElementById('content').innerHTML = htmlContent;
        
        // Update content when it changes (this will be handled by Sandpack's file system)
        // The preview will automatically update when the file changes
    </script>
</body>
</html>`,
  };

  const handleContentUpdate = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(content);
    } else {
      // Default save behavior - download file
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [content, filename, onSave]);

  const handleLoad = useCallback(() => {
    if (onLoad) {
      const loadedContent = onLoad();
      setContent(loadedContent);
    } else {
      // Default load behavior - open file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt';
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

  return (
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
        <FileText size={16} style={{ marginRight: 8, color: getColor(theme.colors, "text") }} />
        <Typography 
          variant="body2" 
          sx={{ 
            flex: 1,
            color: getColor(theme.colors, "text")
          }}
        >
          {filename}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: getColor(theme.colors, "textSecondary")
          }}
        >
          Markdown Editor
        </Typography>
      </Box>

      {/* Editor and Preview */}
      <Box sx={{ flex: 1, height: 0 }}>
        <SandpackProvider
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
};

export default MarkdownEditorView; 