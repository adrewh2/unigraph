import React, { useState } from "react";
import { registerViews } from "app-shell";
import ForceGraph3DManager from "../forceGraph3D/ForceGraph3DManager";
import ForceGraph3DView from "./ForceGraph3DView";
import { ForceGraph3DInstanceData } from "../../store/appConfigStore";
import styles from "./ForceGraph3DTabCreator.module.css";

interface ForceGraph3DTabCreatorProps {
  onClose: () => void;
  onTabCreated?: (viewId: string) => void;
}

const ForceGraph3DTabCreator: React.FC<ForceGraph3DTabCreatorProps> = ({
  onClose,
  onTabCreated,
}) => {
  const [selectedInstance, setSelectedInstance] = useState<{
    id: string | null;
    data: ForceGraph3DInstanceData | null;
  }>({ id: null, data: null });

  const handleInstanceSelected = (instanceId: string | null, instanceData: ForceGraph3DInstanceData | null) => {
    setSelectedInstance({ id: instanceId, data: instanceData });
  };

  const handleCreateTab = () => {
    let viewId: string;
    let viewTitle: string;

    if (selectedInstance.id === null) {
      // Main ForceGraph3D instance
      viewId = "force-graph-3d-main";
      viewTitle = "ForceGraph 3D (Main)";
    } else {
      // Specific instance
      viewId = `force-graph-3d-${selectedInstance.id}`;
      viewTitle = `ForceGraph 3D: ${selectedInstance.data?.name || selectedInstance.id}`;
    }

    // Register the view dynamically
    const view = {
      id: viewId,
      title: viewTitle,
      icon: "🌐",
      component: (props: any) => (
        <ForceGraph3DView {...props} instanceId={selectedInstance.id} />
      ),
    };

    registerViews([view]);

    if (onTabCreated) {
      onTabCreated(viewId);
    }

    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Add ForceGraph3D to Tab</h2>
          <p>Select which ForceGraph3D instance to display in the new tab.</p>
        </div>

        <div className={styles.content}>
          <ForceGraph3DManager
            onClose={onClose}
            onInstanceSelected={handleInstanceSelected}
          />
        </div>

        <div className={styles.footer}>
          <button 
            onClick={handleCreateTab} 
            className={styles.createButton}
            disabled={selectedInstance.id === null && selectedInstance.data === null}
          >
            Add to Tab
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForceGraph3DTabCreator;
