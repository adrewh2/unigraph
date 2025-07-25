import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ForceGraphManager } from "../../core/force-graph/ForceGraphManager";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import useGraphInteractionStore from "../../store/graphInteractionStore";
import { useMouseControlsStore } from "../../store/mouseControlsStore";
import { initializeForceGraphInstance } from "../../utils/forceGraphInitializer";
import SelectionBox from "../common/SelectionBox";
import ForceGraphRenderConfigEditor from "./ForceGraph3d/ForceGraphRenderConfigEditor";

// Bloom effect configuration
const BLOOM_PARAMS = {
  strength: 4,
  radius: 1,
  threshold: 0,
};

const ForceGraph3DViewV2WithBloom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [showDisplayConfig, setShowDisplayConfig] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { selectedNodeIds, hoveredNodeIds } = useGraphInteractionStore();
  const { controlMode } = useMouseControlsStore();

  const sceneGraph = getCurrentSceneGraph();
  const sceneGraphVersion = sceneGraph?.getMetadata()?.name || "unknown";

  // Bloom effect refs
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  // Initialize bloom effect using the built-in postProcessingComposer
  const initializeBloomEffect = useCallback((graphInstance: any) => {
    console.log("Initializing bloom effect with postProcessingComposer");

    try {
      // Get the built-in post-processing composer
      const composer = graphInstance.postProcessingComposer();
      if (!composer) {
        console.warn("No postProcessingComposer available");
        return;
      }

      // Create bloom pass
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        BLOOM_PARAMS.strength,
        BLOOM_PARAMS.radius,
        BLOOM_PARAMS.threshold
      );

      // Add bloom pass to composer
      composer.addPass(bloomPass);

      // Store reference
      bloomPassRef.current = bloomPass;

      console.log("Bloom effect initialized successfully");
    } catch (error) {
      console.error("Error initializing bloom effect:", error);
    }
  }, []);

  // Update bloom effect for selected nodes
  const updateBloomEffect = useCallback(() => {
    if (!graphRef.current) return;

    console.log(
      "Updating bloom effect for selected nodes:",
      selectedNodeIds.size
    );

    // Get all nodes from the graph
    const allNodes = graphRef.current.graphData().nodes;

    // Set node IDs on the meshes for identification
    allNodes.forEach((node: any) => {
      if (node.__threeObj && node.__threeObj.isMesh) {
        node.__threeObj.userData.id = node.id;
        node.__threeObj.name = node.id;
      }
    });

    // Get the scene to traverse meshes
    const scene = graphRef.current.scene();
    if (!scene) return;

    // Clear previous bloom effects
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        // Clear bloom flag
        obj.userData.isBloomObject = false;
      }
    });

    // Apply bloom effect to selected nodes
    selectedNodeIds.forEach((nodeId) => {
      console.log("Looking for node:", nodeId);

      // Find the mesh by traversing the scene
      let found = false;
      scene.traverse((obj: any) => {
        if (obj.isMesh && obj.userData.id === nodeId) {
          found = true;
          console.log("Found mesh for node:", nodeId);

          // Mark as bloom object
          obj.userData.isBloomObject = true;

          // Make the node very bright to trigger bloom
          if (obj.material) {
            obj.material.emissive = new THREE.Color(0xffff00);
            obj.material.emissiveIntensity = 2.0; // Very bright
            obj.material.color = new THREE.Color(0xffff00); // Bright yellow
          }
        }
      });

      if (!found) {
        console.warn("Could not find mesh for node:", nodeId);
      }
    });

    // Force a render update
    if (graphRef.current.render) {
      graphRef.current.render();
    }
  }, [selectedNodeIds]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (graphRef.current && containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      graphRef.current.width(width);
      graphRef.current.height(height);
    }
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    console.log("Node clicked:", node.id);
    // The selection is handled by the global store
  }, []);

  // Handle node right click
  const handleNodesRightClick = useCallback((node: any) => {
    console.log("Node right clicked:", node.id);
  }, []);

  // Handle background click
  const handleBackgroundClick = useCallback(() => {
    console.log("Background clicked");
  }, []);

  // Handle background right click
  const handleBackgroundRightClick = useCallback(() => {
    console.log("Background right clicked");
  }, []);

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current || !sceneGraph) return;

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

      // Initialize bloom effect after graph is ready
      setTimeout(() => {
        initializeBloomEffect(forceGraphInstance);
      }, 500);

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
    initializeBloomEffect,
  ]);

  // Update bloom effect when selection changes
  useEffect(() => {
    updateBloomEffect();
  }, [selectedNodeIds, updateBloomEffect]);

  // Update orbital controls when control mode changes
  useEffect(() => {
    if (graphRef.current) {
      ForceGraphManager.updateMouseControlMode(graphRef.current, controlMode);
    }
  }, [controlMode]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {/* Display Config Button/Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 999999999,
        }}
      >
        {!showDisplayConfig ? (
          <button
            onClick={() => setShowDisplayConfig(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
              color: isDarkMode ? "#e2e8f0" : "#1f2937",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            ⚙️
          </button>
        ) : (
          <ForceGraphRenderConfigEditor />
        )}
      </div>

      {/* Selection Box */}
      <SelectionBox />
    </div>
  );
};

export default ForceGraph3DViewV2WithBloom;
