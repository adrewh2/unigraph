import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
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

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  const urlParams = new URLSearchParams(window.location.search);
  const graphName = urlParams.get("graph") ?? undefined;
  const svgUrl = urlParams.get("svgUrl") ?? undefined;
  const activeView = urlParams.get("view") ?? undefined;
  const activeLayout = urlParams.get("layout") ?? undefined;

  const showToolbar = getToggleOptionValue(urlParams, "showToolbar");
  setShowToolbar(showToolbar);

  const showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  setLeftSidebarConfig({ isVisible: showLeftSidebar, mode: "full" });

  const showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");
  setRightSidebarConfig({ isVisible: showRightSidebar, mode: "full" });

  const hideWorkspace = getToggleOptionValue(urlParams, "hideWorkspace", false);
  if (hideWorkspace) {
    setShowToolbar(false);
    setLeftSidebarConfig({ isVisible: false, mode: "minimal" });
    setRightSidebarConfig({ isVisible: false, mode: "minimal" });
  }

  root.render(
    <App
      defaultGraph={graphName}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
    />
  );
}
