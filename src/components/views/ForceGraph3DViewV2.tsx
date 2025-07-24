import ForceGraph3D from "3d-force-graph";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RenderingManager } from "../../controllers/RenderingManager";
import { NodeId } from "../../core/model/Node";
import { exportGraphDataForReactFlow } from "../../core/react-flow/exportGraphDataForReactFlow";
import {
  getEdgeLegendConfig,
  getNodeLegendConfig,
} from "../../store/activeLegendConfigStore";
import {
  getCurrentSceneGraph,
  getLegendMode,
} from "../../store/appConfigStore";
import {
  getHoveredEdgeIds,
  getHoveredNodeIds,
  getSelectedNodeId,
  getSelectedNodeIds,
} from "../../store/graphInteractionStore";

// Constants for hover and selection colors
const MOUSE_HOVERED_NODE_COLOR = "rgb(243, 255, 16)";
const SELECTED_NODE_COLOR = "rgb(255, 255, 255)";

/**
 * ForceGraph3DViewV2 - A clean, production-ready 3D force-directed graph component
 * Based on the working solution from our debugging process
 */
const ForceGraph3DViewV2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [sceneGraphVersion, setSceneGraphVersion] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Get current legend configurations for reactivity
  const nodeLegendConfig = getNodeLegendConfig();
  const edgeLegendConfig = getEdgeLegendConfig();
  const legendMode = getLegendMode();

  // Get current interaction states for reactivity
  const hoveredNodeIds = getHoveredNodeIds();
  const hoveredEdgeIds = getHoveredEdgeIds();
  const selectedNodeId = getSelectedNodeId();
  const selectedNodeIds = getSelectedNodeIds();

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

  // Refresh colors when legend configuration changes
  const refreshColors = useCallback(() => {
    if (graphRef.current) {
      const sceneGraph = getCurrentSceneGraph();
      if (!sceneGraph) return;

      // Force refresh of colors by calling the color functions again
      graphRef.current.nodeColor(graphRef.current.nodeColor());
      graphRef.current.linkColor(graphRef.current.linkColor());

      // Force a refresh of the graph
      requestAnimationFrame(() => {
        if (
          graphRef.current &&
          typeof graphRef.current.refresh === "function"
        ) {
          graphRef.current.refresh();
        }
      });
    }
  }, [
    nodeLegendConfig,
    edgeLegendConfig,
    legendMode,
    hoveredNodeIds,
    hoveredEdgeIds,
    selectedNodeId,
    selectedNodeIds,
  ]);

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
      // Get scene graph data
      const { nodes: sceneNodes, edges: sceneEdges } =
        exportGraphDataForReactFlow(sceneGraph);

      if (sceneNodes.length === 0) {
        return;
      }

      // Convert to ForceGraph3D format
      const forceGraphNodes = sceneNodes.map((node) => {
        const sceneNode = sceneGraph.getGraph().getNode(node.id as any);
        const position = sceneNode.getPosition();
        return {
          id: node.id,
          x: position.x || 0,
          y: position.y || 0,
          z: position.z || 0,
        };
      });

      const forceGraphLinks = sceneEdges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        id: edge.id,
      }));

      const graphData = { nodes: forceGraphNodes, links: forceGraphLinks };

      // Ensure container has proper dimensions
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.minHeight = "400px";
        container.style.position = "relative";
      }

      // Create ForceGraph3D instance with proper color handling
      const Graph = new ForceGraph3D(container)
        .graphData(graphData)
        .nodeColor((node) => {
          if (hoveredNodeIds.has(node.id as NodeId)) {
            return MOUSE_HOVERED_NODE_COLOR;
          } else if (
            selectedNodeId === node.id ||
            selectedNodeIds.has(node.id as NodeId)
          ) {
            return SELECTED_NODE_COLOR;
          }
          return RenderingManager.getColor(
            sceneGraph.getGraph().getNode(node.id as NodeId),
            getNodeLegendConfig(),
            getLegendMode()
          );
        })
        .linkColor((link) => {
          if (
            hoveredNodeIds.has((link.source as any).id) ||
            hoveredNodeIds.has((link.target as any).id)
          ) {
            return "yellow";
          }
          if (hoveredEdgeIds.has((link as any).id)) {
            return "white";
          }
          return RenderingManager.getColor(
            sceneGraph.getGraph().getEdge((link as any).id),
            getEdgeLegendConfig(),
            getLegendMode()
          );
        })
        .nodeLabel((node) => (node as any).id)
        .width(rect.width || 800)
        .height(rect.height || 600)
        .backgroundColor("#1a1a1a");

      // Store reference for cleanup and resize handling
      graphRef.current = Graph;

      // Set up immediate resize handling
      const resizeTimeout = setTimeout(() => {
        handleResize();
      }, 100);

      // Zoom to fit after a short delay to ensure everything is rendered
      setTimeout(() => {
        if (typeof Graph.zoomToFit === "function") {
          Graph.zoomToFit(400, 50);
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
    hoveredNodeIds,
    hoveredEdgeIds,
    selectedNodeId,
    selectedNodeIds,
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
