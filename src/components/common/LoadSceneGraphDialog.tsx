import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { sceneGraphs } from "../../data/graphs/sceneGraphLib";
import styles from "./LoadSceneGraphDialog.module.css";

interface TreeNodeProps {
  category: string;
  graphs: { [key: string]: SceneGraph | (() => SceneGraph) };
  onSelect: (key: string) => void;
  isExpanded: boolean;
  toggleExpand: (category: string) => void;
  isDarkMode?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  graphs,
  onSelect,
  isExpanded,
  toggleExpand,
  isDarkMode,
}) => {
  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.treeNodeHeader} ${
          isDarkMode ? styles.dark : styles.light
        }`}
      >
        <button
          className={styles.expandButton}
          onClick={() => toggleExpand(category)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={styles.categoryName}>{category}</span>
      </div>
      {isExpanded && (
        <div className={styles.treeNodeChildren}>
          {Object.entries(graphs).map(([key]) => (
            <button
              key={key}
              className={styles.graphButton}
              onClick={() => onSelect(key)}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface LoadSceneGraphDialogProps {
  onClose: () => void;
  onSelect: (graphKey: string) => void;
  isDarkMode?: boolean;
}

const LoadSceneGraphDialog: React.FC<LoadSceneGraphDialogProps> = ({
  onClose,
  onSelect,
  isDarkMode,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    const allCategories = Object.keys(sceneGraphs);
    const expandedState = allCategories.reduce(
      (acc, category) => ({ ...acc, [category]: true }),
      {}
    );
    setExpandedCategories(expandedState);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredSceneGraphs = Object.entries(sceneGraphs).filter(([category]) =>
    category.toLowerCase().includes(searchTerm)
  );

  const handleSelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  return (
    <div className={`${styles.overlay} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Load Scene Graph</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className={styles.toolbarButton} onClick={expandAll}>
            Expand All
          </button>
          <button className={styles.toolbarButton} onClick={collapseAll}>
            Collapse All
          </button>
        </div>
        <div className={styles.content}>
          {filteredSceneGraphs.map(([category, { graphs }]) => (
            <TreeNode
              key={category}
              category={category}
              graphs={graphs}
              onSelect={handleSelect}
              isExpanded={!!expandedCategories[category]}
              toggleExpand={toggleExpand}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
