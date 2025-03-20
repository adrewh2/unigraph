import { create } from "zustand";
import { EdgeId } from "../core/model/Edge";
import { NodeId } from "../core/model/Node";

type GraphInteractionState = {
  hoveredNodeId: NodeId | null;
  hoveredEdgeId: EdgeId | null;
  selectedNodeIds: Set<NodeId>;
  selectedEdgeIds: Set<EdgeId>;

  setHoveredNodeId: (nodeId: NodeId | null) => void;
  setHoveredEdgeId: (edgeId: EdgeId | null) => void;
  getSelectedNodeId: () => NodeId | null;
  getSelectedEdgeId: () => EdgeId | null;
  setSelectedNodeId: (nodeId: NodeId | null) => void;
  setSelectedEdgeId: (edgeId: EdgeId | null) => void;
  setSelectedNodeIds: (nodeIds: NodeId[]) => void;
  setSelectedEdgeIds: (edgeIds: EdgeId[]) => void;
  clearSelections: () => void;
};

const useGraphInteractionStore = create<GraphInteractionState>((set, get) => ({
  hoveredNodeId: null,
  hoveredEdgeId: null,
  selectedNodeIds: new Set(),
  selectedEdgeIds: new Set(),

  setHoveredNodeId: (nodeId: NodeId | null) => set({ hoveredNodeId: nodeId }),
  setHoveredEdgeId: (edgeId: EdgeId | null) => set({ hoveredEdgeId: edgeId }),

  setSelectedNodeId: (nodeId: NodeId | null) => {
    set({ selectedNodeIds: nodeId ? new Set([nodeId]) : new Set() });
    set({ selectedEdgeIds: new Set() });
  },
  setSelectedEdgeId: (edgeId: EdgeId | null) => {
    set({ selectedEdgeIds: edgeId ? new Set([edgeId]) : new Set() });
    set({ selectedNodeIds: new Set() });
  },

  getSelectedNodeId: () => {
    const selectedNodes = Array.from(get().selectedNodeIds);
    return selectedNodes.length === 1 ? selectedNodes[0] : null;
  },
  getSelectedEdgeId: () => {
    const selectedEdges = Array.from(get().selectedEdgeIds);
    return selectedEdges.length === 1 ? selectedEdges[0] : null;
  },
  setSelectedNodeIds: (nodeIds) => set({ selectedNodeIds: new Set(nodeIds) }),
  setSelectedEdgeIds: (edgeIds) => set({ selectedEdgeIds: new Set(edgeIds) }),
  clearSelections: () =>
    set({ selectedNodeIds: new Set(), selectedEdgeIds: new Set() }),
}));

export const setHoveredNodeId = (nodeId: NodeId | null) =>
  useGraphInteractionStore.getState().setHoveredNodeId(nodeId);
export const setHoveredEdgeId = (edgeId: EdgeId | null) =>
  useGraphInteractionStore.getState().setHoveredEdgeId(edgeId);
export const getSelectedNodeId = () =>
  useGraphInteractionStore.getState().getSelectedNodeId();
export const getSelectedEdgeId = () =>
  useGraphInteractionStore.getState().getSelectedEdgeId();
export const setSelectedNodeId = (nodeId: NodeId | null) =>
  useGraphInteractionStore.getState().setSelectedNodeId(nodeId);
export const setSelectedEdgeId = (edgeId: EdgeId | null) =>
  useGraphInteractionStore.getState().setSelectedEdgeId(edgeId);
export const setSelectedNodeIds = (nodeIds: NodeId[]) =>
  useGraphInteractionStore.getState().setSelectedNodeIds(nodeIds);
export const setSelectedEdgeIds = (edgeIds: EdgeId[]) =>
  useGraphInteractionStore.getState().setSelectedEdgeIds(edgeIds);
export const clearSelections = () =>
  useGraphInteractionStore.getState().clearSelections();

export default useGraphInteractionStore;
