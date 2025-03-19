import {
  ChevronDown,
  ChevronRight,
  MinusSquare,
  PlusSquare,
} from "lucide-react";
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
  searchTerm: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  graphs,
  onSelect,
  isExpanded,
  toggleExpand,
  isDarkMode,
  searchTerm,
}) => {
  const filteredGraphs = Object.entries(graphs).filter(([key]) =>
    key.toLowerCase().includes(searchTerm)
  );

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.treeNodeHeader} ${
          isDarkMode ? styles.dark : styles.light
        }`}
        onClick={() => toggleExpand(category)} // Make the entire header clickable
      >
        <button className={styles.expandButton}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={styles.categoryName}>{category}</span>
      </div>
      {isExpanded && (
        <div className={styles.treeNodeChildren}>
          {filteredGraphs.map(([key]) => (
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

  const filteredSceneGraphs = Object.entries(sceneGraphs).filter(
    ([category, { graphs }]) =>
      category.toLowerCase().includes(searchTerm) ||
      Object.keys(graphs).some((key) => key.toLowerCase().includes(searchTerm))
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
          <button className={styles.toolbarIconButton} onClick={expandAll}>
            <PlusSquare size={20} />
          </button>
          <button className={styles.toolbarIconButton} onClick={collapseAll}>
            <MinusSquare size={20} />
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
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
