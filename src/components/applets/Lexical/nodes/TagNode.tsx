import {
  $applyNodeReplacement,
  NodeKey,
  SerializedTextNode,
  Spread,
  TextNode,
  type EditorConfig,
} from "lexical";
import { useTagStore } from "../../../../store/tagStore";

export type SerializedTagNode = Spread<
  {
    tagName: string;
  },
  SerializedTextNode
>;

export class TagNode extends TextNode {
  __tagName: string;

  static getType(): string {
    return "tag";
  }

  static clone(node: TagNode): TagNode {
    return new TagNode(node.__tagName, node.__key);
  }

  constructor(tagName: string, key?: NodeKey) {
    super(tagName, key);
    this.__tagName = tagName;
    console.log(
      "TagNode: Constructor called with tagName:",
      tagName,
      "key:",
      key
    );
  }

  createDOM(config: EditorConfig): HTMLElement {
    console.log("TagNode: Creating DOM for tag:", this.__tagName);
    const dom = super.createDOM(config);
    dom.className = "tag-node";
    dom.setAttribute("data-tag-name", this.__tagName);
    dom.setAttribute("data-lexical-tag", "true");
    dom.setAttribute("data-lexical-node-type", "tag");
    dom.setAttribute("contenteditable", "false"); // Make it non-editable
    console.log("TagNode: Created DOM element with class:", dom.className);
    console.log("TagNode: DOM attributes:", {
      className: dom.className,
      tagName: dom.getAttribute("data-tag-name"),
      lexicalTag: dom.getAttribute("data-lexical-tag"),
      nodeType: dom.getAttribute("data-lexical-node-type"),
      textContent: dom.textContent,
    });

    // Get the tag color from the tag store
    try {
      const { getTagColor } = useTagStore.getState();
      console.log("TagNode: Getting color for tag:", this.__tagName);
      const color = getTagColor(this.__tagName);
      console.log(
        "TagNode: Using tag store color for",
        this.__tagName,
        ":",
        color
      );
      dom.style.setProperty("background-color", color, "important");
      dom.style.setProperty("color", "#ffffff", "important");
      console.log("TagNode: Applied styles to DOM:", {
        backgroundColor: dom.style.backgroundColor,
        color: dom.style.color,
      });
    } catch (error) {
      console.log("TagNode: Error getting tag color:", error);
      // Fallback to generated color if tag store is not available
      const hash = this.__tagName.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
      const hue = Math.abs(hash) % 360;
      const color = `hsl(${hue}, 70%, 60%)`;
      console.log(
        "TagNode: Using generated color for",
        this.__tagName,
        ":",
        color
      );
      dom.style.setProperty("background-color", color, "important");
      dom.style.setProperty("color", "#ffffff", "important");
      console.log("TagNode: Applied fallback styles to DOM:", {
        backgroundColor: dom.style.backgroundColor,
        color: dom.style.color,
      });
    }

    console.log("TagNode: Final DOM element:", dom);
    console.log("TagNode: Final DOM element outerHTML:", dom.outerHTML);
    return dom;
  }

  updateDOM(prevNode: TagNode, dom: HTMLElement): boolean {
    if (prevNode.__tagName !== this.__tagName) {
      dom.setAttribute("data-tag-name", this.__tagName);
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedTagNode): TagNode {
    const node = $createTagNode(serializedNode.tagName);
    return node.updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedTagNode {
    return {
      ...super.exportJSON(),
      tagName: this.__tagName,
      type: "tag",
      version: 1,
    };
  }

  getTagName(): string {
    return this.__tagName;
  }

  getTextContent(): string {
    return this.__tagName;
  }

  getTextContentSize(): number {
    return this.__tagName.length;
  }

  isSimpleText(): boolean {
    return false;
  }

  isToken(): boolean {
    return true;
  }
}

export function $createTagNode(tagName: string): TagNode {
  const tagNode = new TagNode(tagName);
  return $applyNodeReplacement(tagNode);
}

export function $isTagNode(node: any): node is TagNode {
  return node instanceof TagNode;
}

// Helper function to check if a node is a tag node
export function $isTagNodeType(node: any): boolean {
  return node && node.getType && node.getType() === "tag";
}
