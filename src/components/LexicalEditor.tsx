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
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { $getRoot, EditorState, LexicalEditor } from "lexical";
import { debounce, throttle } from "lodash";
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

// Create an EditorStateInitializer plugin to properly initialize content from saved state
const EditorStateInitializer: React.FC<{ savedState: string | null }> = ({
  savedState,
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (savedState) {
      try {
        // Try to parse and load the saved state
        const parsedState = JSON.parse(savedState);
        editor.setEditorState(editor.parseEditorState(parsedState));
      } catch (error) {
        console.error("Error restoring editor state:", error);
      }
    }
  }, [editor, savedState]);

  return null;
};

// Create an OnChangePlugin replacement that doesn't cause too many re-renders
const CustomOnChangePlugin: React.FC<{
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
}> = ({ onChange }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState, editor);
    });
  }, [editor, onChange]);

  return null;
};

interface LexicalEditorProps {
  id?: string; // Add an ID prop to identify this editor instance
  initialContent?: string;
  onChange?: (markdown: string, html?: string) => void;
  showPreview?: boolean;
  onSave?: (content: string, tags?: string[]) => void;
}

// Create a debounced save function that we'll use later
const createSaveState = (storageKey: string, stateStorageKey: string) => {
  // Use throttle for content changes (less important)
  const saveContent = throttle((content: string) => {
    try {
      localStorage.setItem(storageKey, content);
    } catch (e) {
      console.warn("Failed to save content to localStorage:", e);
    }
  }, 1000); // Save content at most once per second

  // Use debounce for state changes (more important)
  const saveState = debounce((state: string) => {
    try {
      localStorage.setItem(stateStorageKey, state);
    } catch (e) {
      console.warn("Failed to save state to localStorage:", e);
    }
  }, 2000); // Save state at most once every 2 seconds

  return { saveContent, saveState };
};

const LexicalEditorV2: React.FC<LexicalEditorProps> = ({
  id = "default-editor", // Default ID if none provided
  initialContent = "",
  onChange,
  onSave,
}) => {
  // Use a stable storage key based on the provided ID
  const storageKey = `lexical-editor-content-${id}`;
  const stateStorageKey = `lexical-editor-state-${id}`;

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

  // Load saved state
  const [savedState, setSavedState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(stateStorageKey);
    } catch (e) {
      console.warn("Failed to load state from localStorage:", e);
      return null;
    }
  });

  // Move these outside of the render function to prevent recreation
  const saveContent = React.useRef(
    throttle((content: string) => {
      try {
        localStorage.setItem(storageKey, content);
      } catch (e) {
        console.warn("Failed to save content to localStorage:", e);
      }
    }, 2000)
  ).current;

  const saveState = React.useRef(
    debounce((state: string) => {
      try {
        localStorage.setItem(stateStorageKey, state);
      } catch (e) {
        console.warn("Failed to save state to localStorage:", e);
      }
    }, 3000)
  ).current;

  // Use refs for internal state that shouldn't trigger rerenders
  const markdownRef = React.useRef(savedContent);
  const tagsRef = React.useRef<string[]>([]);

  // These are still needed for UI updates
  const [markdown, setMarkdown] = useState(savedContent);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // Optimize change handler
  const handleEditorChange = React.useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      // We update the ref first
      setEditorState(editorState);

      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        // Update ref directly - no UI impact
        markdownRef.current = textContent;

        // Throttled storage updates
        saveState(JSON.stringify(editorState.toJSON()));
        saveContent(textContent);

        // Only update state (causing re-render) occasionally
        // This makes the UI much more responsive
        if (Math.random() < 0.1) {
          // Update UI roughly every 10 changes
          setMarkdown(textContent);
        }

        if (onChange) {
          onChange(textContent);
        }
      });
    },
    [onChange, saveContent, saveState]
  );

  // Handle tags change
  const handleTagsChange = React.useCallback((newTags: string[]) => {
    tagsRef.current = newTags;
    setTags(newTags);
  }, []);

  // Define theme inside useMemo
  const theme = React.useMemo(
    () => ({
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
    }),
    []
  );

  // Make sure the onChange handler is stable
  const initialConfig = React.useMemo(
    () => ({
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
      onError: (error: Error) => {
        console.error(error);
      },
    }),
    [theme]
  );

  // Handle save button click
  const handleSave = React.useCallback(() => {
    const currentContent = markdownRef.current;
    const currentTags = tagsRef.current;

    if (onSave) {
      onSave(currentContent, currentTags);
    } else {
      // Force save to localStorage
      saveContent.flush();
      saveState.flush();
      console.log("Save function not provided - saved to localStorage");
    }
  }, [onSave, saveContent, saveState]);

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
              <EditorStateInitializer savedState={savedState} />
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
              {/* Replace OnChangePlugin with our optimized version */}
              <CustomOnChangePlugin onChange={handleEditorChange} />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditorV2;
