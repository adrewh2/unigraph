import React, { useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import styles from "./SaveSceneGraphDialog.module.css";

interface SaveSceneGraphDialogProps {
  onClose: () => void;
  sceneGraph: SceneGraph;
}

const SaveSceneGraphDialog: React.FC<SaveSceneGraphDialogProps> = ({
  onClose,
  sceneGraph,
}) => {
  const [fileName, setFileName] = useState(sceneGraph.getMetadata().name || "");

  const handleSave = () => {
    const data = JSON.stringify(sceneGraph, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "scene-graph"}.json`;
    link.click();

    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Save Scene Graph</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <label htmlFor="fileName" className={styles.label}>
            File Name
          </label>
          <input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSceneGraphDialog;
