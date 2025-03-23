import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
import { Download, Save } from "lucide-react";
import React, { useState } from "react";
import "./LexicalEditor.css";
import { ToolbarPlugin } from "./lexical/plugins/ToolbarPlugin";

interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (markdown: string, html?: string) => void;
  isDarkMode?: boolean;
  showPreview?: boolean;
  onSave?: (content: string) => void;
}

const LexicalEditorV2: React.FC<LexicalEditorProps> = ({
  initialContent = "",
  onChange,
  isDarkMode = false,
  onSave,
}) => {
  const [markdown, setMarkdown] = useState(initialContent);
  const [_editorState, setEditorState] = useState<EditorState | null>(null);

  // Define theme
  const theme = {
    ltr: "ltr",
    rtl: "rtl",
    paragraph: "editor-paragraph",
    quote: "editor-quote",
    heading: {
      h1: "editor-heading-h1",
      h2: "editor-heading-h2",
      h3: "editor-heading-h3",
      h4: "editor-heading-h4",
      h5: "editor-heading-h5",
    },
    list: {
      nested: {
        listitem: "editor-nested-listitem",
      },
      ol: "editor-list-ol",
      ul: "editor-list-ul",
      listitem: "editor-listitem",
    },
    image: "editor-image",
    link: "editor-link",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
      underlineStrikethrough: "editor-text-underlineStrikethrough",
      code: "editor-text-code",
    },
    code: "editor-code",
    codeHighlight: {
      atrule: "editor-tokenAttr",
      attr: "editor-tokenAttr",
      boolean: "editor-tokenProperty",
      builtin: "editor-tokenSelector",
      cdata: "editor-tokenComment",
      char: "editor-tokenSelector",
      class: "editor-tokenFunction",
      "class-name": "editor-tokenFunction",
      comment: "editor-tokenComment",
      constant: "editor-tokenProperty",
      deleted: "editor-tokenProperty",
      doctype: "editor-tokenComment",
      entity: "editor-tokenOperator",
      function: "editor-tokenFunction",
      important: "editor-tokenVariable",
      inserted: "editor-tokenSelector",
      keyword: "editor-tokenAttr",
      namespace: "editor-tokenVariable",
      number: "editor-tokenProperty",
      operator: "editor-tokenOperator",
      prolog: "editor-tokenComment",
      property: "editor-tokenProperty",
      punctuation: "editor-tokenPunctuation",
      regex: "editor-tokenVariable",
      selector: "editor-tokenSelector",
      string: "editor-tokenSelector",
      symbol: "editor-tokenProperty",
      tag: "editor-tokenProperty",
      url: "editor-tokenOperator",
      variable: "editor-tokenVariable",
    },
  };

  // Define initial config for LexicalComposer
  const initialConfig = {
    namespace: "LexicalEditor",
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
      HashtagNode,
    ],
  };

  // Handle editor updates
  const _handleEditorChange = (
    editorState: EditorState,
    _editor: LexicalEditor
  ) => {
    setEditorState(editorState);

    // You would need to implement a proper conversion to markdown here
    editorState.read(() => {
      const root = $getRoot();
      const _selection = $getSelection();

      // For now, we'll just get the text content
      // In a real implementation, you'd convert the editor state to markdown
      const textContent = root.getTextContent();
      setMarkdown(textContent);

      if (onChange) {
        onChange(textContent);
      }
    });
  };

  // Handle save button click
  const handleSave = () => {
    if (onSave) {
      onSave(markdown);
    } else {
      console.log("Save function not provided");
    }
  };

  // Handle export button click
  const handleExport = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div
      className={`lexical-editor-container ${isDarkMode ? "dark-mode" : ""}`}
    >
      {/* Toolbar */}
      <div className="lexical-toolbar">
        <button
          className="lexical-toolbar-button"
          onClick={handleSave}
          title="Save document"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          className="lexical-toolbar-button"
          onClick={handleExport}
          title="Export as Markdown"
        >
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      <div className="lexical-content">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-wrapper">
            <ToolbarPlugin />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={
                  <div className="editor-placeholder">Enter some text...</div>
                }
                // eslint-disable-next-line unused-imports/no-unused-vars
                ErrorBoundary={({ children }) => (
                  <div className="editor-error">
                    An error occurred while rendering the editor.
                  </div>
                )}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              {/* <CodeHighlightPlugin /> */}
              <ListPlugin />
              <LinkPlugin />
              <HashtagPlugin />
              <TablePlugin />
              <CheckListPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ClearEditorPlugin />
              {/* Add any other plugins as needed */}
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditorV2;
