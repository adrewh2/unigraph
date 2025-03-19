import { BookOpen, Filter, Home, List, Settings2, Share2 } from "lucide-react";
import React from "react";
import { ForceGraph3dLayoutMode } from "../AppConfig";
import ForceGraphLayoutRadio from "../components/force-graph/ForceGraphLayoutRadio";
import ForceGraphRenderConfigEditor from "../components/force-graph/ForceGraphRenderConfigEditor";
import { CustomLayoutType } from "../core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "../core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "../core/layouts/GraphvizLayoutEngine";
import { PresetLayoutType } from "../core/layouts/LayoutEngine";
import styles from "../Sidebar.module.css";

export interface SubMenuItem {
  label: string;
  onClick?: () => void;
  content?: React.ReactNode;
  customRender?: React.ReactNode;
}

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  content?: React.ReactNode;
  subMenus?: SubMenuItem[];
}

const allLayoutLabels = [
  ...Object.values(GraphvizLayoutType),
  ...Object.values(GraphologyLayoutType),
  ...Object.values(CustomLayoutType),
  ...Object.values(PresetLayoutType),
];

const LayoutButton = ({
  layout,
  onClick,
  isActive,
}: {
  layout: string;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    className={`${styles.layoutButton} ${isActive ? styles.active : ""}`}
    onClick={onClick}
  >
    {layout}
  </button>
);

export const createDefaultLeftMenus = ({
  sceneGraph,
  onLayoutChange,
  activeLayout,
  physicsMode,
  onApplyForceGraphConfig,
  isDarkMode,
  initialForceGraphConfig,
  onShowFilter,
  onShowFilterManager,
  onClearFilters,
}: any) => [
  {
    id: "project",
    icon: <Home size={20} className={styles.menuIcon} />,
    label: "Project",
    subMenus: [
      {
        label: "Loaded Graph",
        content: (
          <div>
            <br />
            <span>
              <strong>{sceneGraph.getMetadata().name}</strong>
            </span>
          </div>
        ),
      },
      { label: "Overview", onClick: () => console.log("Overview clicked") },
      {
        label: "Analytics",
        onClick: () => console.log("Analytics clicked"),
      },
      {
        label: "Statistics",
        onClick: () => console.log("Statistics clicked"),
      },
    ],
  },
  {
    id: "layouts",
    icon: <Share2 size={20} className={styles.menuIcon} />,
    label: "Layouts",
    subMenus: allLayoutLabels.map((layout: string) => ({
      label: layout,
      customRender: (
        <LayoutButton
          key={layout}
          layout={layout}
          onClick={() => onLayoutChange(layout)}
          isActive={!physicsMode && activeLayout === layout}
        />
      ),
    })),
  },
  {
    id: "forceGraphSettings",
    icon: <Settings2 size={20} />,
    label: "ForceGraph Settings",
    content: (
      <ForceGraphRenderConfigEditor
        onApply={onApplyForceGraphConfig}
        isDarkMode={isDarkMode}
        initialConfig={initialForceGraphConfig}
      />
    ),
  },
  {
    id: "filters",
    icon: <Filter size={20} />,
    label: "Filters",
    content: (
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onShowFilter}
          className={styles.submenuButton}
          style={{ flex: "1", minWidth: "70px" }}
        >
          Create
        </button>
        <button
          onClick={onShowFilterManager}
          className={styles.submenuButton}
          style={{ flex: "1", minWidth: "70px" }}
        >
          Load
        </button>
        <button
          onClick={onClearFilters}
          className={styles.submenuButton}
          style={{ flex: "1", minWidth: "70px" }}
        >
          Clear
        </button>
      </div>
    ),
  },
];

export const createDefaultRightMenus = (
  renderLegends: () => React.ReactNode,
  isForceGraph3dActive: boolean,
  forceGraphLayout: string,
  onForceGraphLayoutChange: (layout: string) => void,
  isDarkMode: boolean
) => [
  {
    id: "legends",
    icon: <List size={20} className={styles.menuIcon} />,
    label: "Legends",
    content: (
      <div className={styles.optionsPanelContainer}>{renderLegends()}</div>
    ),
  },
  {
    id: "settings",
    hideHeader: true, // Add this flag to hide the header
    icon: <Settings2 size={20} className={styles.menuIcon} />,
    label: "Settings",
    alwaysExpanded: true, // Add this flag to keep it expanded
    content: (
      <div className={styles.optionsPanelContainer}>
        {isForceGraph3dActive && (
          <ForceGraphLayoutRadio
            layout={forceGraphLayout as ForceGraph3dLayoutMode}
            onLayoutChange={onForceGraphLayoutChange}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    ),
  },
];

export const footerContent = (isOpen: boolean) => (
  <a
    href="https://aesgraph.github.io/unigraph/"
    target="_blank"
    rel="noopener noreferrer"
    className={styles.footerLink}
  >
    <BookOpen size={20} className={styles.footerIcon} />
    {isOpen && <span className={styles.footerText}>Documentation</span>}
  </a>
);
