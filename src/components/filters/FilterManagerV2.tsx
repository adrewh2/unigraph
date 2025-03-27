import {
  Copy,
  Download,
  Edit2,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  RefreshCw,
  Save,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { SceneGraph } from "../../core/model/SceneGraph";
import { StoredSceneGraphInfo } from "../../core/storage/IPersistentStore";
import { persistentStore } from "../../core/storage/PersistentStoreManager";
import { DEMO_SCENE_GRAPHS } from "../../data/DemoSceneGraphs";
import useActiveFilterStore, {
  deleteFilter,
  Filter,
  getFilterByName,
  getSavedFilters,
  saveFilter,
} from "../../store/activeFilterStore";
import useAppConfigStore, {
  setActiveFilter,
  setActiveProjectId,
} from "../../store/appConfigStore";
import { addNotification } from "../../store/notificationStore"; // Add import for notifications
import LoadSceneGraphDialog from "../common/LoadSceneGraphDialog";
import SaveSceneGraphDialog from "../common/SaveSceneGraphDialog";
import "./FilterManagerV2.css";
import SaveFilterDialog from "./SaveFilterDialog";

interface FilterManagerV2Props {
  onFilterSelected: (filter: Filter) => void;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isGraph: boolean;
  isOpen?: boolean;
}

interface OptionsMenuProps {
  onClose: () => void;
  onExportAs: () => void;
  onDeleteFilter: () => void;
  buttonRect: DOMRect | null; // Add this prop
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  onClose,
  onExportAs,
  onDeleteFilter,
  buttonRect,
}) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="options-menu"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: buttonRect ? buttonRect.bottom + 4 : 0,
        left: buttonRect ? buttonRect.left : 0,
      }}
    >
      <button onClick={onExportAs}>Export As...</button>
      <button
        className="delete-option"
        onClick={() => {
          onClose();
          onDeleteFilter();
        }}
      >
        Delete
      </button>
    </div>
  );
};

