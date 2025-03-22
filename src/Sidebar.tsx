/* eslint-disable unused-imports/no-unused-vars */
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import { SubMenuItem } from "./configs/RightSidebarConfig";

interface SidebarProps {
  position: "left" | "right";
  title?: string;
  menuItems: MenuItem[];
  onToggle?: () => void;
  isDarkMode?: boolean;
  content?: React.ReactNode;
  footer?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  minimal?: boolean;
  mode: "collapsed" | "full";
  style?: React.CSSProperties;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  content?: React.ReactNode;
  subMenus?: SubMenuItem[];
  hideHeader?: boolean;
  alwaysExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  position,
  title = "Unigraph",
  menuItems,
  onToggle,
  isDarkMode,
  content,
  footer,
  minimal = false,
  style = {},
  mode = "full",
}) => {
  const [isOpen, setIsOpen] = useState(mode === "full");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(mode === "full");
  }, [mode]);

  // Get toolbar height from CSS or use default
  const toolbarHeight =
    getComputedStyle(document.documentElement).getPropertyValue(
      "--toolbar-height"
    ) || "40px";

  const closeButton =
    position === "left" ? (
      <ChevronsLeft size={20} />
    ) : (
      <ChevronsRight size={20} />
    );

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
    onToggle?.();
  };

  const handleSectionClick = (menuId: string) => {
    setActiveSection((prev) => (prev === menuId ? null : menuId));
  };

  // Close active section when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      // Check if click is outside both the sidebar and any side panel
      if (
        !target.closest(`.${styles.sidebar}`) &&
        !target.closest(`.${styles.fullHeightSidePanel}`)
      ) {
        setActiveSection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (minimal && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${styles.minimalTab} ${styles[position]}`}
        aria-label="Open sidebar"
      >
        {position === "left" ? (
          <ChevronsRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>
    );
  }

  return (
    <>
      <div
        className={styles.sidebar}
        style={{
          width: isOpen ? "200px" : minimal ? "0px" : "60px",
          ...style,
        }}
      >
        <div className={styles.sidebarHeader}>
          {isOpen && <h1 className={styles.sidebarTitle}>{title}</h1>}
          <button
            onClick={toggleSidebar}
            className={styles.toggleButton}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? closeButton : <Menu size={20} />}
          </button>
        </div>

        <div className={styles.menuContainer}>
          {content ? (
            <div className={styles.sidebarContent}>{content}</div>
          ) : (
            <nav className={styles.nav}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.menuItem} ${
                    activeSection === item.id ? styles.active : ""
                  }`}
                >
                  {!item.hideHeader && (
                    <button
                      className={styles.menuButton}
                      onClick={() => handleSectionClick(item.id)}
                    >
                      {item.icon}
                      {isOpen && (
                        <>
                          <span className={styles.menuText}>{item.label}</span>
                          {activeSection === item.id ? (
                            <ChevronRight size={16} />
                          ) : (
                            <ChevronLeft size={16} />
                          )}
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {footer && typeof footer === "function" ? (
          <div className={styles.sidebarFooter}>{footer(isOpen)}</div>
        ) : (
          footer && <div className={styles.sidebarFooter}>{footer}</div>
        )}
      </div>

      {/* Full-height side panels for active section */}
      {activeSection &&
        menuItems.find((item) => item.id === activeSection)?.content && (
          <div
            className={styles.fullHeightSidePanel}
            style={{
              [position === "left" ? "left" : "right"]: isOpen
                ? "200px"
                : minimal
                  ? "0px"
                  : "60px",
              // Ensure the CSS variable is applied for correct positioning
              top: `var(--toolbar-height, ${toolbarHeight})`,
              height: `calc(100vh - var(--toolbar-height, ${toolbarHeight}))`,
            }}
          >
            <div className={styles.sidePanelHeader}>
              <h3>
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h3>
              <button
                onClick={() => setActiveSection(null)}
                className={styles.closeButton}
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className={styles.sidePanelContent}>
              {menuItems.find((item) => item.id === activeSection)?.content}
            </div>
          </div>
        )}
    </>
  );
};

export default Sidebar;
