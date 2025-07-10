import { create } from "zustand";

interface ILayoutManagerState {
  mode: "save" | "load";
  show: boolean;
}

interface ISceneGraphDetailViewState {
  show: boolean;
  readOnly: boolean;
}

type DialogState = {
  showLoadSceneGraphWindow: boolean;
  showSaveSceneGraphDialog: boolean;
  showSaveAsNewProjectDialog: boolean;
  showPathAnalysis: boolean;
  showEntityTables: boolean;
  showLayoutManager: { mode: "save" | "load"; show: boolean };
  showSceneGraphDetailView: ISceneGraphDetailViewState;
  showFilterManager: ILayoutManagerState;
  showFilterWindow: boolean;
  isCommandPaletteOpen: boolean;

  setShowLoadSceneGraphWindow: (show: boolean) => void;
  setShowSaveSceneGraphDialog: (show: boolean) => void;
  setShowSaveAsNewProjectDialog: (show: boolean) => void;
  setShowPathAnalysis: (show: boolean) => void;
  setShowEntityTables: (show: boolean) => void;
  setShowLayoutManager: (args: ILayoutManagerState) => void;
  setShowSceneGraphDetailView: (args: ISceneGraphDetailViewState) => void;
  setShowFilterManager: (mode: "save" | "load", show: boolean) => void;
  setShowFilterWindow: (show: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

const useDialogStore = create<DialogState>((set) => ({
  showLoadSceneGraphWindow: false,
  showSaveSceneGraphDialog: false,
  showSaveAsNewProjectDialog: false,
  showPathAnalysis: false,
  showEntityTables: false,
  showLayoutManager: { mode: "load", show: false },
  showSceneGraphDetailView: { show: false, readOnly: true },
  showFilterManager: { mode: "load", show: false },
  showFilterWindow: false,
  isCommandPaletteOpen: false,

  setShowLoadSceneGraphWindow: (show) =>
    set({ showLoadSceneGraphWindow: show }),
  setShowSaveSceneGraphDialog: (show) =>
    set({ showSaveSceneGraphDialog: show }),
  setShowSaveAsNewProjectDialog: (show) =>
    set({ showSaveAsNewProjectDialog: show }),
  setShowPathAnalysis: (show) => set({ showPathAnalysis: show }),
  setShowEntityTables: (show) => set({ showEntityTables: show }),
  setShowLayoutManager: (args: ILayoutManagerState) =>
    set({ showLayoutManager: { mode: args.mode, show: args.show } }),
  setShowSceneGraphDetailView: (args: ISceneGraphDetailViewState) =>
    set({
      showSceneGraphDetailView: { show: args.show, readOnly: args.readOnly },
    }),
  setShowFilterManager: (mode, show) =>
    set({ showFilterManager: { mode, show } }),
  setShowFilterWindow: (show) => set({ showFilterWindow: show }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}));

export const setShowSceneGraphDetailView = () => {
  useDialogStore.setState(() => ({
    showSceneGraphDetailView: { show: true, readOnly: false },
  }));
};

export default useDialogStore;

// Public methods for controlling the command palette
export function openCommandPalette() {
  useDialogStore.getState().setCommandPaletteOpen(true);
}

export function closeCommandPalette() {
  useDialogStore.getState().setCommandPaletteOpen(false);
}
