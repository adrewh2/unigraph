import React, { useMemo } from "react";
import {
  createDefaultLeftMenus,
  createDefaultRightMenus,
  footerContent,
} from "../../configs/sidebarMenuConfig";
import { LayoutEngineOption } from "../../core/layouts/LayoutEngine";
import Sidebar from "../../Sidebar";
import UniAppToolbar from "../UniAppToolbar";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  menuConfig: any;
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
  renderNodeLegend: React.ReactNode;
  renderEdgeLegend: React.ReactNode;
  showToolbar?: boolean;
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
  renderNodeLegend,
  renderEdgeLegend,
  showToolbar = true,
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
          })}
          defaultIsOpen={true}
          isDarkMode={isDarkMode}
          footer={footerContent}
        />

        <main className={styles.main}>{children}</main>

        <Sidebar
          position="right"
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
