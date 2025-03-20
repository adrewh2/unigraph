import { create } from "zustand";

type DialogState = {
  showLoadSceneGraphWindow: boolean;
  showSaveSceneGraphDialog: boolean;
  showPathAnalysis: boolean;
  showEntityTables: boolean;
  showLayoutManager: { mode: "save" | "load"; show: boolean };
  showSceneGraphDetailView: { show: boolean; readOnly: boolean };
  showFilterManager: { mode: "save" | "load"; show: boolean };
  showFilterWindow: boolean;

  setShowLoadSceneGraphWindow: (show: boolean) => void;
  setShowSaveSceneGraphDialog: (show: boolean) => void;
  setShowPathAnalysis: (show: boolean) => void;
  setShowEntityTables: (show: boolean) => void;
  setShowLayoutManager: (mode: "save" | "load", show: boolean) => void;
  setShowSceneGraphDetailView: (show: boolean, readOnly: boolean) => void;
  setShowFilterManager: (mode: "save" | "load", show: boolean) => void;
  setShowFilterWindow: (show: boolean) => void;
};

const useDialogStore = create<DialogState>((set) => ({
  showLoadSceneGraphWindow: false,
  showSaveSceneGraphDialog: false,
  showPathAnalysis: false,
  showEntityTables: false,
  showLayoutManager: { mode: "load", show: false },
  showSceneGraphDetailView: { show: false, readOnly: true },
  showFilterManager: { mode: "load", show: false },
  showFilterWindow: false,

  setShowLoadSceneGraphWindow: (show) =>
    set({ showLoadSceneGraphWindow: show }),
  setShowSaveSceneGraphDialog: (show) =>
    set({ showSaveSceneGraphDialog: show }),
  setShowPathAnalysis: (show) => set({ showPathAnalysis: show }),
  setShowEntityTables: (show) => set({ showEntityTables: show }),
  setShowLayoutManager: (mode, show) =>
    set({ showLayoutManager: { mode, show } }),
  setShowSceneGraphDetailView: (show, readOnly) =>
    set({ showSceneGraphDetailView: { show, readOnly } }),
  setShowFilterManager: (mode, show) =>
    set({ showFilterManager: { mode, show } }),
  setShowFilterWindow: (show) => set({ showFilterWindow: show }),
}));

export default useDialogStore;
