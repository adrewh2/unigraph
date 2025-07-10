import { useCallback, useEffect, useState } from "react";
import {
  getAllDemoSceneGraphKeys,
  getSceneGraph,
} from "../data/DemoSceneGraphs";
import useAppConfigStore from "../store/appConfigStore";
import useDialogStore from "../store/dialogStore";

export interface Command {
  id: string;
  title: string;
  description?: string;
  execute: () => void;
}

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const { setActiveView, currentSceneGraph } = useAppConfigStore();
  const {
    setShowLoadSceneGraphWindow,
    setShowSaveSceneGraphDialog,
    setShowSaveAsNewProjectDialog,
    setShowEntityTables,
    setShowPathAnalysis,
    setShowFilterWindow,
    setShowFilterManager,
    setShowSceneGraphDetailView,
  } = useDialogStore();

  // Register default commands
  useEffect(() => {
    const defaultCommands: Command[] = [
      {
        id: "open-project",
        title: "Project: Open",
        description: "Open a saved project",
        execute: () => setShowLoadSceneGraphWindow(true),
      },
      {
        id: "save-project",
        title: "Project: Save",
        description: "Save current project",
        execute: () => {
          throw new Error("Save project command not implemented yet");
          // setShowSaveSceneGraphDialog(true);
        },
      },
      {
        id: "save-as-new-project",
        title: "Project: Save as new",
        description: "Save current project as a new project",
        execute: () => setShowSaveAsNewProjectDialog(true),
      },
      {
        id: "export-project",
        title: "Project: Export",
        description: "Export current project as JSON file",
        execute: () => {
          try {
            const sceneGraph = currentSceneGraph;
            const metadata = sceneGraph.getMetadata();
            const fileName = metadata?.name || "scene-graph";

            // Serialize the scene graph to JSON
            const jsonData = JSON.stringify(sceneGraph, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Create download link and trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Error exporting project:", error);
          }
        },
      },
      {
        id: "view-forcegraph3d",
        title: "View: ForceGraph3d",
        description: "Change view to Force Graph 3D",
        execute: () => setActiveView("ForceGraph3d"),
      },
      {
        id: "view-reactflow",
        title: "View: ReactFlow",
        description: "Change view to React Flow",
        execute: () => setActiveView("ReactFlow"),
      },
      {
        id: "view-graphviz",
        title: "View: Graphviz",
        description: "Change view to Graphviz",
        execute: () => setActiveView("Graphviz"),
      },
      {
        id: "view-gallery",
        title: "View: Gallery",
        description: "Change view to Image Gallery",
        execute: () => setActiveView("Gallery"),
      },
      {
        id: "show-node-table",
        title: "Show Node Table",
        description: "Display the table of all nodes",
        execute: () => setShowEntityTables(true),
      },
      {
        id: "path-analysis",
        title: "Show Path Analysis",
        description: "Open path analysis tool",
        execute: () => setShowPathAnalysis(true),
      },
      {
        id: "filter-window",
        title: "Show Filter Window",
        description: "Open node filtering window",
        execute: () => setShowFilterWindow(true),
      },
      {
        id: "filter-manager",
        title: "Show Filter Manager",
        description: "Open saved filters manager",
        execute: () => setShowFilterManager("load", true),
      },
      {
        id: "scene-graph-details",
        title: "Scene Graph Details",
        description: "Show details of the current scene graph",
        execute: () =>
          setShowSceneGraphDetailView({ show: true, readOnly: true }),
      },
    ];

    // Add demo graphs as commands
    const demoGraphs = getAllDemoSceneGraphKeys().map((key) => ({
      id: `demo-graph-${key}`,
      title: `Open Demo: ${key}`,
      description: `Load the ${key} demo graph`,
      execute: () => {
        try {
          const graph = getSceneGraph(key);
          if (typeof graph === "function") {
            // Handle async loading later in App.tsx
          }
          // The actual loading is handled in App.tsx's handleSetSceneGraph
          const url = new URL(window.location.href);
          url.searchParams.set("graph", key);
          window.history.pushState({}, "", url.toString());
          window.location.reload();
        } catch (err) {
          console.error(`Error loading demo graph ${key}:`, err);
        }
      },
    }));

    setCommands([...defaultCommands, ...demoGraphs]);
  }, [
    setActiveView,
    setShowLoadSceneGraphWindow,
    setShowSaveSceneGraphDialog,
    setShowSaveAsNewProjectDialog,
    setShowEntityTables,
    setShowPathAnalysis,
    setShowFilterWindow,
    setShowFilterManager,
    setShowSceneGraphDetailView,
    currentSceneGraph,
  ]);

  // Register keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if (
        (isMac && e.metaKey && e.shiftKey && e.key === "p") ||
        (!isMac && e.ctrlKey && e.shiftKey && e.key === "p")
      ) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const executeCommand = useCallback((command: Command) => {
    command.execute();
  }, []);

  return {
    isOpen,
    setIsOpen,
    commands,
    executeCommand,
  };
};
