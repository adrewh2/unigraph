import { ForceGraph3DInstance } from "3d-force-graph";
import { attachRepulsiveForce } from "../../core/force-graph/createForceGraph";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { flyToNode } from "../../core/webgl/webglHelpers";
import { bfsQuery, processYasguiResults } from "../../helpers/yasguiHelpers";
import { ContextMenuItem } from "./ContextMenu";

/**
 * Generate context menu items for a single selected node
 */
export const getNodeContextMenuItems = (
  nodeId: NodeId,
  sceneGraph: SceneGraph,
  forceGraphInstance: ForceGraph3DInstance | null,
  setEditingNodeId: (nodeId: NodeId | null) => void,
  setIsNodeEditorOpen: (isOpen: boolean) => void,
  setJsonEditEntity: (entity: any) => void,
  setSelectedNodeId: (nodeId: NodeId | null) => void,
  setPathAnalysisConfig: (config: {
    startNode?: NodeId;
    endNode?: NodeId;
  }) => void,
  setShowPathAnalysis: (show: boolean) => void
): ContextMenuItem[] => [
  {
    label: "Focus Node",
    action: () => {
      if (forceGraphInstance) {
        const node = forceGraphInstance
          .graphData()
          .nodes.find((n) => n.id === nodeId);
        if (node) {
          flyToNode(forceGraphInstance, node);
        }
      }
    },
  },
  {
    label: "Expand around Node",
    action: () => {
      if (forceGraphInstance) {
        attachRepulsiveForce(forceGraphInstance, nodeId);
      }
    },
  },
  {
    label: "Select Node",
    action: () => setSelectedNodeId(nodeId),
  },
  {
    label: "Hide Node",
    action: () => {
      // Implement hide node functionality
      console.log("Hide node:", nodeId);
    },
  },
  {
    label: "Find path",
    submenu: [
      {
        label: "to...",
        action: () => {
          setPathAnalysisConfig({
            startNode: nodeId,
            endNode: undefined,
          });
          setShowPathAnalysis(true);
        },
      },
      {
        label: "from...",
        action: () => {
          setPathAnalysisConfig({
            startNode: undefined,
            endNode: nodeId,
          });
          setShowPathAnalysis(true);
        },
      },
    ],
  },
  {
    label: "Edit",
    action: () => {
      setEditingNodeId(nodeId);
      setIsNodeEditorOpen(true);
    },
  },
  {
    label: "Edit JSON",
    action: () => {
      setJsonEditEntity(sceneGraph.getGraph().getNode(nodeId));
    },
  },
  {
    label: "Query dbpedia",
    action: () => {
      bfsQuery(nodeId.replace(" ", "_"), 200, 150, 500).then((results) =>
        processYasguiResults(results, sceneGraph)
      );
    },
  },
];
