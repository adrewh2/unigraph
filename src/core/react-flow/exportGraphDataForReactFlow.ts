import { Edge, Node } from "@xyflow/react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { getNodeLegendConfig } from "../../store/activeLegendConfigStore";
import { getLegendMode } from "../../store/appConfigStore";
import { NodePositionData } from "../layouts/layoutHelpers";
import { SceneGraph } from "../model/SceneGraph";
import { IEntity } from "../model/entity/abstractEntity";
import { EntityIds } from "../model/entity/entityIds";
import { getEdgeLegendConfig } from "./../../store/activeLegendConfigStore";

export const exportGraphDataForReactFlow = (
  sceneGraph: SceneGraph,
  positionsOverride: NodePositionData | undefined = undefined,
  filterNonvisibleNodes = true
): { nodes: Node[]; edges: Edge[] } => {
  const positions: NodePositionData | undefined =
    positionsOverride ?? sceneGraph.getDisplayConfig().nodePositions;

  const getNodeIsVisible = (node: IEntity): boolean =>
    RenderingManager.getVisibility(
      node,
      getNodeLegendConfig(),
      getLegendMode()
    );

  const getNodeColor = (node: IEntity): string =>
    RenderingManager.getColor(node, getNodeLegendConfig(), getLegendMode());

  const getEdgeIsVisible = (edge: IEntity): boolean =>
    RenderingManager.getVisibility(
      edge,
      getEdgeLegendConfig(),
      getLegendMode()
    );

  const getEdgeColor = (edge: IEntity): string =>
    RenderingManager.getColor(edge, getEdgeLegendConfig(), getLegendMode());

  const nodes = Array.from(sceneGraph.getGraph().getNodes())
    .filter((node) => {
      if (!filterNonvisibleNodes) {
        return true;
      }
      if (node.isVisible() && getNodeIsVisible(node)) {
        return true;
      }
      return false;
    })
    .map((node) => ({
      id: node.getId(),
      color: getNodeColor(node),
      position: positions
        ? node.getId() in positions
          ? positions[node.getId()]
          : { x: 0, y: 0 }
        : { x: 0, y: 0 },
      data: {
        label: node.getId(),
        color: getNodeColor(node),
        dimensions: node.getDimensions(),
      },
      style: { border: `2px solid ${getNodeColor(node)}` },
      label: node.getLabel(),
      type: "resizerNode",
    }));

  const initialVisibleEdges = sceneGraph
    .getGraph()
    .getEdgesConnectedToNodes(new EntityIds(nodes.map((node) => node.id)));

  const edges = Array.from(initialVisibleEdges)
    .filter((edge) => getEdgeIsVisible(edge))
    .map((edge) => ({
      id: edge.getId(),
      source: edge.getSource(),
      target: edge.getTarget(),
      color: getEdgeColor(edge),
    }));
  return {
    nodes,
    edges,
  };
};
