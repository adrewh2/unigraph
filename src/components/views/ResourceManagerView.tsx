import { useTheme } from "@aesgraph/app-shell";
import React, { useCallback, useEffect, useState } from "react";
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

  // Cache for storing fetched data
  const [dataCache, setDataCache] = useState<{
    webpages: Webpage[] | null;
    annotations: Annotation[] | null;
    webpageContentAvailability: {
      [id: string]: { hasHtml: boolean; hasScreenshot: boolean };
    } | null;
    lastFetched: number | null;
  }>({
    webpages: null,
    annotations: null,
    webpageContentAvailability: null,
    lastFetched: null,
  });

  // Fetch data from Supabase
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return;

      const now = Date.now();
      const cacheAge = dataCache.lastFetched
        ? now - dataCache.lastFetched
        : Infinity;
      const cacheValid = cacheAge < 30000; // 30 seconds cache validity

      // Use cached data if available and not expired
      if (
        !forceRefresh &&
        dataCache.webpages &&
        dataCache.annotations &&
        dataCache.webpageContentAvailability &&
        cacheValid
      ) {
        console.log("Using cached data, age:", cacheAge, "ms");
        setWebpages(dataCache.webpages);
        setAnnotations(dataCache.annotations);
        setWebpageContentAvailability(dataCache.webpageContentAvailability);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching fresh data from server");

        // Fetch webpages (lightweight version without html_content and screenshot_url)
        const webpagesData = await listWebpages({
          userId: user.id,
          includeContent: false,
        });

        // Check content availability for all webpages
        const webpageIds = webpagesData?.map((w: Webpage) => w.id) || [];
        const contentAvailability = await checkWebpagesContent(webpageIds);

        // Fetch annotations (lightweight version without image_url)
        const annotationsData = await listAnnotations({
          userId: user.id,
          includeContent: false,
        });

        // Update state
        setWebpages(webpagesData || []);
        setAnnotations(annotationsData || []);
        setWebpageContentAvailability(contentAvailability);

        // Update cache
        setDataCache({
          webpages: webpagesData || [],
          annotations: annotationsData || [],
          webpageContentAvailability: contentAvailability,
          lastFetched: now,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, dataCache]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to force refresh data
  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

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

      // Extract tags from metadata
      let tags: string[] = [];
      console.log("Webpage metadata:", webpage.metadata);
      console.log("Webpage metadata type:", typeof webpage.metadata);

      let metadataObj = webpage.metadata;

      // If metadata is a string, try to parse it as JSON
      if (typeof metadataObj === "string") {
        console.log("Metadata is a string, attempting to parse JSON");
        try {
          metadataObj = JSON.parse(metadataObj);
          console.log("Successfully parsed metadata from JSON:", metadataObj);
        } catch (e) {
          console.warn("Failed to parse metadata as JSON:", metadataObj);
          console.warn("Parse error:", e);
        }
      } else {
        console.log("Metadata is not a string, type:", typeof metadataObj);
      }

      if (metadataObj && typeof metadataObj === "object") {
        console.log("Metadata object keys:", Object.keys(metadataObj));
        console.log("Full metadata object:", metadataObj);

        // Try to extract tags from metadata.tags or metadata.tag or metadata.keywords
        const tagsFromTags = (metadataObj as any).tags;
        const tagsFromTag = (metadataObj as any).tag;
        const tagsFromKeywords = (metadataObj as any).keywords;

        console.log("tags from .tags:", tagsFromTags);
        console.log("tags from .tag:", tagsFromTag);
        console.log("tags from .keywords:", tagsFromKeywords);

        tags = tagsFromTags || tagsFromTag || tagsFromKeywords || [];

        console.log("Final extracted tags:", tags);
        console.log("Tags type:", typeof tags);
        console.log("Is tags array:", Array.isArray(tags));

        // Ensure tags is an array
        if (!Array.isArray(tags)) {
          console.log("Tags is not an array, converting to empty array");
          tags = [];
        }
      }

      return {
        getId: () => webpage.id,
        getType: () => "webpage",
        getLabel: () => webpage.title || webpage.url,
        getTags: () => new Set(tags),
        getData: () => {
          const data = {
            id: webpage.id,
            label: webpage.title || webpage.url,
            type: "webpage",
            tags: tags,
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
          };
          return data;
        },
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
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", flex: 1 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor:
                  activeTab === tab.id ? theme.colors.primary : "transparent",
                color:
                  activeTab === tab.id
                    ? theme.colors.textInverse
                    : theme.colors.text,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${theme.colors.primary}`
                    : "2px solid transparent",
                minWidth: "80px",
                justifyContent: "center",
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
                  borderRadius: "10px",
                  padding: "1px 6px",
                  fontSize: "11px",
                  fontWeight: "500",
                  minWidth: "16px",
                  textAlign: "center",
                }}
              >
                {tab.container.size()}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshData}
          style={{
            padding: "6px 10px",
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.surface;
          }}
          title="Refresh data from server"
        >
          <span style={{ fontSize: "12px" }}>🔄</span>
          <span>Refresh</span>
        </button>
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
