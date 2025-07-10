import {
  ChevronDown,
  ChevronRight,
  MinusSquare,
  PlusSquare,
  RefreshCw,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  getProject,
  listProjects,
  toSceneGraph,
} from "../../api/supabaseProjects";
import { SceneGraph } from "../../core/model/SceneGraph";
import { deserializeDotToSceneGraph } from "../../core/serializers/fromDot";
import { loadSceneGraphFromFile } from "../../core/serializers/sceneGraphLoader";
import { DEMO_SCENE_GRAPHS } from "../../data/DemoSceneGraphs";
import { fetchSvgSceneGraph } from "../../hooks/useSvgSceneGraph";
import { addNotification } from "../../store/notificationStore";
import styles from "./LoadSceneGraphDialog.module.css";

interface TreeNodeProps {
  category: string;
  graphs: {
    [key: string]:
      | SceneGraph
      | (() => SceneGraph)
      | (() => Promise<SceneGraph>);
  };
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

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className={styles.highlight}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.treeNodeHeader} ${
          isDarkMode ? styles.dark : styles.light
        }`}
        onClick={() => toggleExpand(category)}
      >
        <button className={styles.expandButton}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={styles.categoryName}>
          {highlightText(category, searchTerm)}
        </span>
      </div>
      {isExpanded && (
        <div className={styles.treeNodeChildren}>
          {filteredGraphs.map(([key]) => (
            <button
              key={key}
              className={styles.graphButton}
              onClick={() => onSelect(key)}
            >
              {highlightText(key, searchTerm)}
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
  handleLoadSceneGraph: (sceneGraph: SceneGraph) => void;
}

const LoadSceneGraphDialog: React.FC<LoadSceneGraphDialogProps> = ({
  onClose,
  onSelect,
  isDarkMode,
  handleLoadSceneGraph,
}) => {
  const [activeTab, setActiveTab] = useState<
    "File" | "Demos" | "Text" | "SVG URL" | "Server"
  >("Demos");
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [textInput, setTextInput] = useState("");
  const [svgUrl, setSvgUrl] = useState("");

  // Server projects state
  const [serverProjects, setServerProjects] = useState<any[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSearchTerm, setServerSearchTerm] = useState("");

  // Load server projects when Server tab is selected
  useEffect(() => {
    if (activeTab === "Server" && serverProjects.length === 0) {
      loadServerProjects();
    }
  }, [activeTab, serverProjects.length]);

  const loadServerProjects = async () => {
    setServerLoading(true);
    setServerError(null);
    try {
      const projects = await listProjects();
      setServerProjects(projects);
    } catch (error) {
      console.error("Error loading server projects:", error);
      setServerError("Failed to load projects from server");
      addNotification({
        message: "Failed to load projects from server",
        type: "error",
        duration: 5000,
      });
    } finally {
      setServerLoading(false);
    }
  };

  const handleServerProjectSelect = async (projectId: string) => {
    try {
      const project = await getProject({ id: projectId });
      if (!project) {
        throw new Error("Project not found");
      }

      const sceneGraph = toSceneGraph(project);
      handleLoadSceneGraph(sceneGraph);
      onClose();

      addNotification({
        message: `Loaded project: ${project.name}`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error loading server project:", error);
      addNotification({
        message: "Failed to load project from server",
        type: "error",
        duration: 5000,
      });
    }
  };

  const toggleExpand = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    const allCategories = Object.keys(DEMO_SCENE_GRAPHS);
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
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const expandedState = Object.entries(DEMO_SCENE_GRAPHS).reduce(
      (acc, [category, { graphs }]) => {
        const matchesCategory = category.toLowerCase().includes(term);
        const matchesGraphs = Object.keys(graphs).some((key) =>
          key.toLowerCase().includes(term)
        );
        return { ...acc, [category]: matchesCategory || matchesGraphs };
      },
      {}
    );
    setExpandedCategories(expandedState);
  };

  const filteredSceneGraphs = Object.entries(DEMO_SCENE_GRAPHS).filter(
    ([category, { graphs }]) =>
      category.toLowerCase().includes(searchTerm) ||
      Object.keys(graphs).some((key) => key.toLowerCase().includes(searchTerm))
  );

  const handleImportFileToSceneGraph = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const sceneGraph = await loadSceneGraphFromFile(file);
        if (sceneGraph) {
          handleLoadSceneGraph(sceneGraph);
          onClose();
        } else {
          throw new Error("Failed to load scene graph from file");
        }
      } catch (error) {
        console.error(`Error importing file: ${error}`);
      }
    },
    [handleLoadSceneGraph, onClose]
  );

  const handleTextSubmit = () => {
    try {
      const sceneGraph = deserializeDotToSceneGraph(textInput);
      handleLoadSceneGraph(sceneGraph);
      onClose();
    } catch (error) {
      console.error("Failed to parse text input as SceneGraph:", error);
    }
  };

  const handleSvgUrlSubmit = async () => {
    try {
      const { sceneGraph, error } = await fetchSvgSceneGraph(svgUrl);
      if (error) {
        console.error("Failed to load SVG from URL:", error);
        return;
      }
      handleLoadSceneGraph(sceneGraph);
      onClose();
    } catch (error) {
      console.error("Failed to load SVG URL:", error);
    }
  };

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
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "File" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("File")}
          >
            File
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Demos" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Demos")}
          >
            Demos
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Text" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Text")}
          >
            Text
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "SVG URL" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("SVG URL")}
          >
            SVG URL
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Server" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("Server")}
          >
            Server
          </button>
        </div>
        {activeTab === "File" && (
          <div className={styles.fileTab}>
            <input
              type="file"
              accept=".json,.graphml,.svg,.dot"
              onChange={handleImportFileToSceneGraph}
              className={styles.fileInput}
            />
          </div>
        )}
        {activeTab === "Demos" && (
          <div className={styles.demosTab}>
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
              <button
                className={styles.toolbarIconButton}
                onClick={collapseAll}
              >
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
        )}
        {activeTab === "Text" && (
          <div className={styles.textTab}>
            <textarea
              className={styles.textInput}
              placeholder="Paste SceneGraph JSON here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <button className={styles.submitButton} onClick={handleTextSubmit}>
              Load
            </button>
          </div>
        )}
        {activeTab === "SVG URL" && (
          <div className={styles.svgUrlTab}>
            <input
              type="text"
              placeholder="Enter SVG URL..."
              className={styles.svgUrlInput}
              value={svgUrl}
              onChange={(e) => setSvgUrl(e.target.value)}
            />
            <button
              className={styles.submitButton}
              onClick={handleSvgUrlSubmit}
            >
              Load
            </button>
          </div>
        )}
        {activeTab === "Server" && (
          <div className={styles.serverTab}>
            <div className={styles.toolbar}>
              <input
                type="text"
                placeholder="Search projects..."
                className={styles.searchBar}
                value={serverSearchTerm}
                onChange={(e) => setServerSearchTerm(e.target.value)}
              />
              <button
                className={styles.toolbarIconButton}
                onClick={loadServerProjects}
                disabled={serverLoading}
                title="Refresh projects"
              >
                <RefreshCw
                  size={20}
                  className={serverLoading ? styles.spinning : ""}
                />
              </button>
            </div>
            <div className={styles.content}>
              {serverLoading && <p>Loading projects...</p>}
              {serverError && <p style={{ color: "red" }}>{serverError}</p>}
              {!serverLoading &&
                !serverError &&
                serverProjects.length === 0 && (
                  <p>No projects found on server</p>
                )}
              {!serverLoading && !serverError && serverProjects.length > 0 && (
                <div className={styles.serverProjectsList}>
                  {serverProjects
                    .filter((project) =>
                      project.name
                        .toLowerCase()
                        .includes(serverSearchTerm.toLowerCase())
                    )
                    .map((project) => (
                      <button
                        key={project.id}
                        className={styles.serverProjectButton}
                        onClick={() => handleServerProjectSelect(project.id)}
                      >
                        <div className={styles.projectInfo}>
                          <div className={styles.projectName}>
                            {project.name}
                          </div>
                          {project.description && (
                            <div className={styles.projectDescription}>
                              {project.description}
                            </div>
                          )}
                          <div className={styles.projectDate}>
                            {project.last_updated_at &&
                              new Date(
                                project.last_updated_at
                              ).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadSceneGraphDialog;
