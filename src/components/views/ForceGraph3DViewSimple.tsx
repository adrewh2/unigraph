import ForceGraph3D from "3d-force-graph";
import React, { useEffect, useRef, useState } from "react";
import { exportGraphDataForReactFlow } from "../../core/react-flow/exportGraphDataForReactFlow";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import { getForceGraphInitializationStatus } from "../../utils/forceGraphInitializer";

/**
 * Simplified ForceGraph3DView for debugging initialization issues
 */
const ForceGraph3DViewSimple: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [status, setStatus] = useState("Starting...");
  const [logs, setLogs] = useState<string[]>([]);
  const [sceneGraphVersion, setSceneGraphVersion] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substr(11, 12);
    const logEntry = `${timestamp}: ${message}`;
    console.log(`[ForceGraph3DViewSimple] ${logEntry}`);
    setLogs((prev) => [...prev, logEntry]);
  };

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
    const interval = setInterval(checkSceneGraph, 2000); // Check every 2 seconds instead of 1

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    addLog("Component mounted");

    if (!containerRef.current) {
      addLog("No container ref available");
      return;
    }

    addLog("Container ref available, checking system status...");

    const initStatus = getForceGraphInitializationStatus();
    addLog(`System status: ${JSON.stringify(initStatus)}`);

    if (!initStatus.hasSceneGraph) {
      setStatus("Error: No scene graph available");
      addLog("No scene graph - cannot proceed");
      return;
    }

    setStatus("Attempting to initialize...");
    addLog("Starting initialization...");

    try {
      const sceneGraph = getCurrentSceneGraph();
      addLog(`Got scene graph: ${sceneGraph.getMetadata().name}`);

      // Debug: Check scene graph data
      const sceneGraphNodes = sceneGraph.getNodes();
      const sceneGraphEdges = sceneGraph.getGraph().getEdges();
      addLog(
        `Scene graph has ${sceneGraphNodes.size()} nodes and ${sceneGraphEdges.size()} edges`
      );

      if (sceneGraphNodes.size() === 0) {
        addLog("ERROR: Scene graph has no nodes!");
        setStatus("Error: Scene graph has no nodes");
        return;
      }

      // Check if nodes are visible
      const visibleNodes = sceneGraphNodes.filter((node) => node.isVisible());
      addLog(`Scene graph has ${visibleNodes.size()} visible nodes`);

      if (visibleNodes.size() === 0) {
        addLog("WARNING: No visible nodes in scene graph!");
      }

      // Ensure container has proper dimensions before initialization
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      addLog(`Container dimensions before init: ${rect.width}x${rect.height}`);

      // If container has no dimensions, set explicit ones
      if (rect.width === 0 || rect.height === 0) {
        addLog("Container has no dimensions, setting explicit size...");
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.minHeight = "400px";
        container.style.position = "relative";
      }

      // Create test data first to verify ForceGraph3D works
      addLog("Creating ForceGraph3D instance with scene graph data...");

      // Get actual scene graph data
      let graphData;
      try {
        // Export data from scene graph
        const { nodes: sceneNodes, edges: sceneEdges } =
          exportGraphDataForReactFlow(sceneGraph);
        addLog(
          `Exported ${sceneNodes.length} nodes and ${sceneEdges.length} edges from scene graph`
        );

        if (sceneNodes.length > 0) {
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
          graphData = { nodes: forceGraphNodes, links: forceGraphLinks };
          addLog("Using actual scene graph data");
        } else {
          // Fall back to test data if no scene graph data
          graphData = {
            nodes: [
              { id: "test1", x: 0, y: 0, z: 0 },
              { id: "test2", x: 100, y: 100, z: 0 },
              { id: "test3", x: -100, y: -100, z: 0 },
            ],
            links: [
              { source: "test1", target: "test2" },
              { source: "test2", target: "test3" },
              { source: "test3", target: "test1" },
            ],
          };
          addLog("Using test data (no scene graph data available)");
        }
      } catch (e) {
        addLog(`Error exporting scene graph data: ${e}`);
        // Fall back to test data
        graphData = {
          nodes: [
            { id: "test1", x: 0, y: 0, z: 0 },
            { id: "test2", x: 100, y: 100, z: 0 },
            { id: "test3", x: -100, y: -100, z: 0 },
          ],
          links: [
            { source: "test1", target: "test2" },
            { source: "test2", target: "test3" },
            { source: "test3", target: "test1" },
          ],
        };
        addLog("Using test data due to export error");
      }

      // Create ForceGraph3D instance directly (like UnifiedForceGraph example)
      const Graph = new ForceGraph3D(container)
        .graphData(graphData)
        .nodeColor(() => "#ff6b6b")
        .linkColor(() => "#4ecdc4")
        .nodeLabel((node) => (node as any).id)
        .width(rect.width || 800)
        .height(rect.height || 600)
        .backgroundColor("#1a1a1a");

      addLog("ForceGraph3D instance created successfully");
      setStatus("Success: ForceGraph3D initialized with test data");

      // Debug: Check if graph data was set correctly
      const graphDataAfter = Graph.graphData();
      addLog(
        `Graph data after setting: ${graphDataAfter.nodes.length} nodes, ${graphDataAfter.links.length} links`
      );
      addLog(`Sample node: ${JSON.stringify(graphDataAfter.nodes[0])}`);
      addLog(`Sample link: ${JSON.stringify(graphDataAfter.links[0])}`);

      // Check if the graph is actually rendering
      setTimeout(() => {
        addLog("Checking graph rendering status...");
        const nodes = Graph.graphData().nodes;
        addLog(
          `Nodes positions: ${nodes.map((n) => `(${n.x}, ${n.y}, ${n.z})`).join(", ")}`
        );

        // Try to force a render
        if (typeof (Graph as any).render === "function") {
          (Graph as any).render();
          addLog("Forced render called");
        }

        // Check if there's a scene
        if (Graph.scene) {
          const scene = Graph.scene();
          addLog(`Scene has ${scene.children.length} children`);
          addLog(
            `Scene children: ${scene.children.map((child) => child.type).join(", ")}`
          );
        }

        // Try to zoom to fit to make sure nodes are visible
        if (typeof Graph.zoomToFit === "function") {
          Graph.zoomToFit(400, 50);
          addLog("Zoomed to fit called");
        }

        // Check camera position
        if (Graph.camera) {
          const camera = Graph.camera();
          addLog(
            `Camera position: (${camera.position.x}, ${camera.position.y}, ${camera.position.z})`
          );
        }

        // Check controls target
        if (Graph.controls) {
          const controls = Graph.controls();
          if (controls && (controls as any).target) {
            const target = (controls as any).target;
            addLog(`Controls target: (${target.x}, ${target.y}, ${target.z})`);
          }
        }
      }, 200);

      // Store reference for cleanup
      graphRef.current = Graph;

      // Debug: Check what the container looks like after initialization
      setTimeout(() => {
        if (containerRef.current) {
          const containerChildren = containerRef.current.children.length;
          const containerHTML = containerRef.current.innerHTML.substring(
            0,
            200
          );
          const rect = containerRef.current.getBoundingClientRect();
          addLog(`Container after init: ${containerChildren} children`);
          addLog(`Container HTML: ${containerHTML}...`);
          addLog(`Container size: ${rect.width}x${rect.height}`);

          // Check if there's a canvas element
          const canvas = containerRef.current.querySelector("canvas");
          addLog(`Canvas found: ${!!canvas}`);
          if (canvas) {
            addLog(`Canvas size: ${canvas.width}x${canvas.height}`);
            addLog(`Canvas style: ${canvas.style.cssText}`);

            // Check WebGL context
            try {
              const gl = (canvas.getContext("webgl") ||
                canvas.getContext(
                  "experimental-webgl"
                )) as WebGLRenderingContext | null;
              addLog(`WebGL context available: ${!!gl}`);
              if (gl) {
                addLog(`WebGL vendor: ${gl.getParameter(gl.VENDOR)}`);
                addLog(`WebGL renderer: ${gl.getParameter(gl.RENDERER)}`);
              }
            } catch (e) {
              addLog(`WebGL context error: ${e}`);
            }
          }

          // Check for Three.js renderer
          const threeRenderer = containerRef.current.querySelector(
            'canvas[data-engine="three.js"]'
          );
          addLog(`Three.js renderer found: ${!!threeRenderer}`);

          // Check for any WebGL errors
          const webglErrors = containerRef.current.querySelectorAll("canvas");
          addLog(`Total canvas elements: ${webglErrors.length}`);

          // Check CSS visibility
          if (canvas) {
            const computedStyle = window.getComputedStyle(canvas);
            addLog(`Canvas visibility: ${computedStyle.visibility}`);
            addLog(`Canvas display: ${computedStyle.display}`);
            addLog(`Canvas opacity: ${computedStyle.opacity}`);
            addLog(`Canvas position: ${computedStyle.position}`);
            addLog(`Canvas z-index: ${computedStyle.zIndex}`);
          }
        }
      }, 100);
    } catch (error) {
      addLog(`ERROR: ${error}`);
      addLog(
        `ERROR STACK: ${error instanceof Error ? error.stack : "No stack"}`
      );
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Cleanup
    return () => {
      if (graphRef.current) {
        addLog("Cleaning up ForceGraph3D instance");
        graphRef.current._destructor();
      }
    };
  }, [sceneGraphVersion]); // Add sceneGraphVersion as dependency to re-initialize when it changes

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Status */}
      <div
        style={{
          padding: "10px",
          backgroundColor: status.includes("Error")
            ? "#ffebee"
            : status.includes("Success")
              ? "#e8f5e8"
              : "#fff3e0",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        Status: {status}
      </div>

      {/* Logs */}
      <div
        style={{
          height: "200px",
          overflow: "auto",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          fontFamily: "monospace",
          fontSize: "12px",
          borderBottom: "1px solid #ddd",
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Logs:</div>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* Container for ForceGraph3D */}
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: "400px",
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#000",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {status === "Starting..." || status === "Attempting to initialize..."
            ? "Initializing..."
            : status.includes("Success")
              ? "ForceGraph3D should be rendered here"
              : status}
        </div>
      </div>
    </div>
  );
};

export default ForceGraph3DViewSimple;
