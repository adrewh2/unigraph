import { LayoutEngineOptionLabels } from "../../core/layouts/LayoutEngine";
import { EntityIds } from "../../core/model/entity/entityIds";
import { NodeId } from "../../core/model/Node";
import { SceneGraph } from "../../core/model/SceneGraph";
import { Filter } from "../../store/activeFilterStore";
import { addNotification } from "../../store/notificationStore";
import { computeLayoutAndTriggerUpdateForCurrentSceneGraph } from "../../store/sceneGraphHooks";
import { ContextMenuItem } from "./ContextMenu";

/**
 * Generate context menu items for multiple selected nodes
 */
export const getMultiNodeContextMenuItems = (
  nodeIds: NodeId[],
  currentSceneGraph: SceneGraph,
  applyFilter: (filter: Filter) => void,
  onMenuClose?: () => void
): ContextMenuItem[] => [
  {
    label: `Selected ${nodeIds.length} Nodes`,
    action: () => {}, // This is just a label
  },
  {
    label: "Hide Selected Nodes",
    action: () => {
      // Create and apply a filter that excludes the selected nodes
      applyFilter({
        name: "hide selected nodes",
        filterRules: [
          {
            id: "hide selected nodes",
            operator: "exclude",
            ruleMode: "entities",
            conditions: {
              nodes: nodeIds,
            },
          },
        ],
      });
      onMenuClose?.();
    },
  },
  {
    label: "Show Only Selected Nodes",
    action: () => {
      // Create and apply a filter that only includes the selected nodes
      applyFilter({
        name: "show only selected nodes",
        filterRules: [
          {
            id: "show only selected nodes",
            operator: "include",
            ruleMode: "entities",
            conditions: {
              nodes: nodeIds,
            },
          },
        ],
      });
      onMenuClose?.();
    },
  },
  {
    label: "Copy IDs to Clipboard",
    action: () => {
      navigator.clipboard.writeText(nodeIds.join(", "));
      addNotification({
        message: `Copied ${nodeIds.length} node IDs to clipboard`,
        type: "success",
        duration: 3000,
      });
      onMenuClose?.();
    },
  },
  {
    label: "Connect Selected Nodes",
    action: () => {
      // Create edges between all selected nodes
      if (nodeIds.length >= 2) {
        const graph = currentSceneGraph.getGraph();

        // Connect nodes in sequence (1->2->3->...)
        for (let i = 0; i < nodeIds.length - 1; i++) {
          graph.createEdge(nodeIds[i], nodeIds[i + 1]);
        }

        currentSceneGraph.notifyGraphChanged();
        addNotification({
          message: `Connected ${nodeIds.length} nodes sequentially`,
          type: "success",
          duration: 3000,
        });
      }
      onMenuClose?.();
    },
  },
  {
    label: "Create Subgraph from Selection",
    action: () => {
      // Create a new graph containing only the selected nodes and their connections
      // This would typically open a dialog to name and save the subgraph
      addNotification({
        message: "Creating subgraph from selection - Feature coming soon",
        type: "info",
        duration: 3000,
      });
      onMenuClose?.();
    },
  },
  {
    label: "Apply Color to Selection",
    submenu: [
      {
        label: "Red",
        action: () => {
          // Apply red color to all selected nodes
          // Color logic would go here
          onMenuClose?.();
        },
      },
      {
        label: "Green",
        action: () => {
          // Apply green color to all selected nodes
          onMenuClose?.();
        },
      },
      {
        label: "Blue",
        action: () => {
          // Apply blue color to all selected nodes
          onMenuClose?.();
        },
      },
    ],
  },
  {
    label: "Apply Layout",
    submenu: LayoutEngineOptionLabels.map((layout) => ({
      label: layout,
      action: () => {
        computeLayoutAndTriggerUpdateForCurrentSceneGraph(
          layout,
          new EntityIds(nodeIds)
        );
        onMenuClose?.();
      },
    })),
  },
];
