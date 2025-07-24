import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { ForceGraphManager } from "../../core/force-graph/ForceGraphManager";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import useGraphInteractionStore from "../../store/graphInteractionStore";
import { initializeForceGraphInstance } from "../../utils/forceGraphInitializer";

/**
 * ForceGraph3DViewV2 - A clean, production-ready 3D force-directed graph component
 * Uses existing utilities to avoid code duplication
 */
const ForceGraph3DViewV2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [sceneGraphVersion, setSceneGraphVersion] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Get reactive selection state from the store
  const { selectedNodeIds, hoveredNodeIds, hoveredEdgeIds } =
    useGraphInteractionStore();

  // Get event handlers from AppContext
  const {
    handleNodesRightClick,
    handleBackgroundRightClick,
    handleNodeClick,
    handleBackgroundClick,
  } = useAppContext();

  // Handle resize events
  const handleResize = useCallback(() => {
    if (graphRef.current && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        graphRef.current.width(rect.width).height(rect.height);
      }
    }
  }, []);

  // Efficient color-only refresh that doesn't reset camera position
  const refreshColors = useCallback(() => {
    if (graphRef.current) {
      // Force complete refresh of all node and link appearances without resetting camera
      graphRef.current.nodeColor(graphRef.current.nodeColor());
      graphRef.current.linkColor(graphRef.current.linkColor());
      graphRef.current.linkWidth(graphRef.current.linkWidth());

      // Add explicit refresh to ensure immediate visual update
      requestAnimationFrame(() => {
        if (
          graphRef.current &&
          typeof graphRef.current.refresh === "function"
        ) {
          graphRef.current.refresh();
        }
      });
    }
  }, []); // No dependencies needed - color functions access global store directly

  // React to selection state changes from other views
  useEffect(() => {
    if (graphRef.current) {
      refreshColors();
    }
  }, [selectedNodeIds, hoveredNodeIds, hoveredEdgeIds, refreshColors]);

  // Watch for scene graph changes
  useEffect(() => {
    let lastSceneGraphId: string | null = null;

    const checkSceneGraph = () => {
      const sceneGraph = getCurrentSceneGraph();
      if (sceneGraph) {
        const currentId = sceneGraph.getMetadata().name || "unknown";
        if (lastSceneGraphId !== currentId) {
          lastSceneGraphId = currentId;
          setSceneGraphVersion((prev) => prev + 1);
        }
      }
    };

    // Check immediately
    checkSceneGraph();

    // Set up an interval to check for changes
    const interval = setInterval(checkSceneGraph, 2000);

    return () => clearInterval(interval);
  }, []);

  // Set up resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(containerRef.current);
    resizeObserverRef.current = resizeObserver;

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [handleResize]);

  // Refresh colors when legend configuration changes
  useEffect(() => {
    refreshColors();
  }, [refreshColors]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const sceneGraph = getCurrentSceneGraph();
    if (!sceneGraph) {
      return;
    }

    try {
      // Use initializeForceGraphInstance to create the graph
      const forceGraphInstance = initializeForceGraphInstance({
        container: containerRef.current,
        sceneGraph,
        layout: "Physics",
        onNodesRightClick: handleNodesRightClick,
        onBackgroundRightClick: handleBackgroundRightClick,
        setAsMainInstance: false,
      });
      ForceGraphManager.refreshForceGraphInstance(
        forceGraphInstance,
        sceneGraph
      );

      // Store reference for cleanup and resize handling
      graphRef.current = forceGraphInstance;

      // Set up immediate resize handling
      const resizeTimeout = setTimeout(() => {
        handleResize();
      }, 100);

      // Zoom to fit after a short delay to ensure everything is rendered
      setTimeout(() => {
        if (typeof forceGraphInstance.zoomToFit === "function") {
          forceGraphInstance.zoomToFit(400, 50);
        }
        // Ensure proper sizing after zoom
        handleResize();
      }, 200);

      return () => {
        clearTimeout(resizeTimeout);
      };
    } catch (error) {
      console.error("Error initializing ForceGraph3D:", error);
    }

    // Cleanup
    return () => {
      if (graphRef.current) {
        graphRef.current._destructor();
      }
    };
  }, [
    sceneGraphVersion,
    handleResize,
    handleNodeClick,
    handleNodesRightClick,
    handleBackgroundClick,
    handleBackgroundRightClick,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        position: "relative",
      }}
    />
  );
};

export default ForceGraph3DViewV2;
