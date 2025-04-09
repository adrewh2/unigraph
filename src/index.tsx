import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ClinicalTrialDemo from "./components/ClinicalTrialDemo";
import { LayoutEngineOption } from "./core/layouts/LayoutEngine";
import { persistentStore } from "./core/storage/PersistentStoreManager";
import "./index.css";
import { setActiveLayout, setActiveView } from "./store/appConfigStore";
import {
  setLeftSidebarConfig,
  setRightSidebarConfig,
  setShowToolbar,
} from "./store/workspaceConfigStore";

const getToggleOptionValue = (
  params: URLSearchParams,
  key: string,
  defaultValue = true
): boolean => {
  if (params.get(key) != null) {
    return params.get(key) === "true";
  }
  return defaultValue; //default to true
};

// Add function to get most recent project
const getMostRecentProjectId = async (): Promise<string | undefined> => {
  try {
    const projects = await persistentStore.listSceneGraphs();
    if (projects.length > 0) {
      // Projects are already sorted by lastModified in descending order
      return projects[0].id;
    }
  } catch (err) {
    console.error("Failed to get recent projects:", err);
  }
  return undefined;
};

const initializeApp = async () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  const root = ReactDOM.createRoot(rootElement);
  const urlParams = new URLSearchParams(window.location.search);

  // Get graph from URL or most recent project
  const graphFromUrl = urlParams.get("graph") ?? undefined;
  const graphId = graphFromUrl || (await getMostRecentProjectId());

  const svgUrl = urlParams.get("svgUrl") ?? undefined;
  const activeView = urlParams.get("view") ?? undefined;
  const activeLayout = urlParams.get("layout") ?? undefined;

  // Special handling for type system view
  if (activeView === "TypeSystem") {
    // Here you could load the TypeSystemDemo component directly
    setActiveView("TypeSystem");
  }

  // Special handling for clinical trial demo
  if (activeView === "ClinicalTrialDemo") {
    root.render(<ClinicalTrialDemo />);
    return;
  }

  const showToolbar = getToggleOptionValue(urlParams, "showToolbar");
  setShowToolbar(showToolbar);

  const showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  setLeftSidebarConfig({
    isVisible: showLeftSidebar,
    mode: "collapsed",
    minimal: false,
  });

  const showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");
  setRightSidebarConfig({
    isVisible: showRightSidebar,
    mode: "collapsed",
    minimal: false,
  });

  const hideWorkspace = getToggleOptionValue(urlParams, "hideWorkspace", false);
  if (hideWorkspace) {
    setShowToolbar(false);
    setLeftSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
    setRightSidebarConfig({
      isVisible: false,
      mode: "collapsed",
      minimal: false,
    });
  }

  if (graphId) {
    setActiveLayout(activeLayout as LayoutEngineOption);
  }

  root.render(
    <App
      defaultGraph={graphId}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
    />
  );
};

// Initialize the app
initializeApp();
