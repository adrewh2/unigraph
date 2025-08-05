import { useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useState } from "react";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import { listWebpages, Webpage } from "../../api/webpagesApi";
import { Graph } from "../../core/model/Graph";
import { SceneGraph } from "../../core/model/SceneGraph";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { useAuth } from "../../hooks/useAuth";
import useAppConfigStore from "../../store/appConfigStore";
import EntityTableV2 from "../common/EntityTableV2";

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("nodes");
  const [webpages, setWebpages] = useState<Webpage[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch webpages
        const webpagesData = await listWebpages({ userId: user.id });
        setWebpages(webpagesData || []);

        // Fetch annotations
        const annotationsData = await listAnnotations({ userId: user.id });
        setAnnotations(annotationsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

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

  // Create containers for Supabase data
  const webResourcesContainer = new EntitiesContainer(
    webpages.map((webpage) => {
      // Create a mock entity for webpages that implements the required interface
      return {
        getId: () => webpage.id,
        getType: () => "webpage",
        getLabel: () => webpage.title || webpage.url,
        getTags: () => new Set(),
        getData: () => ({
          id: webpage.id,
          label: webpage.title || webpage.url,
          type: "webpage",
          url: webpage.url,
          title: webpage.title,
          html_content: webpage.html_content,
          screenshot_url: webpage.screenshot_url,
          metadata: webpage.metadata,
          created_at: webpage.created_at,
          last_updated_at: webpage.last_updated_at,
          userData: webpage,
        }),
        getEntityType: () => "node",
        getFullyQualifiedId: () => webpage.id,
        setId: () => {},
        setData: () => {},
        setType: () => {},
        setLabel: () => {},
        setTags: () => {},
        addTag: () => {},
        removeTag: () => {},
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
  );

  const annotationsContainer = new EntitiesContainer(
    annotations.map((annotation) => {
      // Create a mock entity for annotations that implements the required interface
      const annotationData = annotation.data;

      return {
        getId: () => annotation.id,
        getType: () => annotationData.type,
        getLabel: () => annotation.title,
        getTags: () => new Set(annotationData.tags || []),
        getData: () => ({
          id: annotation.id,
          label: annotation.title,
          type: annotationData.type,
          tags: new Set(annotationData.tags || []),
          comment: annotationData.comment,
          secondary_comment: annotationData.secondary_comment,
          selected_text:
            annotationData.type === "text_selection"
              ? (annotationData as any).selected_text
              : undefined,
          image_url:
            annotationData.type === "image"
              ? (annotationData as any).image_url
              : undefined,
          page_url: annotationData.page_url,
          parent_resource_type: annotation.parent_resource_type,
          parent_resource_id: annotation.parent_resource_id,
          created_at: annotation.created_at,
          last_updated_at: annotation.last_updated_at,
          userData: annotation,
        }),
        getEntityType: () => "node",
        getFullyQualifiedId: () => annotation.id,
        setId: () => {},
        setData: () => {},
        setType: () => {},
        setLabel: () => {},
        setTags: () => {},
        addTag: () => {},
        removeTag: () => {},
        hasTag: () => false,
        toJSON: () => "",
        fromJSON: () => {},
      } as any;
    })
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

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  if (loading) {
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
        <p>Loading resources...</p>
      </div>
    );
  }

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
              backgroundColor:
                activeTab === tab.id ? theme.colors.primary : "transparent",
              color:
                activeTab === tab.id
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
                e.currentTarget.style.backgroundColor =
                  theme.colors.surfaceHover;
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
                backgroundColor:
                  activeTab === tab.id
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary,
                color:
                  activeTab === tab.id
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
            entityType={activeTabData.id}
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
