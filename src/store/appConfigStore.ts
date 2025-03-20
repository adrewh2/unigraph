import { create } from "zustand";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { LayoutEngineOption } from "../core/layouts/LayoutEngine";
import { ActiveView, AppConfig } from "./../AppConfig";

const useAppConfigStore = create<AppConfig>((set) => ({
  activeView: "ForceGraph3d",
  activeSceneGraph: "AcademicsKG",
  windows: {
    showEntityDataCard: false,
  },
  forceGraph3dOptions: {
    layout: "Physics",
  },
  activeLayout: CustomLayoutType.Random,

  setActiveView: (activeView: ActiveView) => set({ activeView }),
  setActiveSceneGraph: (activeSceneGraph: string) => set({ activeSceneGraph }),
  setWindows: (windows: { showEntityDataCard: boolean }) => set({ windows }),
  setForceGraph3dOptions: (forceGraph3dOptions: {
    layout: "Physics" | "Layout";
  }) => set({ forceGraph3dOptions }),
  setForceGraph3dLayoutMode: (layout: "Physics" | "Layout") =>
    set({ forceGraph3dOptions: { layout } }),
  setActiveLayout: (activeLayout: LayoutEngineOption) => set({ activeLayout }),
  setAppConfig: (appConfig: AppConfig) => set(appConfig),
}));

export const setActiveView = (activeView: ActiveView) => {
  useAppConfigStore.setState(() => ({
    activeView,
  }));
};

export const getActiveView = () => {
  return useAppConfigStore.getState().activeView;
};

export const setActiveSceneGraph = (activeSceneGraph: string) => {
  useAppConfigStore.setState(() => ({
    activeSceneGraph,
  }));
};

export const getActiveSceneGraph = () => {
  return useAppConfigStore.getState().activeSceneGraph;
};

export const setWindows = (windows: { showEntityDataCard: boolean }) => {
  useAppConfigStore.setState(() => ({
    windows,
  }));
};

export const getWindows = () => {
  return useAppConfigStore.getState().windows;
};

export const setForceGraph3dOptions = (forceGraph3dOptions: {
  layout: "Physics" | "Layout";
}) => {
  useAppConfigStore.setState(() => ({
    forceGraph3dOptions,
  }));
};

export const setForceGraph3dLayoutMode = (layout: "Physics" | "Layout") => {
  useAppConfigStore.setState(() => ({
    forceGraph3dOptions: { layout },
  }));
};

export const getForceGraph3dLayoutMode = () => {
  return useAppConfigStore.getState().forceGraph3dOptions.layout;
};

export const getForceGraph3dOptions = () => {
  return useAppConfigStore.getState().forceGraph3dOptions;
};

export const setActiveLayout = (activeLayout: LayoutEngineOption) => {
  useAppConfigStore.setState(() => ({
    activeLayout,
  }));
};

export const getActiveLayout = () => {
  return useAppConfigStore.getState().activeLayout;
};

export const setAppConfig = (appConfig: AppConfig) => {
  useAppConfigStore.setState(() => appConfig);
};

export const getAppConfig = () => {
  return useAppConfigStore.getState();
};

export default useAppConfigStore;
