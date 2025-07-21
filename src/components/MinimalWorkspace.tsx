import { getCurrentSceneGraph } from "@/store/appConfigStore";
import {
  Workspace as AppShellWorkspace,
  ThemeProvider,
  WorkspaceProvider,
} from "@aesgraph/app-shell";
import React from "react";
import Workspace from "./appWorkspace/Workspace";
import styles from "./MinimalWorkspace.module.css";

const MinimalWorkspace: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Unigraph Workspace</h1>
        <nav className={styles.topBarNav}>
          <button className={styles.topBarButton}>File</button>
          <button className={styles.topBarButton}>View</button>
          <button className={styles.topBarButton}>Tools</button>
        </nav>
      </div>

      {/* Main Content Area with Workspace */}
      <div className={styles.mainContent}>
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
      <div className={styles.statusBar}>
        Ready • Unigraph • Scene Graph Loaded •{" "}
        {getCurrentSceneGraph() ? "Graph Active" : "No Graph"}
      </div>
    </div>
  );
};

export default MinimalWorkspace;
