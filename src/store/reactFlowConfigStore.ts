import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  DEFAULT_REACTFLOW_CONFIG,
  ReactFlowRenderConfig,
} from "../components/react-flow/ReactFlowConfigEditor";

interface ReactFlowConfigState {
  config: ReactFlowRenderConfig;
  setConfig: (config: ReactFlowRenderConfig) => void;
}

const useReactFlowConfigStore = create(
  immer<ReactFlowConfigState>((set) => ({
    config: DEFAULT_REACTFLOW_CONFIG,
    setConfig: (config: ReactFlowRenderConfig) =>
      set((state) => {
        state.config = { ...state.config, ...config };
      }),
  }))
);

export const applyReactFlowConfig = (config: ReactFlowRenderConfig) => {
  useReactFlowConfigStore.getState().setConfig(config);

  // You could also apply the config directly to CSS variables for global styling
  document.documentElement.style.setProperty(
    "--reactflow-node-border-radius",
    `${config.nodeBorderRadius}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-node-stroke-width",
    `${config.nodeStrokeWidth}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-node-font-size",
    `${config.nodeFontSize}px`
  );
  document.documentElement.style.setProperty(
    "--reactflow-edge-stroke-width",
    `${config.edgeStrokeWidth}px`
  );
};

export const getReactFlowConfig = (): ReactFlowRenderConfig => {
  return useReactFlowConfigStore.getState().config;
};

export default useReactFlowConfigStore;
