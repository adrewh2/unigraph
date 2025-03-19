import { List, Settings2 } from "lucide-react";
import React from "react";
import { ForceGraph3dLayoutMode } from "../AppConfig";
import ForceGraphLayoutRadio from "../components/force-graph/ForceGraphLayoutRadio";
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

export const rightFooterContent = (
  isOpen: boolean,
  actions?: {
    onFitToView: () => void;
    onViewEntities?: () => void;
  }
) => {
  if (!actions) return null;

  return (
    <div className={`${styles.footerButtonGroup} ${styles.footerButtonColumn}`}>
      <button className={styles.footerButton} onClick={actions.onViewEntities}>
        View Entities
      </button>
      <button className={styles.footerButton} onClick={actions.onFitToView}>
        Fit to View
      </button>
    </div>
  );
};
