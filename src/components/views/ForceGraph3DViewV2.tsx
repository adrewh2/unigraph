import ForceGraph3D from "3d-force-graph";
import React, { useEffect, useRef, useState } from "react";
import { exportGraphDataForReactFlow } from "../../core/react-flow/exportGraphDataForReactFlow";
import { getCurrentSceneGraph } from "../../store/appConfigStore";

/**
 * ForceGraph3DViewV2 - A clean, production-ready 3D force-directed graph component
 * Based on the working solution from our debugging process
 */
const ForceGraph3DViewV2: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [sceneGraphVersion, setSceneGraphVersion] = useState(0);

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

      // Create ForceGraph3D instance
      const Graph = new ForceGraph3D(container)
        .graphData(graphData)
        .nodeColor(() => "#ff6b6b")
        .linkColor(() => "#4ecdc4")
        .nodeLabel((node) => (node as any).id)
        .width(rect.width || 800)
        .height(rect.height || 600)
        .backgroundColor("#1a1a1a");

      // Store reference for cleanup
      graphRef.current = Graph;

      // Zoom to fit after a short delay to ensure everything is rendered
      setTimeout(() => {
        if (typeof Graph.zoomToFit === "function") {
          Graph.zoomToFit(400, 50);
        }
      }, 200);
    } catch (error) {
      console.error("Error initializing ForceGraph3D:", error);
    }

    // Cleanup
    return () => {
      if (graphRef.current) {
        graphRef.current._destructor();
      }
    };
  }, [sceneGraphVersion]);

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