const FilterManagerV2: React.FC<FilterManagerV2Props> = ({
  onFilterSelected,
}) => {
  const { activeFilter } = useAppConfigStore();
  const { savedFilters } = useActiveFilterStore();
  const [filters, setFilters] = useState<Filter[]>(Object.values(savedFilters));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Add state for showing the load dialog
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Add state for the save dialog
  const [showSaveDialog, setShowSaveDialog] = useState<string | null>(null);

  // Add state for editing project name
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Add state for options menu
  const [optionsMenu, setOptionsMenu] = useState<{
    id: string;
    buttonRect: DOMRect | null;
  } | null>(null);

  // Initialize tree data for demo graphs
  useEffect(() => {
    const initialTreeData: TreeNode[] = Object.entries(DEMO_SCENE_GRAPHS).map(
      ([category, { graphs }]) => ({
        id: category,
        label: category,
        isGraph: false,
        isOpen: false,
        children: Object.keys(graphs).map((graphId) => ({
          id: graphId,
          label: graphId,
          isGraph: true,
        })),
      })
    );

    setTreeData(initialTreeData);
  }, []);

  // Load the list of projects
  const loadFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      setFilters(Object.values(getSavedFilters()));
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Save current scene graph - updated to show dialog for new projects
  const handleSaveCurrent = async () => {
    try {
      if (activeProjectId) {
        await persistentStore.updateSceneGraph(
          activeProjectId,
          currentSceneGraph
        );
        console.log(`Updated existing project: ${activeProjectId}`);
        await loadFilters();
        addNotification({
          message: "Project saved successfully",
          type: "success",
          duration: 8000,
        });
      } else {
        setShowSaveDialog("saveAs");
      }
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project");
      addNotification({
        message: "Failed to save project",
        type: "error",
        duration: 8000,
      });
    }
  };

  // Add handler for save dialog submit
  const handleSaveDialogSubmit = async (name: string, description: string) => {
    try {
      // Update the metadata in the scene graph
      const metadata = currentSceneGraph.getMetadata() || {};
      currentSceneGraph.setMetadata({
        ...metadata,
        name,
        description,
      });

      // Save the scene graph
      const id = await persistentStore.saveSceneGraph(currentSceneGraph, {
        createThumbnail: true,
      });

      setActiveProjectId(id);
      await loadFilters(); // Refresh the list
      setActiveTab("myProjects"); // Switch to My Projects tab
      setShowSaveDialog(null); // Close the dialog
      addNotification({
        message: `Project "${name}" saved successfully`,
        type: "success",
        duration: 8000,
      });
    } catch (err) {
      console.error("Error saving project:", err);
      setError("Failed to save project");
      addNotification({
        message: "Failed to save new project",
        type: "error",
        duration: 8000,
      });
    }
  };

  // Load a project from persistent storage
  const handleLoadProject = async (projectId: string) => {
    try {
      const sceneGraph = await persistentStore.loadSceneGraph(projectId);

      if (sceneGraph) {
        setActiveProjectId(projectId);
        setSelectedDemoId(null);
        onProjectSelected(sceneGraph);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError("Failed to load project");
    }
  };

  // Load a demo graph
  const handleLoadDemoGraph = async (graphId: string) => {
    try {
      // Find the category that contains this graph
      const category = Object.entries(DEMO_SCENE_GRAPHS).find(
        ([_, { graphs }]) => Object.keys(graphs).includes(graphId)
      )?.[0];

      if (!category) {
        throw new Error(`Graph ${graphId} not found in any category`);
      }

      const graph = DEMO_SCENE_GRAPHS[category].graphs[graphId];
      let sceneGraph: SceneGraph;

      if (typeof graph === "function") {
        sceneGraph = await graph();
      } else {
        sceneGraph = graph;
      }

      setSelectedDemoId(graphId);
      setActiveProjectId(null);
      onProjectSelected(sceneGraph);
    } catch (err) {
      console.error("Error loading demo graph:", err);
      setError("Failed to load demo graph");
    }
  };

  // Delete a project
  const handleDeleteFilter = async (filterName: string) => {
    if (window.confirm("Are you sure you want to delete this filter?")) {
      try {
        deleteFilter(filterName);
        if (activeFilter?.name === filterName) {
          setActiveFilter(null);
        }
        await loadFilters();
        addNotification({
          message: `Filter "${filterName}" deleted`,
          type: "info",
          duration: 8000,
        });
      } catch (err) {
        console.error("Error deleting project:", err);
        setError("Failed to delete project");
        addNotification({
          message: "Failed to delete project",
          type: "error",
          duration: 8000,
        });
      }
    }
  };

  // Export a scene graph to a file
  const handleExport = async (filterName: string) => {
    try {
      const filter = filters.find((p) => p.name === filterName);
      const fileName = `${filter?.name || `filter-${filter?.name}`}.json`;

      const blob = new Blob([JSON.stringify(filter)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      addNotification({
        message: `Exported "${fileName}" successfully`,
        type: "success",
        duration: 8000,
      });
    } catch (err) {
      console.error("Error exporting project:", err);
      setError("Failed to export project");
      addNotification({
        message: "Failed to export project",
        type: "error",
        duration: 8000,
      });
    }
  };

  // Highlight text matching the search term
  //   const highlightText = (text: string, term: string) => {
  //     if (!term) return text;

  //     const parts = text.split(new RegExp(`(${term})`, "gi"));
  //     return (
  //       <>
  //         {parts.map((part, i) =>
  //           part.toLowerCase() === term.toLowerCase() ? (
  //             <span key={i} className="highlight">
  //               {part}
  //             </span>
  //           ) : (
  //             part
  //           )
  //         )}
  //       </>
  //     );
  //   };

  // Add function to handle opening the new graph dialog
  const handleNew = () => {
    setShowLoadDialog(true);
  };

  // Add handlers for edit and copy actions
  const handleStartEdit = (
    e: React.MouseEvent,
    project: StoredSceneGraphInfo
  ) => {
    e.stopPropagation();
    setEditingFilterId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEdit = async (e: React.MouseEvent, filterName: string) => {
    e.stopPropagation();
    try {
      const filter = getFilterByName(filterName);
      if (!filter) return;

      // Update the filter with the new name
      deleteFilter(filterName);
      filter.name = editingName;
      saveFilter(filter);

      await loadFilters(); // Refresh list
      setEditingFilterId(null);
      addNotification({
        message: `Renamed filter to "${editingName}"`,
        type: "success",
        duration: 8000,
      });
    } catch (err) {
      console.error("Error updating filter name:", err);
      setError("Failed to update filter name");
      addNotification({
        message: "Failed to rename filter",
        type: "error",
        duration: 8000,
      });
    }
  };

  const handleCopy = async (e: React.MouseEvent, filterName: string) => {
    e.stopPropagation();
    try {
      const filter = getFilterByName(filterName);
      if (filter) {
        setShowSaveDialog("saveAs");
        // Update the scene graph with a "Copy of" prefix
        const filterCopy = { ...filter, name: `Copy of ${filter.name}` };
        saveFilter(filterCopy);
        onFilterSelected(filterCopy);
        addNotification({
          message: "Copied filter successfully",
          type: "info",
          duration: 8000,
        });
      }
    } catch (err) {
      console.error("Error copying filter:", err);
      setError("Failed to copy filter");
      addNotification({
        message: "Failed to copy filter",
        type: "error",
        duration: 8000,
      });
    }
  };

  const handleOptionsClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setOptionsMenu({ id: projectId, buttonRect });
  };

  return (
    <div className={`project-manager`}>
      {/* Header */}
      <div className="project-manager-header">
        <h3>Projects</h3>
        <div className="project-manager-actions">
          <button title="New" onClick={handleNew} className="action-button">
            <Plus size={16} />
          </button>
          <button
            title="Save Current"
            onClick={handleSaveCurrent}
            className="action-button"
          >
            <Save size={16} />
          </button>
          <button
            title="Import"
            onClick={handleImport}
            className="action-button"
          >
            <FolderOpen size={16} />
          </button>
          <button
            title="Refresh"
            onClick={loadFilters}
            className="action-button"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="project-error">{error}</div>}

      {/* Tab Content */}
      <div className="tab-content">
        {/* My Projects Tab */}
        <div className="projects-list">
          {loading ? (
            <div className="projects-loading">Loading projects...</div>
          ) : filters.length === 0 ? (
            <div className="projects-empty">
              <p>No saved projects</p>
              <button
                className="new-project-button"
                onClick={handleSaveCurrent}
              >
                <Plus size={16} /> Save Current as Project
              </button>
            </div>
          ) : (
            filters.map((filter) => (
              <div
                key={filter.name}
                className={`project-item ${filter.name === filter.name ? "selected" : ""}`}
                onClick={() => handleLoadFilter(filter)}
              >
                <div className="project-icon">
                  <Folder size={18} />
                </div>
                <div className="project-details">
                  <div className="project-name">
                    {editingFilterId === project.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(e as any, project.id);
                          } else if (e.key === "Escape") {
                            setEditingFilterId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="project-name-input"
                        autoFocus
                      />
                    ) : (
                      project.name
                    )}
                  </div>
                  <div className="project-dates">
                    <span className="project-date-label">Modified:</span>
                    <span className="project-date">
                      {new Date(project.lastModified).toLocaleString()}
                    </span>
                    {project.createdAt && (
                      <>
                        <span className="project-date-label">Created:</span>
                        <span className="project-date">
                          {new Date(project.createdAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="project-actions">
                  <button
                    title="Edit Name"
                    onClick={(e) =>
                      editingFilterId === project.id
                        ? handleSaveEdit(e, project.id)
                        : handleStartEdit(e, project)
                    }
                    className="project-action-button"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    title="Copy"
                    onClick={(e) => handleCopy(e, project.id)}
                    className="project-action-button"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    title="Export"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(project.id);
                    }}
                    className="project-action-button"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    title="Options"
                    onClick={(e) => handleOptionsClick(e, project.id)}
                    className="project-action-button"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add LoadSceneGraphDialog */}
      {showLoadDialog && (
        <LoadSceneGraphDialog
          onClose={() => setShowLoadDialog(false)}
          onSelect={(key) => {
            handleLoadDemoGraph(key);
            setShowLoadDialog(false);
          }}
          isDarkMode={isDarkMode}
          handleLoadSceneGraph={(sceneGraph) => {
            onProjectSelected(sceneGraph);
            setShowLoadDialog(false);
          }}
        />
      )}

      {/* Add Save Dialog */}
      {showSaveDialog === "saveAs" && (
        <SaveFilterDialog
          onSave={handleSaveDialogSubmit}
          onClose={() => setShowSaveDialog(null)}
          isDarkMode={isDarkMode}
          //   initialName={currentSceneGraph.getMetadata()?.name || ""}
          //   initialDescription={
          // currentSceneGraph.getMetadata()?.description || ""
          //   }
        />
      )}
      {showSaveDialog === "exportAs" && (
        <SaveSceneGraphDialog
          onClose={() => setShowSaveDialog(null)}
          sceneGraph={currentSceneGraph}
        />
      )}

      {/* Add Options Menu */}
      {optionsMenu && (
        <OptionsMenu
          buttonRect={optionsMenu.buttonRect}
          onClose={() => setOptionsMenu(null)}
          onExportAs={() => {
            setShowSaveDialog("exportAs");
            setOptionsMenu(null);
          }}
          onDeleteProject={() => handleDeleteFilter(optionsMenu.id)}
        />
      )}
    </div>
  );
};

export default FilterManagerV2;
