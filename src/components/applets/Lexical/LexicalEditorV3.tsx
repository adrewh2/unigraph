/* eslint-disable unused-imports/no-unused-vars */
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
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
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  EditorState,
  LexicalEditor,
} from "lexical";
import { debounce } from "lodash";
import React, { JSX, useEffect, useState } from "react";
// Import Supabase API functions
import { getDocument, updateDocument } from "../../../api/documentsApi";
import "./LexicalEditor.css";
import { MentionNode } from "./nodes/MentionNode";
import { EntityReferenceNode } from "./plugins/EntityReferencePlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";

// Create a separate PlaceholderPlugin component
const PlaceholderPlugin = ({
  placeholder,
}: {
  placeholder: string;
}): JSX.Element => {
  return <div className="editor-placeholder">{placeholder}</div>;
};

// EditorStateInitializer for fresh content loading
const EditorStateInitializer: React.FC<{
  content: string;
  contentKey: string; // Key to force re-initialization when content changes
}> = ({ content, contentKey }) => {
  const [editor] = useLexicalComposerContext();
  const lastContentKey = React.useRef<string>("");

  useEffect(() => {
    // Only initialize if the content key has changed
    if (lastContentKey.current === contentKey) {
      return;
    }

    lastContentKey.current = contentKey;
    console.log(
      "LexicalEditorV3: EditorStateInitializer: Initializing with content length:",
      content.length,
      "contentKey:",
      contentKey
    );

    if (content && content.trim().length > 0) {
      // Create a simple editor state with the content
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Split content by newlines to create paragraphs
        const paragraphs = content.split(/\r?\n\r?\n/);
        for (const paragraph of paragraphs) {
          if (paragraph.trim().length > 0) {
            const paragraphNode = $createParagraphNode();
            const lines = paragraph.split(/\r?\n/);

            for (let i = 0; i < lines.length; i++) {
              paragraphNode.append($createTextNode(lines[i]));
              if (i < lines.length - 1) {
                // Add line breaks between lines in the same paragraph
                paragraphNode.append($createLineBreakNode());
              }
            }

            root.append(paragraphNode);
          }
        }
      });
    } else {
      // Initialize with empty content
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode().append($createTextNode("")));
      });
    }
  }, [content, contentKey, editor]);

  return null;
};

// Custom onChange Plugin that doesn't cause too many re-renders
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

interface LexicalEditorV3Props {
  documentId: string; // Required: Supabase document ID
  initialContent?: string; // Fallback content if document is empty
  onChange?: (content: string) => void;
  autoSaveInterval?: number; // Auto-save interval in milliseconds
}

