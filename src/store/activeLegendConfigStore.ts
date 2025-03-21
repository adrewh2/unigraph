import { create } from "zustand";
import { DisplayConfig } from "../controllers/RenderingManager";
import { EdgeId } from "../core/model/Edge";
import { NodeId } from "../core/model/Node";
import { getRandomColor } from "../utils/colorUtils";

export type ActiveLegendConfigState = {
  nodeLegendConfig: DisplayConfig;
  edgeLegendConfig: DisplayConfig;

  setNodeLegendConfig: (config: DisplayConfig) => void;
  getNodeLegendConfig: () => DisplayConfig;
  setEdgeLegendConfig: (config: DisplayConfig) => void;
  getEdgeLegendConfig: () => DisplayConfig;
  setNodeVisibility: (key: NodeId, isVisible: boolean) => void;
  getNodeVisiblity: (key: NodeId) => boolean;
  setEdgeVisibility: (key: EdgeId, isVisible: boolean) => void;
  getEdgeVisiblity: (key: EdgeId) => boolean;
  setNodeColor: (key: NodeId, color: string) => void;
  getNodeColor: (key: NodeId) => string;
  setEdgeColor: (key: EdgeId, color: string) => void;
  getEdgeColor: (key: EdgeId) => string;
};

const useActiveLegendConfigStore = create<ActiveLegendConfigState>((set) => ({
  nodeLegendConfig: {},
  edgeLegendConfig: {},
  setNodeLegendConfig: (config: DisplayConfig) =>
    set({ nodeLegendConfig: config }),
  setEdgeLegendConfig: (config: DisplayConfig) =>
    set({ edgeLegendConfig: config }),
  setNodeVisibility: (key, isVisible) =>
    set((state) => {
      if (state.nodeLegendConfig[key]?.isVisible === isVisible) {
        return state; // No change needed
      }
      return {
        nodeLegendConfig: {
          ...state.nodeLegendConfig,
          [key]: {
            ...state.nodeLegendConfig[key],
            isVisible,
          },
        },
      };
    }),
  getNodeVisiblity: (key: NodeId): boolean => {
    return (
      useActiveLegendConfigStore.getState().nodeLegendConfig[key]?.isVisible ??
      true
    );
  },
  getEdgeVisiblity: (key: EdgeId): boolean => {
    return (
      useActiveLegendConfigStore.getState().edgeLegendConfig[key]?.isVisible ??
      true
    );
  },
  getEdgeLegendConfig: (): DisplayConfig => {
    return useActiveLegendConfigStore.getState().edgeLegendConfig;
  },
  getNodeLegendConfig: (): DisplayConfig => {
    return useActiveLegendConfigStore.getState().nodeLegendConfig;
  },
  setEdgeVisibility: (key, isVisible) =>
    set((state) => {
      if (state.edgeLegendConfig[key]?.isVisible === isVisible) {
        return state; // No change needed
      }
      return {
        edgeLegendConfig: {
          ...state.edgeLegendConfig,
          [key]: {
            ...state.edgeLegendConfig[key],
            isVisible,
          },
        },
      };
    }),
  setNodeColor: (key, color) =>
    set((state) => {
      if (state.nodeLegendConfig[key]?.color === color) {
        return state; // No change needed
      }
      return {
        nodeLegendConfig: {
          ...state.nodeLegendConfig,
          [key]: {
            ...state.nodeLegendConfig[key],
            color,
          },
        },
      };
    }),
  setEdgeColor: (key, color) =>
    set((state) => {
      if (state.edgeLegendConfig[key]?.color === color) {
        return state; // No change needed
      }
      return {
        edgeLegendConfig: {
          ...state.edgeLegendConfig,
          [key]: {
            ...state.edgeLegendConfig[key],
            color,
          },
        },
      };
    }),
  getNodeColor: (key: NodeId): string => {
    return (
      useActiveLegendConfigStore.getState().nodeLegendConfig[key]?.color ??
      getRandomColor()
    );
  },
  getEdgeColor: (key: EdgeId): string => {
    return (
      useActiveLegendConfigStore.getState().edgeLegendConfig[key]?.color ??
      getRandomColor()
    );
  },
}));

export const setNodeLegendConfig = (config: DisplayConfig) => {
  useActiveLegendConfigStore.getState().setNodeLegendConfig(config);
};

export const setEdgeLegendConfig = (config: DisplayConfig) => {
  useActiveLegendConfigStore.getState().setEdgeLegendConfig(config);
};

export const getNodeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().getNodeLegendConfig();
};

export const getEdgeLegendConfig = () => {
  return useActiveLegendConfigStore.getState().getEdgeLegendConfig();
};

export const setNodeVisibility = (key: NodeId, isVisible: boolean) => {
  useActiveLegendConfigStore.getState().setNodeVisibility(key, isVisible);
};

export const getNodeVisibility = (key: NodeId) => {
  return useActiveLegendConfigStore.getState().getNodeVisiblity(key);
};

export const getEdgeVisibility = (key: EdgeId) => {
  return useActiveLegendConfigStore.getState().getEdgeVisiblity(key);
};

export const setEdgeVisibility = (key: EdgeId, isVisible: boolean) => {
  useActiveLegendConfigStore.getState().setEdgeVisibility(key, isVisible);
};

export const setNodeColor = (key: NodeId, color: string) => {
  useActiveLegendConfigStore.getState().setNodeColor(key, color);
};

export const setEdgeColor = (key: EdgeId, color: string) => {
  useActiveLegendConfigStore.getState().setEdgeColor(key, color);
};

export const getNodeColor = (key: NodeId) => {
  return useActiveLegendConfigStore.getState().getNodeColor(key);
};

export const getEdgeColor = (key: EdgeId) => {
  return useActiveLegendConfigStore.getState().getEdgeColor(key);
};

export default useActiveLegendConfigStore;
