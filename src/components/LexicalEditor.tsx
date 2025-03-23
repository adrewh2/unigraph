/* eslint-disable unused-imports/no-unused-vars */
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  EditorState,
  LexicalEditor,
} from "lexical";
import React, { JSX, useEffect, useState } from "react";
import "./LexicalEditor.css";
import { TagPlugin } from "./lexical/plugins/TagPlugin";
import { ToolbarPlugin } from "./lexical/plugins/ToolbarPlugin";

// Create a separate PlaceholderPlugin component
const PlaceholderPlugin = ({
  placeholder,
}: {
  placeholder: string;
}): JSX.Element => {
  return <div className="editor-placeholder">{placeholder}</div>;
};

// Create an EditorStateInitializer plugin to properly initialize content
const EditorStateInitializer: React.FC<{ initialContent: string }> = ({
  initialContent,
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Initialize with the content only once
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        // Clear any existing content first
        root.clear();
        // Create a paragraph with the text
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(initialContent));
        root.append(paragraph);
      });
    }
  }, [editor, initialContent]);

  return null;
};

interface LexicalEditorProps {
  id?: string; // Add an ID prop to identify this editor instance
  initialContent?: string;
  onChange?: (markdown: string, html?: string) => void;
  showPreview?: boolean;
  onSave?: (content: string, tags?: string[]) => void;
}

const LexicalEditorV2: React.FC<LexicalEditorProps> = ({
  id = "default-editor", // Default ID if none provided
  initialContent = "",
  onChange,
  onSave,
}) => {
  // Use a stable storage key based on the provided ID
  const storageKey = `lexical-editor-content-${id}`;

  // Load content from localStorage on initial render
  const savedContent = React.useMemo(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      console.log("Loading content from storage", storageKey, saved);
      return saved || initialContent;
    } catch (e) {
      console.warn("Failed to load from localStorage:", e);
      return initialContent;
    }
  }, [storageKey, initialContent]);

  const [markdown, setMarkdown] = useState(savedContent);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // Save to localStorage whenever content changes
  useEffect(() => {
    try {
      console.log("Saving content to storage", storageKey, markdown);
      localStorage.setItem(storageKey, markdown);
    } catch (e) {
      console.warn("Failed to save to localStorage:", e);
    }
  }, [markdown, storageKey]);

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
      hashtag: "editor-text-hashtag", // Add hashtag styling
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
    hashtag: "my-hashtag-class",
  };

  // Handle tags change
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  // Handle editor updates - define before initialConfig to avoid reference errors
  const handleEditorChange = (
    editorState: EditorState,
    editor: LexicalEditor
  ) => {
    setEditorState(editorState);

    editorState.read(() => {
      const root = $getRoot();
      const _selection = $getSelection();
      const textContent = root.getTextContent();
      setMarkdown(textContent);

      if (onChange) {
        onChange(textContent);
      }
    });
  };

  // Define initial config for LexicalComposer
  const initialConfig = {
    namespace: "LexicalEditor",
    theme,
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
    // Don't try to parse saved content as editor state - we'll handle initialization separately
    onError: (error: Error) => {
      console.error(error);
    },
    onChange: handleEditorChange, // Connect the handler here
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
    let markdownContent = markdown;

    if (editorState) {
      editorState.read(() => {
        markdownContent = $convertToMarkdownString(TRANSFORMERS);
      });
    }

    const blob = new Blob([markdownContent], {
      type: "text/markdown;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="lexical-editor-container">
      {tags.length > 0 && (
        <div className="tags-display">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="lexical-content">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-wrapper">
            <ToolbarPlugin onSave={handleSave} onExport={handleExport} />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={
                  <PlaceholderPlugin placeholder="Enter some text... (Use #tag to create tags)" />
                }
                ErrorBoundary={({ children }) => (
                  <div className="editor-error">
                    An error occurred while rendering the editor.
                  </div>
                )}
              />
              {/* Add our EditorStateInitializer to properly set initial content */}
              <EditorStateInitializer initialContent={savedContent} />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <HashtagPlugin />
              <TagPlugin onTagsChange={handleTagsChange} />
              <TablePlugin />
              <CheckListPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ClearEditorPlugin />
              <OnChangePlugin onChange={handleEditorChange} />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditorV2;
