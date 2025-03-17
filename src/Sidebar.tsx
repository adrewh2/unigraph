/* eslint-disable unused-imports/no-unused-vars */
import { BookOpen, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MenuItem } from "./configs/sidebarMenuConfig";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  position: "left" | "right";
  title?: string;
  menuItems: MenuItem[];
  defaultIsOpen?: boolean;
  onToggle?: () => void;
  isDarkMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  position,
  title = "Unigraph",
  menuItems,
  defaultIsOpen = true,
  onToggle,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [expandedMenus, setExpandedMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
    onToggle?.();
  };

  const toggleMenu = (menuId: string) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedMenus((prev) => ({ ...prev, [menuId]: true }));
    } else {
      setExpandedMenus((prev) => ({
        ...prev,
        [menuId]: !prev[menuId],
      }));
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setExpandedMenus({});
    }
  }, [isOpen]);

  return (
    <div
      className={styles.sidebar}
      style={{
        width: isOpen ? "200px" : "60px",
        position: "fixed",
        top: "50px",
        [position]: 0,
        height: "calc(100vh - 50px)",
        zIndex: 1000,
      }}
    >
      <div className={styles.sidebarHeader}>
        {isOpen && <h1 className={styles.sidebarTitle}>{title}</h1>}
        <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={styles.menuContainer}>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.id} className={styles.menuItem}>
              <button
                className={styles.menuButton}
                onClick={() => toggleMenu(item.id)}
              >
                {item.icon}
                {isOpen && (
                  <>
                    <span className={styles.menuText}>{item.label}</span>
                    {expandedMenus[item.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </>
                )}
              </button>
              {isOpen && expandedMenus[item.id] && (
                <div className={styles.submenu}>
                  {item.content ||
                    item.subMenus?.map((subMenu, idx) => (
                      <div key={idx} className={styles.submenuItem}>
                        {subMenu.customRender || subMenu.content || (
                          <button
                            onClick={subMenu.onClick}
                            className={styles.submenuButton}
                          >
                            {subMenu.label}
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        <a
          href="https://aesgraph.github.io/unigraph/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          <BookOpen size={20} className={styles.footerIcon} />
          {isOpen && <span className={styles.footerText}>Documentation</span>}
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
