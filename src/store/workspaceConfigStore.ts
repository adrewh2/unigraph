import { create } from "zustand";

export interface ISidebarConfig {
  isVisible: boolean;
  mode: "collapsed" | "full";
  minimal: boolean;
  activeSectionId: string | null;
  panelWidth: number;
}

export const DEFAULT_SIDEBAR_CONFIG = (): ISidebarConfig => {
  return {
    isVisible: true,
    mode: "collapsed",
    minimal: false,
    activeSectionId: null,
    panelWidth: 350,
  };
};

type WorkspaceConfigState = {
  showToolbar: boolean;
  leftSidebarConfig: ISidebarConfig;
  rightSidebarConfig: ISidebarConfig;

  setShowToolbar: (show: boolean) => void;
  setLeftSidebarConfig: (config: Partial<ISidebarConfig>) => void;
  setRightSidebarConfig: (config: Partial<ISidebarConfig>) => void;
  setLeftActiveSection: (sectionId: string | null) => void;
  setRightActiveSection: (sectionId: string | null) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
};

const useWorkspaceConfigStore = create<WorkspaceConfigState>((set) => ({
  showToolbar: true,
  leftSidebarConfig: DEFAULT_SIDEBAR_CONFIG(),
  rightSidebarConfig: DEFAULT_SIDEBAR_CONFIG(),

  setShowToolbar: (show) => set({ showToolbar: show }),
  setLeftSidebarConfig: (config) =>
    set((state) => ({
      leftSidebarConfig: { ...state.leftSidebarConfig, ...config },
    })),
  setRightSidebarConfig: (config) =>
    set((state) => ({
      rightSidebarConfig: { ...state.rightSidebarConfig, ...config },
    })),
  setLeftActiveSection: (sectionId) =>
    set((state) => ({
      leftSidebarConfig: {
        ...state.leftSidebarConfig,
        activeSectionId: sectionId,
      },
    })),
  setRightActiveSection: (sectionId) =>
    set((state) => ({
      rightSidebarConfig: {
        ...state.rightSidebarConfig,
        activeSectionId: sectionId,
      },
    })),
  setLeftPanelWidth: (width) =>
    set((state) => ({
      leftSidebarConfig: { ...state.leftSidebarConfig, panelWidth: width },
    })),
  setRightPanelWidth: (width) =>
    set((state) => ({
      rightSidebarConfig: { ...state.rightSidebarConfig, panelWidth: width },
    })),
}));

export const setShowToolbar = (show: boolean) => {
  useWorkspaceConfigStore.getState().setShowToolbar(show);
};

export const setLeftSidebarConfig = (config: Partial<ISidebarConfig>) => {
  useWorkspaceConfigStore.getState().setLeftSidebarConfig(config);
};

export const getLeftSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().leftSidebarConfig;
};

export const setRightSidebarConfig = (config: Partial<ISidebarConfig>) => {
  useWorkspaceConfigStore.getState().setRightSidebarConfig(config);
};

export const getRightSidebarConfig = () => {
  return useWorkspaceConfigStore.getState().rightSidebarConfig;
};

export const setLeftActiveSection = (sectionId: string | null) => {
  useWorkspaceConfigStore.getState().setLeftActiveSection(sectionId);
};

export const setRightActiveSection = (sectionId: string | null) => {
  useWorkspaceConfigStore.getState().setRightActiveSection(sectionId);
};

export const setLeftPanelWidth = (width: number) => {
  useWorkspaceConfigStore.getState().setLeftPanelWidth(width);
};

export const setRightPanelWidth = (width: number) => {
  useWorkspaceConfigStore.getState().setRightPanelWidth(width);
};

export default useWorkspaceConfigStore;
