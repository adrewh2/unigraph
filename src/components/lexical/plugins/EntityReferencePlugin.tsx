import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  EditorConfig,
  TextNode,
} from "lexical";
import { useEffect } from "react";
import { EdgeId } from "../../../core/model/Edge";
import { EntityId } from "../../../core/model/entity/abstractEntity";
import { NodeId } from "../../../core/model/Node";
import { getCurrentSceneGraph } from "../../../store/appConfigStore";

// Match [entity id] with support for spaces in the entity id
const ENTITY_REFERENCE_REGEX = /\[([\w\s-]+)\]/g;

class EntityReferenceNode extends TextNode {
  static getType(): string {
    return "entity-reference";
  }

  static clone(node: EntityReferenceNode): EntityReferenceNode {
    return new EntityReferenceNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    // Extract the entity ID from the text (remove brackets)
    const entityId = this.__text.substring(1, this.__text.length - 1);

    // Check if this is a valid entity in the current scene graph
    const sceneGraph = getCurrentSceneGraph();
    const node = sceneGraph.getGraph().maybeGetNode(entityId as NodeId);
    const edge = node
      ? null
      : sceneGraph.getGraph().maybeGetEdge(entityId as EdgeId);
    const entity = sceneGraph
      .getEntityCache()
      .maybeGetEntityById(entityId as EntityId);

    // Style based on entity type
    if (node) {
      dom.style.color = "#7c3aed"; // Purple for nodes
      dom.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
      dom.title = `Node: ${node.getLabel() || entityId}`;
    } else if (edge) {
      dom.style.color = "#2563eb"; // Blue for edges
      dom.style.backgroundColor = "rgba(37, 99, 235, 0.1)";
      dom.title = `Edge: ${edge.getType() || entityId}`;
    } else if (entity) {
      dom.style.color = "#059669"; // Green for entities
      dom.style.backgroundColor = "rgba(5, 150, 105, 0.1)";
      dom.title = `Entity: ${entityId}`;
    } else {
      // Unknown entity
      dom.style.color = "#6b7280"; // Gray for unknown
      dom.style.backgroundColor = "rgba(107, 114, 128, 0.1)";
      dom.title = `Unknown: ${entityId}`;
    }

    dom.style.padding = "2px 4px";
    dom.style.borderRadius = "4px";
    dom.style.fontWeight = "500";
    dom.style.cursor = "pointer";
    dom.dataset.entityId = entityId;
    dom.classList.add("entity-reference");

    return dom;
  }

  updateDOM(): boolean {
    return false;
  }
}

export function EntityReferencePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([EntityReferenceNode])) {
      throw new Error(
        "EntityReferencePlugin: EntityReferenceNode not registered on editor"
      );
    }

    return editor.registerTextContentListener((_textContent) => {
      editor.update(() => {
        // Find entity references in the editor
        const regex = ENTITY_REFERENCE_REGEX;
        const nodesNeedingTransform: Array<{
          node: TextNode;
          match: RegExpMatchArray;
        }> = [];

        // Find text nodes that contain potential entity references
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          // Check all text nodes
          $getSelection()
            ?.getNodes()
            .forEach((node) => {
              if (
                node instanceof TextNode &&
                !(node instanceof EntityReferenceNode)
              ) {
                const nodeText = node.getTextContent();
                const matches = Array.from(nodeText.matchAll(regex));

                if (matches.length > 0) {
                  matches.forEach((match) => {
                    nodesNeedingTransform.push({ node, match });
                  });
                }
              }
            });
        });

        // Transform any found references
        if (nodesNeedingTransform.length > 0) {
          // Sort in reverse order to avoid index shifting issues
          nodesNeedingTransform.sort((a, b) => {
            const indexA = a.match.index || 0;
            const indexB = b.match.index || 0;
            return indexB - indexA;
          });

          // Process each entity reference
          nodesNeedingTransform.forEach(({ node, match }) => {
            const startOffset = match.index || 0;
            const matchLength = match[0].length;
            const endOffset = startOffset + matchLength;
            const entityId = match[1]; // The matched text between brackets

            // Split the text node at the match boundaries
            const textNode = node;
            const textContent = textNode.getTextContent();

            try {
              // Create three segments: before, reference, after
              const beforeText = textContent.substring(0, startOffset);
              const referenceText = `[${entityId}]`; // Include the brackets
              const afterText = textContent.substring(endOffset);

              // Replace the original node with these segments
              const entityReferenceNode = new EntityReferenceNode(
                referenceText
              );

              if (beforeText) {
                const beforeNode = $createTextNode(beforeText);
                textNode.insertBefore(beforeNode);
              }

              textNode.insertBefore(entityReferenceNode);

              if (afterText) {
                const afterNode = $createTextNode(afterText);
                textNode.insertBefore(afterNode);
              }

              textNode.remove();
            } catch (error) {
              console.error("Error transforming entity reference:", error);
            }
          });
        }
      });
    });
  }, [editor]);

  return null;
}

export { EntityReferenceNode };
