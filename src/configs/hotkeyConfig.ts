import { cmdOrCtrl, HotkeyAction } from "../hooks/useHotkeys";
import {
  setShowCommandPalette,
  setShowEntityTables,
  setShowFilterManager,
  setShowFilterWindow,
  setShowLoadSceneGraphWindow,
  setShowSaveAsNewProjectDialog,
  setShowSaveSceneGraphDialog,
  setShowSceneGraphDetailView,
} from "../store/dialogStore";

export const getHotkeyConfig = (): HotkeyAction[] => [
  // Command Palette
  cmdOrCtrl(() => setShowCommandPalette(true), "p", {
    shiftKey: true,
    description: "Open Command Palette",
  }),

  // Project actions
  cmdOrCtrl(() => setShowSaveSceneGraphDialog(true), "s", {
    description: "Save Project",
  }),

  cmdOrCtrl(() => setShowSaveAsNewProjectDialog(true), "s", {
    shiftKey: true,
    description: "Save Project As",
  }),

  cmdOrCtrl(() => setShowLoadSceneGraphWindow(true), "o", {
    shiftKey: true,
    description: "Open Project",
  }),

  // View actions
  cmdOrCtrl(() => setShowEntityTables(true), "e", {
    description: "Show Entity Tables",
  }),

  //   cmdOrCtrl(() => setShowPathAnalysis(true), "p", {
  //     description: "Show Path Analysis",
  //   }),

  cmdOrCtrl(() => setShowFilterWindow(true), "f", {
    description: "Show Filter Window",
  }),

  cmdOrCtrl(() => setShowFilterManager("load", true), "f", {
    shiftKey: true,
    description: "Show Filter Manager",
  }),

  cmdOrCtrl(() => setShowSceneGraphDetailView(true), "d", {
    description: "Show Scene Graph Details",
  }),

  // Additional hotkeys can be added here
  // Example:
  // cmdOrCtrl(
  //   () => someAction(),
  //   'g',
  //   { description: 'Some Action' }
  // ),
];
