import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";

const getToggleOptionValue = (
  params: URLSearchParams,
  key: string
): boolean => {
  if (params.get(key) != null) {
    return params.get(key) === "true";
  }
  return true; //default to true
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
  const showLeftSidebar = getToggleOptionValue(urlParams, "showLeftSidebar");
  const showRightSidebar = getToggleOptionValue(urlParams, "showRightSidebar");

  root.render(
    <App
      defaultGraph={graphName}
      svgUrl={svgUrl}
      defaultActiveView={activeView}
      defaultActiveLayout={activeLayout}
      showToolbar={showToolbar}
      showLeftSidebar={showLeftSidebar}
      showRightSidebar={showRightSidebar}
    />
  );
}
