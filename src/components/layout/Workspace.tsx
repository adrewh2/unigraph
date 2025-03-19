import React, { useMemo } from "react";
import {
  createDefaultLeftMenus,
  createDefaultRightMenus,
  footerContent,
} from "../../configs/sidebarMenuConfig";
import { LayoutEngineOption } from "../../core/layouts/LayoutEngine";
import Sidebar from "../../Sidebar";
import UniAppToolbar, { IMenuConfig } from "../UniAppToolbar";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  menuConfig: IMenuConfig;
  currentSceneGraph: any;
  appConfig: any;
  isDarkMode: boolean;
  selectedSimulation: string;
  simulations: any;
  children: React.ReactNode;
  onViewChange: (view: string) => void;
  onSelectResult: (nodeId: string) => void;
  onSearchResult: (nodeIds: string[]) => void;
  onHighlight: (nodeId: string) => void;
  onApplyForceGraphConfig: (config: any) => void;
  setSelectedForceGraph3dLayoutMode: (mode: any) => void;
  applyNewLayout: (layout: LayoutEngineOption) => void;
  renderLayoutModeRadio: () => React.ReactNode;
  showFilterWindow: () => void;
  showFilterManager: () => void;
  clearFilters: () => void;
  renderNodeLegend: React.ReactNode;
  renderEdgeLegend: React.ReactNode;
  showToolbar?: boolean;
  showPathAnalysis: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  menuConfig,
  currentSceneGraph,
  appConfig,
  isDarkMode,
  selectedSimulation,
  simulations,
  children,
  onViewChange,
  onSelectResult,
  onSearchResult,
  onHighlight,
  onApplyForceGraphConfig,
  setSelectedForceGraph3dLayoutMode,
  applyNewLayout,
  renderLayoutModeRadio,
  showFilterWindow,
  showFilterManager,
  clearFilters,
  renderNodeLegend,
  renderEdgeLegend,
  showToolbar = true,
  showPathAnalysis,
}) => {
  const renderUniappToolbar = useMemo(() => {
    if (!showToolbar) {
      return null;
    }
    return (
      <div className={styles.toolbar}>
        <UniAppToolbar
          config={menuConfig}
          sceneGraph={currentSceneGraph}
          activeView={appConfig.activeView}
          onViewChange={onViewChange}
          simulationList={Object.keys(simulations)}
          selectedSimulation={selectedSimulation}
          isDarkMode={isDarkMode}
          onSelectResult={onSelectResult}
          onSearchResult={onSearchResult}
          onHighlight={onHighlight}
        />
      </div>
    );
  }, [
    appConfig.activeView,
    currentSceneGraph,
    isDarkMode,
    menuConfig,
    onHighlight,
    onSearchResult,
    onSelectResult,
    onViewChange,
    selectedSimulation,
    showToolbar,
    simulations,
  ]);

  return (
    <div className={styles.workspace}>
      {renderUniappToolbar}
      <div className={styles.content}>
        <Sidebar
          position="left"
          style={{
            height: "100%",
            top: 0,
          }}
          menuItems={createDefaultLeftMenus({
            onLayoutChange: (layout: LayoutEngineOption) =>
              applyNewLayout(layout),
            activeLayout: appConfig.activeLayout,
            physicsMode:
              appConfig.forceGraph3dOptions.layout === "Physics" &&
              appConfig.activeView === "ForceGraph3d",
            isDarkMode,
            onApplyForceGraphConfig: onApplyForceGraphConfig,
            initialForceGraphConfig:
              currentSceneGraph.getForceGraphRenderConfig(),
            sceneGraph: currentSceneGraph,
            onShowFilter: showFilterWindow,
            onShowFilterManager: showFilterManager,
            onClearFilters: clearFilters,
            onShowPathAnalysis: showPathAnalysis,
          })}
          defaultIsOpen={true}
          isDarkMode={isDarkMode}
          footer={footerContent}
        />

        <main className={styles.main}>{children}</main>

        <Sidebar
          position="right"
          style={{
            height: "100%",
            top: 0,
          }}
          title="Controls"
          menuItems={createDefaultRightMenus(
            () => (
              <>
                {renderLayoutModeRadio()}
                {renderNodeLegend}
                {renderEdgeLegend}
              </>
            ),
            appConfig.activeView === "ForceGraph3d",
            appConfig.forceGraph3dOptions.layout,
            setSelectedForceGraph3dLayoutMode,
            isDarkMode
          )}
          defaultIsOpen={true}
          isDarkMode={isDarkMode}
          minimal={true}
        />
      </div>
    </div>
  );
};

export default Workspace;
