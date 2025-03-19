/* eslint-disable unused-imports/no-unused-vars */
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { sceneGraphs } from "../../data/graphs/sceneGraphLib";
import styles from "./LoadSceneGraphDialog.module.css";

interface TreeNodeProps {
  category: string;
  graphs: { [key: string]: SceneGraph | (() => SceneGraph) };
  onSelect: (key: string) => void;
  isDarkMode?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  graphs,
  onSelect,
  isDarkMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.treeNode}>
      <div className={styles.treeNodeHeader}>
        <button
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={styles.categoryName}>{category}</span>
      </div>
      {isExpanded && (
        <div className={styles.treeNodeChildren}>
          {Object.entries(graphs).map(([key, value]) => (
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
        <div className={styles.content}>
          {Object.entries(sceneGraphs).map(([category, { graphs }]) => (
            <TreeNode
              key={category}
              category={category}
              graphs={graphs}
              onSelect={handleSelect}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
