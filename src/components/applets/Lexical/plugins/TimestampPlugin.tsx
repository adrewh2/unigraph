import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  NodeKey,
  TextNode,
} from "lexical";
import React, { useCallback, useEffect } from "react";

export interface TimestampPluginProps {
  onInsertTimestamp?: (insertFn: (timestamp: string) => void) => void;
}

// Custom Lexical node for timestamp tags
export class TimestampNode extends TextNode {
  static getType(): string {
    return "timestamp";
  }

  static clone(node: TimestampNode): TimestampNode {
    return new TimestampNode(node.__timestamp, node.__key);
  }

  constructor(timestamp: string, key?: NodeKey) {
    super(`[${timestamp}]`, key);
    this.__timestamp = timestamp;
  }

  __timestamp: string;

  getTimestamp(): string {
    return this.__timestamp;
  }

  setTimestamp(timestamp: string): void {
    const writable = this.getWritable();
    writable.__timestamp = timestamp;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "timestamp-tag";
    span.textContent = `[${this.__timestamp}]`;
    span.style.cssText = `
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
      font-weight: 500;
      margin: 0 2px;
      border: 1px solid #bbdefb;
      cursor: pointer;
      user-select: none;
    `;

    // Add click handler to make timestamps clickable
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Could emit event for parent to handle timestamp navigation
      const event = new CustomEvent("timestampClick", {
        detail: { timestamp: this.__timestamp },
      });
      document.dispatchEvent(event);
    });

    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): true {
    return true;
  }

  static importJSON(serializedNode: any): TimestampNode {
    const { timestamp } = serializedNode;
    return new TimestampNode(timestamp);
  }

  exportJSON(): any {
    return {
      timestamp: this.__timestamp,
      type: "timestamp",
      version: 1,
    };
  }
}

// Helper function to create a timestamp node
export function $createTimestampNode(timestamp: string): TimestampNode {
  return new TimestampNode(timestamp);
}

// Plugin component
export const TimestampPlugin: React.FC<TimestampPluginProps> = ({
  onInsertTimestamp,
}) => {
  const [editor] = useLexicalComposerContext();

  // Function to insert timestamp at current cursor position
  const insertTimestamp = useCallback(
    (timestamp: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a timestamp node
          const timestampNode = $createTimestampNode(timestamp);

          // Insert the timestamp node at the current selection
          selection.insertNodes([timestampNode]);

          // Add a space after the timestamp for better UX
          const spaceNode = $createTextNode(" ");
          selection.insertNodes([spaceNode]);

          // Move cursor to the end of the inserted content
          spaceNode.select();
        }
      });
    },
    [editor]
  );

  // Expose the insert function to parent components
  useEffect(() => {
    if (onInsertTimestamp) {
      onInsertTimestamp(insertTimestamp);
    }
  }, [insertTimestamp, onInsertTimestamp]);

  return null;
};

// Hook to use the timestamp insertion functionality
export const useTimestampInsertion = (editor: LexicalEditor) => {
  return useCallback(
    (timestamp: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a timestamp node
          const timestampNode = $createTimestampNode(timestamp);

          // Insert the timestamp node at the current selection
          selection.insertNodes([timestampNode]);

          // Add a space after the timestamp for better UX
          const spaceNode = $createTextNode(" ");
          selection.insertNodes([spaceNode]);

          // Move cursor to the end of the inserted content
          spaceNode.select();
        }
      });
    },
    [editor]
  );
};

export default TimestampPlugin;