const LexicalEditorV3: React.FC<LexicalEditorV3Props> = ({
  documentId,
  initialContent = "",
  onChange,
  autoSaveInterval = 3000, // Default 3 seconds
}) => {
  console.log("LexicalEditorV3: Component initialized with props:", {
    documentId,
    initialContentLength: initialContent.length,
    autoSaveInterval,
  });

  // Content state
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use refs to avoid stale closures in debounced functions
  const contentRef = React.useRef<string>("");

  // Load content from Supabase on mount and when documentId changes
  useEffect(() => {
    if (!documentId) return;

    console.log("LexicalEditorV3: Loading document from server:", documentId);
    setIsLoading(true);

    getDocument(documentId)
      .then((document) => {
        const documentContent = document.content || initialContent;
        console.log("LexicalEditorV3: Loaded content from server:", {
          documentId,
          contentLength: documentContent.length,
          preview: documentContent.substring(0, 100) + "...",
        });
        setContent(documentContent);
        contentRef.current = documentContent;
      })
      .catch((error) => {
        console.error("LexicalEditorV3: Error loading document:", error);
        setContent(initialContent);
        contentRef.current = initialContent;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [documentId, initialContent]);

  // Debounced save function
  const saveToServer = React.useMemo(
    () =>
      debounce(async (contentToSave: string) => {
        if (!documentId || !contentToSave) return;

        try {
          setIsSaving(true);
          console.log("LexicalEditorV3: Saving to server:", {
            documentId,
            contentLength: contentToSave.length,
            preview: contentToSave.substring(0, 100) + "...",
          });

          await updateDocument({
            id: documentId,
            content: contentToSave,
          });

          const now = new Date();
          setLastSaved(now);
          console.log(
            "LexicalEditorV3: Successfully saved to server at",
            now.toLocaleTimeString()
          );
        } catch (error) {
          console.error("LexicalEditorV3: Error saving to server:", error);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveInterval),
    [documentId, autoSaveInterval]
  );

  // Handle editor content changes
  const handleEditorChange = React.useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();

        // Update refs for latest content
        contentRef.current = textContent;

        console.log("LexicalEditorV3: Content changed:", {
          textLength: textContent.length,
          preview: textContent.substring(0, 50) + "...",
        });

        // Trigger autosave
        saveToServer(textContent);

        // Call onChange callback if provided
        if (onChange) {
          onChange(textContent);
        }
      });
    },
    [onChange, saveToServer]
  );

  // Handle manual save
  const handleSave = React.useCallback(() => {
    console.log("LexicalEditorV3: Manual save triggered");
    // Cancel pending debounced save and save immediately
    saveToServer.cancel();
    if (contentRef.current) {
      saveToServer(contentRef.current);
      saveToServer.flush(); // Execute immediately
    }
  }, [saveToServer]);

  // Handle export
  const handleExport = React.useCallback(() => {
    const contentToExport = contentRef.current || content;
    const blob = new Blob([contentToExport], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [content]);

  // Save on unmount
  useEffect(() => {
    return () => {
      console.log("LexicalEditorV3: Component unmounting, forcing save");
      saveToServer.flush();
    };
  }, [saveToServer]);

  // Define Lexical theme
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
        hashtag: "editor-text-hashtag",
        entityReference: "editor-text-entity-reference",
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

  // Lexical initial configuration
  const initialConfig = React.useMemo(
    () => ({
      namespace: "LexicalEditorV3",
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
        EntityReferenceNode,
        MentionNode,
      ],
      onError: (error: Error) => {
        console.error("LexicalEditorV3: Lexical error:", error);
      },
    }),
    [theme]
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="lexical-editor-container">
        <div className="editor-loading">Loading document...</div>
      </div>
    );
  }

  // Generate a key based on content to force re-initialization when content changes
  const contentKey = `${documentId}-${content.length}-${content.substring(0, 50)}`;

  return (
    <div className="lexical-editor-container">
      <div className="lexical-content">
        <LexicalComposer key={contentKey} initialConfig={initialConfig}>
          <div className="editor-wrapper">
            <div className="toolbar-container">
              <ToolbarPlugin onSave={handleSave} onExport={handleExport} />
            </div>
            <div className="editor-inner">
              {/* Status indicator */}
              <div className="autosave-indicator persistent">
                {isSaving
                  ? "Saving..."
                  : lastSaved
                    ? `Last saved at ${lastSaved.toLocaleTimeString()}`
                    : "Not saved yet"}
              </div>

              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={
                  <PlaceholderPlugin placeholder="Start typing your document..." />
                }
                ErrorBoundary={({ children }) => (
                  <div className="editor-error">
                    An error occurred while rendering the editor.
                  </div>
                )}
              />

              {/* Initialize editor content */}
              <EditorStateInitializer
                content={content}
                contentKey={contentKey}
              />

              {/* Lexical plugins */}
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <HashtagPlugin />
              <TablePlugin />
              <CheckListPlugin />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
              <ClearEditorPlugin />

              {/* Custom onChange handler */}
              <CustomOnChangePlugin onChange={handleEditorChange} />

              <MentionsPlugin />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
};

export default LexicalEditorV3;
