import React, { useState } from "react";
import { saveProjectToSupabase } from "../../api/supabaseProjects";
import { SceneGraph } from "../../core/model/SceneGraph";
import {
  deserializeSceneGraphFromJson,
  serializeSceneGraphToJson,
} from "../../core/serializers/toFromJson";
import { addNotification } from "../../store/notificationStore";
import "./SaveProjectDialog.css";

interface SaveAsNewDialogProps {
  onSave: (projectId: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
  sceneGraph: SceneGraph;
}

const SaveAsNewDialog: React.FC<SaveAsNewDialogProps> = ({
  onSave,
  onCancel,
  isDarkMode,
  sceneGraph,
}) => {
  const [name, setName] = useState(sceneGraph.getMetadata()?.name || "");
  const [description, setDescription] = useState(
    sceneGraph.getMetadata()?.description || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addNotification({
        message: "Project name is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create a copy of the scene graph by serializing and deserializing
      const serializedData = serializeSceneGraphToJson(sceneGraph);
      const newSceneGraph = deserializeSceneGraphFromJson(serializedData);

      // Update the metadata with new name and description
      newSceneGraph.setMetadata({
        ...newSceneGraph.getMetadata(),
        name: name.trim(),
        description: description.trim(),
      });

      // Save to Supabase
      const savedProject = await saveProjectToSupabase(newSceneGraph);

      if (savedProject) {
        addNotification({
          message: `Project "${name}" saved successfully`,
          type: "success",
          duration: 8000,
        });
        onSave(savedProject.id);
      } else {
        throw new Error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      addNotification({
        message: "Failed to save project",
        type: "error",
        duration: 8000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`save-project-overlay ${isDarkMode ? "dark" : ""}`}>
      <div className="save-project-dialog">
        <div className="save-project-header">
          <h2>Save As New Project</h2>
          <button onClick={onCancel} className="save-project-close-button">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="save-project-form">
          <div className="save-project-field">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              autoFocus
              className="save-project-input"
              disabled={isSaving}
            />
          </div>
          <div className="save-project-field">
            <label htmlFor="project-description">Description (optional)</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="save-project-textarea"
              rows={4}
              disabled={isSaving}
            />
          </div>
          <div className="save-project-actions">
            <button
              type="button"
              onClick={onCancel}
              className="save-project-cancel-button"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-project-save-button"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? "Saving..." : "Save As New"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveAsNewDialog;
