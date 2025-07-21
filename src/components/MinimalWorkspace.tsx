import React from "react";
import {
  Workspace as AppShellWorkspace,
  WorkspaceProvider,
  ThemeProvider,
} from "@aesgraph/app-shell";
import Workspace from "./appWorkspace/Workspace";
import { getCurrentSceneGraph } from "@/store/appConfigStore";

const MinimalWorkspace: React.FC = () => {
  return (
    // <div style={{ flex: 1, overflow: "hidden" }}>
    <ThemeProvider>
      <Workspace
        menuConfig={{}}
        currentSceneGraph={getCurrentSceneGraph()}
        isDarkMode={false}
        selectedSimulation={""}
        simulations={[]}
        onViewChange={() => {}}
        onSelectResult={() => {}}
        onSearchResult={() => {}}
        onHighlight={() => {}}
        onApplyForceGraphConfig={() => {}}
        renderLayoutModeRadio={() => <div>Layout Mode Radio</div>}
        showFilterWindow={() => {}}
        showFilterManager={() => {}}
        renderNodeLegend={<div>Node Legend</div>}
        renderEdgeLegend={<div>Edge Legend</div>}
        showPathAnalysis={() => {}}
        showLoadSceneGraphWindow={() => {}}
        showSaveSceneGraphDialog={() => {}}
        showLayoutManager={() => {}}
        handleFitToView={() => {}}
        handleShowEntityTables={() => {}}
        handleLoadSceneGraph={() => {}}
      >
        <WorkspaceProvider>
          <AppShellWorkspace fullViewport={true} />
        </WorkspaceProvider>
      </Workspace>
    </ThemeProvider>
    // </div>
  );
};

export default MinimalWorkspace;
