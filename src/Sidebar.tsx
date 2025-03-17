import {
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  Mail,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { CustomLayoutType } from "./core/layouts/CustomLayoutEngine";
import { GraphologyLayoutType } from "./core/layouts/GraphologyLayoutEngine";
import { GraphvizLayoutType } from "./core/layouts/GraphvizLayoutEngine";
import { PresetLayoutType } from "./core/layouts/LayoutEngine";
import styles from "./Sidebar.module.css";

// Define menu ID type
type MenuId =
  | "dashboard"
  | "management"
  | "reports"
  | "communications"
  | "layouts";

// Define menu state type
interface MenuState {
  dashboard: boolean;
  management: boolean;
  reports: boolean;
  communications: boolean;
  layouts: boolean;
}

interface SidebarProps {
  onLayoutChange: (layout: string) => void;
  activeLayout: string;
  physicsMode: boolean;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onLayoutChange,
  activeLayout,
  physicsMode,
  // eslint-disable-next-line unused-imports/no-unused-vars
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<MenuState>({
    dashboard: true,
    management: false,
    reports: false,
    communications: false,
    layouts: false,
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMenu = (menuId: MenuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const allLayoutLabels = [
    ...Object.values(GraphvizLayoutType),
    ...Object.values(GraphologyLayoutType),
    ...Object.values(CustomLayoutType),
    ...Object.values(PresetLayoutType),
  ];

  return (
    <div
      className={styles.sidebar}
      style={{
        width: isOpen ? "250px" : "60px",
        position: "fixed",
        top: "50px", // Adjust this value to match the height of the UniAppToolbar
        left: 0,
        height: "calc(100vh - 50px)", // Adjust this value to match the height of the UniAppToolbar
        zIndex: 1000,
      }}
    >
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        {isOpen && <h1 className={styles.sidebarTitle}>App Name</h1>}
        <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className={styles.menuContainer}>
        <nav className={styles.nav}>
          {/* Dashboard Menu */}
          <div className={styles.menuItem}>
            <button
              className={styles.menuButton}
              onClick={() => isOpen && toggleMenu("dashboard")}
            >
              <Home size={20} className={styles.menuIcon} />
              {isOpen && (
                <>
                  <span className={styles.menuText}>Dashboard</span>
                  {expandedMenus.dashboard ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.dashboard && (
              <div className={styles.submenu}>
                <a href="#" className={styles.submenuItem}>
                  Overview
                </a>
                <a href="#" className={styles.submenuItem}>
                  Analytics
                </a>
                <a href="#" className={styles.submenuItem}>
                  Statistics
                </a>
              </div>
            )}
          </div>

          {/* Management Menu */}
          <div className={styles.menuItem}>
            <button
              className={styles.menuButton}
              onClick={() => isOpen && toggleMenu("management")}
            >
              <Users size={20} className={styles.menuIcon} />
              {isOpen && (
                <>
                  <span className={styles.menuText}>Management</span>
                  {expandedMenus.management ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.management && (
              <div className={styles.submenu}>
                <a href="#" className={styles.submenuItem}>
                  Users
                </a>
                <a href="#" className={styles.submenuItem}>
                  Teams
                </a>
                <a href="#" className={styles.submenuItem}>
                  Roles
                </a>
              </div>
            )}
          </div>

          {/* Reports Menu */}
          <div className={styles.menuItem}>
            <button
              className={styles.menuButton}
              onClick={() => isOpen && toggleMenu("reports")}
            >
              <FileText size={20} className={styles.menuIcon} />
              {isOpen && (
                <>
                  <span className={styles.menuText}>Reports</span>
                  {expandedMenus.reports ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.reports && (
              <div className={styles.submenu}>
                <a href="#" className={styles.submenuItem}>
                  Monthly
                </a>
                <a href="#" className={styles.submenuItem}>
                  Quarterly
                </a>
                <a href="#" className={styles.submenuItem}>
                  Annual
                </a>
              </div>
            )}
          </div>

          {/* Communications Menu */}
          <div className={styles.menuItem}>
            <button
              className={styles.menuButton}
              onClick={() => isOpen && toggleMenu("communications")}
            >
              <Mail size={20} className={styles.menuIcon} />
              {isOpen && (
                <>
                  <span className={styles.menuText}>Communications</span>
                  {expandedMenus.communications ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.communications && (
              <div className={styles.submenu}>
                <a href="#" className={styles.submenuItem}>
                  Inbox
                </a>
                <a href="#" className={styles.submenuItem}>
                  Messages
                </a>
                <a href="#" className={styles.submenuItem}>
                  Notifications
                </a>
              </div>
            )}
          </div>

          {/* Layouts Menu */}
          <div className={styles.menuItem}>
            <button
              className={styles.menuButton}
              onClick={() => isOpen && toggleMenu("layouts")}
            >
              <Settings size={20} className={styles.menuIcon} />
              {isOpen && (
                <>
                  <span className={styles.menuText}>Layouts</span>
                  {expandedMenus.layouts ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.layouts && (
              <div className={styles.submenu}>
                {allLayoutLabels.map((layout) => (
                  <button
                    key={layout}
                    className={`layout-button ${!physicsMode && activeLayout === layout ? "active" : ""}`}
                    onClick={() => onLayoutChange(layout)}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
