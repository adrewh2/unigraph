import { Graph } from "../../../core/model/Graph";
import { SceneGraph } from "../../../core/model/SceneGraph";

export type StarWithDecreasingLengthsOptions = {
  stringCount?: number;
  nodesPerString?: number;
  startingLength?: number;
  lengthDecayFactor?: number;
  arrangeInCircle?: boolean;
};

/**
 * Generate a star topology with edges of decreasing length radiating from a central node.
 * This demonstrates how edge lengths can create visual hierarchy in a simple star pattern.
 */
export function starWithDecreasingLengthsGraph(
  options?: StarWithDecreasingLengthsOptions
) {
  const {
    stringCount = 8,
    nodesPerString = 5,
    startingLength = 100,
    lengthDecayFactor = 0.7,
    arrangeInCircle = true,
  } = options ?? {};

  const graph = new Graph();

  // Create central node
  const centerNode = graph.createNode({
    id: "center",
    type: "star_center",
    label: "Center",
    userData: { depth: 0 },
  });

  // Calculate positions for string nodes if arranging in circle
  const calculateStringNodePosition = (
    stringIndex: number,
    nodeIndex: number,
    totalStrings: number
  ) => {
    if (!arrangeInCircle) return { x: 0, y: 0, z: 0 };

    const angle = (stringIndex / totalStrings) * 2 * Math.PI;
    const baseRadius = startingLength * 2; // Base radius for the first node in each string

    // Calculate cumulative distance along the string
    let cumulativeDistance = 0;
    for (let i = 0; i < nodeIndex; i++) {
      cumulativeDistance += startingLength * Math.pow(lengthDecayFactor, i);
    }

    const radius = baseRadius + cumulativeDistance;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: 0,
    };
  };

  // Create strings of nodes radiating from center
  for (let stringIndex = 0; stringIndex < stringCount; stringIndex++) {
    let previousNode = centerNode;

    for (let nodeIndex = 0; nodeIndex < nodesPerString; nodeIndex++) {
      const nodeId = `string_${stringIndex}_node_${nodeIndex}`;
      const node = graph.createNode({
        id: nodeId,
        type: "string_node",
        label: `S${stringIndex + 1}N${nodeIndex + 1}`,
        userData: { depth: nodeIndex + 1, stringIndex, nodeIndex },
      });

      // Calculate edge length based on depth (decreasing from starting length)
      const edgeLength =
        startingLength * Math.pow(lengthDecayFactor, nodeIndex);

      // Create edge from previous node to current node
      graph.createEdge(previousNode.getId(), node.getId(), {
        type: "string_edge",
        length: edgeLength,
      });

      // Set fixed position for node if arranging in circle
      if (arrangeInCircle) {
        const position = calculateStringNodePosition(
          stringIndex,
          nodeIndex,
          stringCount
        );
        node.setPosition(position);
      }

      previousNode = node;
    }
  }

  // Set fixed position for center node
  centerNode.setPosition({ x: 0, y: 0, z: 0 });

  const sceneGraph = new SceneGraph({
    graph,
    metadata: {
      name: "Star with Decreasing Lengths",
      description: `Star topology with ${stringCount} strings of ${nodesPerString} nodes each. Edge lengths decrease exponentially with depth from ${startingLength} with decay factor ${lengthDecayFactor}.`,
    },
  });

  // Apply fixed positions to the scene graph
  const positions: { [key: string]: { x: number; y: number; z: number } } = {
    center: { x: 0, y: 0, z: 0 },
  };

  for (let stringIndex = 0; stringIndex < stringCount; stringIndex++) {
    for (let nodeIndex = 0; nodeIndex < nodesPerString; nodeIndex++) {
      if (arrangeInCircle) {
        positions[`string_${stringIndex}_node_${nodeIndex}`] =
          calculateStringNodePosition(stringIndex, nodeIndex, stringCount);
      }
    }
  }

  sceneGraph.setNodePositions(positions);

  return sceneGraph;
}
