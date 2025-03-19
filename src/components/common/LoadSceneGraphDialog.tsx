import React from "react";
import { getAllGraphs } from "../../data/graphs/sceneGraphLib";
import styles from "./LoadSceneGraphDialog.module.css";

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
  const allGraphs = getAllGraphs();

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
          {Object.entries(allGraphs).map(([key]) => (
            <button
              key={key}
              className={styles.graphButton}
              onClick={() => {
                onSelect(key);
                onClose();
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
