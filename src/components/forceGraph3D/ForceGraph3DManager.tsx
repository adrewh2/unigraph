import React, { useState, useEffect } from "react";
import {
  getAllForceGraph3DInstances,
  removeForceGraph3DInstance,
  updateForceGraph3DInstanceName,
  ForceGraph3DInstanceData,
} from "../../store/appConfigStore";
import ForceGraph3DInstanceSelector from "./ForceGraph3DInstanceSelector";
import styles from "./ForceGraph3DManager.module.css";

interface ForceGraph3DManagerProps {
  onClose?: () => void;
  onInstanceSelected?: (instanceId: string | null, instanceData: ForceGraph3DInstanceData | null) => void;
}

const ForceGraph3DManager: React.FC<ForceGraph3DManagerProps> = ({
  onClose,
  onInstanceSelected,
}) => {
  const [instances, setInstances] = useState<ForceGraph3DInstanceData[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const refreshInstances = () => {
    setInstances(getAllForceGraph3DInstances());
  };

  useEffect(() => {
    refreshInstances();
    const interval = setInterval(refreshInstances, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInstanceSelect = (instanceId: string | null, instanceData: ForceGraph3DInstanceData | null) => {
    setSelectedInstanceId(instanceId);
    if (onInstanceSelected) {
      onInstanceSelected(instanceId, instanceData);
    }
  };

  const handleDeleteInstance = (instanceId: string) => {
    if (confirm("Are you sure you want to delete this ForceGraph3D instance?")) {
      removeForceGraph3DInstance(instanceId);
      refreshInstances();
      if (selectedInstanceId === instanceId) {
        setSelectedInstanceId(null);
      }
    }
  };

  const handleStartEdit = (instance: ForceGraph3DInstanceData) => {
    setEditingId(instance.id);
    setEditingName(instance.name || "");
  };

  const handleSaveEdit = (instanceId: string) => {
    if (editingName.trim()) {
      updateForceGraph3DInstanceName(instanceId, editingName.trim());
      setEditingId(null);
      setEditingName("");
      refreshInstances();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUseInstance = () => {
    if (selectedInstanceId && onInstanceSelected) {
      const instance = instances.find(inst => inst.id === selectedInstanceId);
      onInstanceSelected(selectedInstanceId, instance || null);
    } else if (selectedInstanceId === null && onInstanceSelected) {
      onInstanceSelected(null, null);
    }
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage ForceGraph3D Instances</h2>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.selectorSection}>
          <ForceGraph3DInstanceSelector
            onInstanceSelect={handleInstanceSelect}
            selectedInstanceId={selectedInstanceId}
          />
        </div>

        <div className={styles.detailsSection}>
          <h3>Instance Details</h3>
          
          {selectedInstanceId === null ? (
            <div className={styles.instanceDetails}>
              <h4>Main ForceGraph3D</h4>
              <p>This is the current active ForceGraph3D instance displayed in the main view.</p>
            </div>
          ) : (
            <>
              {instances.length === 0 ? (
                <p className={styles.noInstances}>No persistent instances created yet.</p>
              ) : (
                <div className={styles.instancesList}>
                  {instances.map((instance) => (
                    <div 
                      key={instance.id} 
                      className={`${styles.instanceCard} ${
                        selectedInstanceId === instance.id ? styles.selected : ''
                      }`}
                    >
                      <div className={styles.instanceHeader}>
                        {editingId === instance.id ? (
                          <div className={styles.editForm}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(instance.id)}
                              className={styles.editInput}
                              autoFocus
                            />
                            <button 
                              onClick={() => handleSaveEdit(instance.id)}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4>{instance.name}</h4>
                            <div className={styles.instanceActions}>
                              <button
                                onClick={() => handleStartEdit(instance)}
                                className={styles.editButton}
                                title="Edit name"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteInstance(instance.id)}
                                className={styles.deleteButton}
                                title="Delete instance"
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className={styles.instanceMeta}>
                        <p><strong>ID:</strong> {instance.id}</p>
                        <p><strong>Created:</strong> {instance.createdAt.toLocaleString()}</p>
                        <p><strong>Scene Graph:</strong> {instance.sceneGraph.getData().metadata?.name || "Unnamed"}</p>
                        <p><strong>Status:</strong> {instance.instance ? "Initialized" : "Not initialized"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button 
          onClick={handleUseInstance}
          className={styles.useButton}
          disabled={selectedInstanceId === null && !instances.length}
        >
          Use Selected Instance
        </button>
        {onClose && (
          <button onClick={onClose} className={styles.cancelFooterButton}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ForceGraph3DManager;
