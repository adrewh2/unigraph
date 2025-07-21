import { getCurrentSceneGraph } from "@/store/appConfigStore";
import {
  WorkspaceGrid as AppShellWorkspace,
  ThemeProvider,
  WorkspaceProvider,
} from "@aesgraph/app-shell";
import "@aesgraph/app-shell/dist/app-shell.css";
import React from "react";
import Workspace from "./appWorkspace/Workspace";
import styles from "./MinimalWorkspace.module.css";

const MinimalWorkspace: React.FC = () => {
  return (
    <div className={styles.unigraphAppContainer}>
      {/* Main Content Area with Workspace */}
      <div className={styles.unigraphMainContent}>
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
              <AppShellWorkspace fullViewport={false} />
            </WorkspaceProvider>
          </Workspace>
        </ThemeProvider>
      </div>

      {/* Status Bar */}
      <div className={styles.unigraphStatusBar}>
        Ready • Unigraph • Scene Graph Loaded •{" "}
        {getCurrentSceneGraph() ? "Graph Active" : "No Graph"}
      </div>
    </div>
  );
};

export default MinimalWorkspace;
