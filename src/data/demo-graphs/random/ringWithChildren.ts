import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

/**
 * Generate a scene graph consisting of:
 * - A backbone ring of `ringSize` nodes connected in a directed cycle
 * - For each ring node, `childrenPerNode` outgoing leaf children
 *
 * Defaults are ringSize=36 and childrenPerNode=5 as requested.
 */
export function ringWithChildrenGraph(
  ringSize: number = 36,
  childrenPerNode: number = 5
) {
  const graph = new Graph();

  // Create ring nodes
  const ringNodeIds: string[] = [];
  for (let i = 0; i < ringSize; i++) {
    const id = `r${i}`;
    graph.createNode({
      id,
      type: "ring_node",
      label: `R${i}`,
    });
    ringNodeIds.push(id);
  }

  // Connect ring in a directed cycle
  for (let i = 0; i < ringSize; i++) {
    const from = ringNodeIds[i];
    const to = ringNodeIds[(i + 1) % ringSize];
    graph.createEdge(from, to, { type: "ring_edge" });
  }

  // Add children for each ring node
  for (let i = 0; i < ringSize; i++) {
    const parentId = ringNodeIds[i];
    for (let j = 0; j < childrenPerNode; j++) {
      const childId = `${parentId}::c${j}`;
      graph.createNode({
        id: childId,
        type: "child_node",
        label: `C${i}-${j}`,
      });
      graph.createEdge(parentId, childId, { type: "child_edge" });
    }
  }

  return new SceneGraph({
    graph,
    metadata: {
      name: `Ring ${ringSize} with ${childrenPerNode} children each`,
      description:
        "A directed cycle (ring) where each backbone node spawns a fixed number of leaf children.",
    },
  });
}
