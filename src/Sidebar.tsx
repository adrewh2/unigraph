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

// Define menu ID type
type MenuId = "dashboard" | "management" | "reports" | "communications";

// Define menu state type
interface MenuState {
  dashboard: boolean;
  management: boolean;
  reports: boolean;
  communications: boolean;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<MenuState>({
    dashboard: true,
    management: false,
    reports: false,
    communications: false,
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

  return (
    <div
      style={{
        ...styles.sidebar,
        width: isOpen ? "250px" : "60px",
        position: "fixed",
        top: "50px", // Adjust this value to match the height of the UniAppToolbar
        left: 0,
        height: "calc(100vh - 50px)", // Adjust this value to match the height of the UniAppToolbar
        zIndex: 1000,
      }}
    >
      {/* Sidebar Header */}
      <div style={styles.sidebarHeader}>
        {isOpen && <h1 style={styles.sidebarTitle}>App Name</h1>}
        <button
          onClick={toggleSidebar}
          style={styles.toggleButton}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div style={styles.menuContainer}>
        <nav style={styles.nav}>
          {/* Dashboard Menu */}
          <div style={styles.menuItem}>
            <button
              style={styles.menuButton}
              onClick={() => isOpen && toggleMenu("dashboard")}
            >
              <Home size={20} style={styles.menuIcon} />
              {isOpen && (
                <>
                  <span style={styles.menuText}>Dashboard</span>
                  {expandedMenus.dashboard ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.dashboard && (
              <div style={styles.submenu}>
                <a href="#" style={styles.submenuItem}>
                  Overview
                </a>
                <a href="#" style={styles.submenuItem}>
                  Analytics
                </a>
                <a href="#" style={styles.submenuItem}>
                  Statistics
                </a>
              </div>
            )}
          </div>

          {/* Management Menu */}
          <div style={styles.menuItem}>
            <button
              style={styles.menuButton}
              onClick={() => isOpen && toggleMenu("management")}
            >
              <Users size={20} style={styles.menuIcon} />
              {isOpen && (
                <>
                  <span style={styles.menuText}>Management</span>
                  {expandedMenus.management ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.management && (
              <div style={styles.submenu}>
                <a href="#" style={styles.submenuItem}>
                  Users
                </a>
                <a href="#" style={styles.submenuItem}>
                  Teams
                </a>
                <a href="#" style={styles.submenuItem}>
                  Roles
                </a>
              </div>
            )}
          </div>

          {/* Reports Menu */}
          <div style={styles.menuItem}>
            <button
              style={styles.menuButton}
              onClick={() => isOpen && toggleMenu("reports")}
            >
              <FileText size={20} style={styles.menuIcon} />
              {isOpen && (
                <>
                  <span style={styles.menuText}>Reports</span>
                  {expandedMenus.reports ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.reports && (
              <div style={styles.submenu}>
                <a href="#" style={styles.submenuItem}>
                  Monthly
                </a>
                <a href="#" style={styles.submenuItem}>
                  Quarterly
                </a>
                <a href="#" style={styles.submenuItem}>
                  Annual
                </a>
              </div>
            )}
          </div>

          {/* Communications Menu */}
          <div style={styles.menuItem}>
            <button
              style={styles.menuButton}
              onClick={() => isOpen && toggleMenu("communications")}
            >
              <Mail size={20} style={styles.menuIcon} />
              {isOpen && (
                <>
                  <span style={styles.menuText}>Communications</span>
                  {expandedMenus.communications ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>
            {isOpen && expandedMenus.communications && (
              <div style={styles.submenu}>
                <a href="#" style={styles.submenuItem}>
                  Inbox
                </a>
                <a href="#" style={styles.submenuItem}>
                  Messages
                </a>
                <a href="#" style={styles.submenuItem}>
                  Notifications
                </a>
              </div>
            )}
          </div>

          {/* Settings (no submenu) */}
          <button style={styles.menuButton}>
            <Settings size={20} style={styles.menuIcon} />
            {isOpen && <span style={styles.menuText}>Settings</span>}
          </button>
        </nav>
      </div>
    </div>
  );
};

// Define all styles here
const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    backgroundColor: "#1F2937",
    color: "white",
    display: "flex",
    flexDirection: "column" as const,
    transition: "width 0.3s ease",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: "1px solid #374151",
  },
  sidebarTitle: {
    fontWeight: "bold",
    fontSize: "1.25rem",
    margin: 0,
  },
  toggleButton: {
    padding: "4px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
  menuContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px 0",
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  menuItem: {
    marginBottom: "4px",
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s",
    textAlign: "left" as const,
    justifyContent: "center", // Center the content
  },
  menuIcon: {
    flexShrink: 0,
  },
  menuText: {
    marginLeft: "12px",
    flex: 1,
    whiteSpace: "nowrap" as const,
  },
  submenu: {
    paddingLeft: "40px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    marginTop: "4px",
  },
  submenuItem: {
    padding: "8px",
    display: "block",
    color: "white",
    textDecoration: "none",
    fontSize: "0.875rem",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    backgroundColor: "#F3F4F6",
  },
  mainTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "16px",
  },
};

// Add hover effects with a separate stylesheet or use React's onMouseEnter/onMouseLeave
// You can also extract these styles to a separate CSS file

export default Sidebar;
