import React, { useState } from "react";
import useAppConfigStore from "../../store/appConfigStore";
import EntityTableV2 from "../common/EntityTableV2";
import { SceneGraph } from "../../core/model/SceneGraph";
import { Graph } from "../../core/model/Graph";
import { Node } from "../../core/model/Node";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { useTheme } from "@aesgraph/app-shell";

type ResourceManagerViewProps = Record<string, never>;

interface TabData {
  id: string;
  label: string;
  icon: string;
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
}

const ResourceManagerView: React.FC<ResourceManagerViewProps> = () => {
  const { currentSceneGraph } = useAppConfigStore();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("nodes");

  if (!currentSceneGraph) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.text,
        }}
      >
        <p>No scene graph available. Please load a graph first.</p>
      </div>
    );
  }

  const graph: Graph = currentSceneGraph.getGraph();
  
  // Create containers for different entity types
  const nodesContainer = graph.getNodes();
  const edgesContainer = graph.getEdges();
  
  // Filter nodes by type for web resources and annotations
  const webResourcesContainer = new EntitiesContainer(
    nodesContainer.toArray().filter((node: Node) => 
      node.getType() === "webpage" || 
      node.getType() === "resource" ||
      node.getType() === "url" ||
      (node.getData() as any)?.url
    )
  );
  
  const annotationsContainer = new EntitiesContainer(
    nodesContainer.toArray().filter((node: Node) => 
      node.getType() === "annotation" ||
      node.getType() === "text_selection" ||
      node.getType() === "image_annotation"
    )
  );

  const tabs: TabData[] = [
    {
      id: "nodes",
      label: "Nodes",
      icon: "🔵",
      container: nodesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "edges",
      label: "Edges", 
      icon: "🔗",
      container: edgesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "web-resources",
      label: "Web Resources",
      icon: "🌐",
      container: webResourcesContainer,
      sceneGraph: currentSceneGraph,
    },
    {
      id: "annotations",
      label: "Annotations",
      icon: "📝",
      container: annotationsContainer,
      sceneGraph: currentSceneGraph,
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              backgroundColor: activeTab === tab.id 
                ? theme.colors.primary 
                : "transparent",
              color: activeTab === tab.id 
                ? theme.colors.textInverse 
                : theme.colors.text,
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "400",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "16px" }}>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              style={{
                backgroundColor: activeTab === tab.id 
                  ? theme.colors.textInverse 
                  : theme.colors.textSecondary,
                color: activeTab === tab.id 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "500",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {tab.container.size()}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {activeTabData ? (
          <EntityTableV2
            container={activeTabData.container}
            sceneGraph={activeTabData.sceneGraph}
            maxHeight="100%"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.textMuted,
            }}
          >
            <p>No data available for this tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagerView; 