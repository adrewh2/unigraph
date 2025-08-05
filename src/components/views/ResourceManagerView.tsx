import { useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useState } from "react";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import {
  checkWebpagesContent,
  listWebpages,
  Webpage,
} from "../../api/webpagesApi";
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
  const [webpageContentAvailability, setWebpageContentAvailability] = useState<{
    [id: string]: { hasHtml: boolean; hasScreenshot: boolean };
  }>({});

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch webpages (lightweight version without html_content and screenshot_url)
        const webpagesData = await listWebpages({
          userId: user.id,
          includeContent: false,
        });

        // Check content availability for all webpages
        const webpageIds = webpagesData?.map((w: Webpage) => w.id) || [];
        const contentAvailability = await checkWebpagesContent(webpageIds);

        setWebpages(webpagesData || []);
        setWebpageContentAvailability(contentAvailability);

        // Fetch annotations (lightweight version without image_url)
        const annotationsData = await listAnnotations({
          userId: user.id,
          includeContent: false,
        });
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
      const contentAvailable = webpageContentAvailability[webpage.id];

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
          html_content: contentAvailable?.hasHtml
            ? "Available"
            : "Not available",
          screenshot_url: contentAvailable?.hasScreenshot
            ? "Available"
            : "Not available",
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
      console.log("Raw annotation from database:", annotation);
      let annotationData = annotation.data;

      // If data is a string, try to parse it as JSON
      if (typeof annotationData === "string") {
        try {
          annotationData = JSON.parse(annotationData);
          console.log("Parsed annotation data from JSON:", annotationData);
        } catch (e) {
          console.warn(
            "Failed to parse annotation data as JSON:",
            annotationData
          );
        }
      }

      // Extract fields directly from the data object since they're stored at the top level
      const selectedText = (annotationData as any).selected_text || "";
      const imageUrl = (annotationData as any).image_url || "";
      const pageUrl = (annotationData as any).page_url || "";
      const comment = (annotationData as any).comment || "";
      const secondaryComment = (annotationData as any).secondary_comment || "";
      const tags = (annotationData as any).tags || [];

      // Check if heavy content is available (without fetching it)
      const hasImage = !!(annotationData as any).image_url;
      const hasHtml = !!(annotationData as any).html_content;
      const hasScreenshot = !!(annotationData as any).screenshot_url;

      // Determine type based on what fields are present
      let annotationType = "unknown";
      if (selectedText) {
        annotationType = "text_selection";
      } else if (imageUrl) {
        annotationType = "image";
      }

      // Debug logging to see what's in the data
      console.log("Extracted annotation data:", {
        id: annotation.id,
        type: annotationType,
        selected_text: selectedText,
        image_url: imageUrl,
        page_url: pageUrl,
        comment: comment,
        secondary_comment: secondaryComment,
        tags: tags,
      });

      return {
        getId: () => annotation.id,
        getType: () => annotationType,
        getLabel: () => annotation.title,
        getTags: () => new Set(tags),
        getData: () => ({
          id: annotation.id,
          label: annotation.title,
          type: annotationType,
          tags: new Set(tags),
          comment: comment,
          secondary_comment: secondaryComment,
          selected_text: selectedText,
          image_url: hasImage ? "Available" : "",
          page_url: pageUrl,
          html_content: hasHtml ? "Available" : null,
          screenshot_url: hasScreenshot ? "Available" : null,
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
