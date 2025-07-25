import { Settings2, Square } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { useAppContext } from "../../context/AppContext";
import { ForceGraphManager } from "../../core/force-graph/ForceGraphManager";
import { getCurrentSceneGraph } from "../../store/appConfigStore";
import { IForceGraphRenderConfig } from "../../store/forceGraphConfigStore";
import useGraphInteractionStore from "../../store/graphInteractionStore";
import { useMouseControlsStore } from "../../store/mouseControlsStore";
import { initializeForceGraphInstance } from "../../utils/forceGraphInitializer";
import SelectionBox from "../common/SelectionBox";
import ForceGraphRenderConfigEditor from "./ForceGraph3d/ForceGraphRenderConfigEditor";
// Custom shader for bloom compositing
const BloomCompositorShader = {
  uniforms: {
    tDiffuse: { value: null },
    tBloom: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBloom;
    varying vec2 vUv;
    void main() {
      vec4 diffuse = texture2D(tDiffuse, vUv);
      vec4 bloom = texture2D(tBloom, vUv);
      gl_FragColor = diffuse + bloom;
    }
  `,
};

// Bloom effect configuration
const BLOOM_LAYER = 1;
const BLOOM_PARAMS = {
  strength: 1.5,
  radius: 0.4,
  threshold: 0.85,
};

/**
 * ForceGraph3DViewV2WithBloom - Enhanced 3D force-directed graph component
 * with selective bloom post-processing effects for selected nodes
 */
const ForceGraph3DViewV2WithBloom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [sceneGraphVersion, setSceneGraphVersion] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [showDisplayConfig, setShowDisplayConfig] = useState(false);
  const displayConfigEditorRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Bloom effect refs
  const bloomComposerRef = useRef<EffectComposer | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});
  const originalRenderRef = useRef<any>(null);

  // Get reactive selection state from the store
  const { selectedNodeIds, hoveredNodeIds, hoveredEdgeIds } =
    useGraphInteractionStore();

  // Get mouse controls state
  const { controlMode, toggleControlMode } = useMouseControlsStore();

  // Get event handlers from AppContext
  const {
    handleNodesRightClick,
    handleBackgroundRightClick,
    handleNodeClick,
    handleBackgroundClick,
  } = useAppContext();

  // Initialize bloom effect system
  const initializeBloomEffect = useCallback((graphInstance: any) => {
    console.log("Initializing bloom effect system...");

    if (!graphInstance || !graphInstance.renderer) {
      console.warn("Graph instance or renderer not available for bloom effect");
      return;
    }

    const renderer = graphInstance.renderer;
    const scene = graphInstance.scene();
    const camera = graphInstance.camera();

    console.log("Bloom effect components:", { renderer, scene, camera });

    // Create bloom composer
    bloomComposerRef.current = new EffectComposer(renderer);
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM_PARAMS.strength,
      BLOOM_PARAMS.radius,
      BLOOM_PARAMS.threshold
    );
    bloomComposerRef.current.addPass(renderScene);
    bloomComposerRef.current.addPass(bloomPass);

    // Store original render method
    originalRenderRef.current = graphInstance.render;

    // Override the render method to use our custom rendering
    graphInstance.render = () => {
      // First render the normal scene
      renderer.render(scene, camera);

      // Then render the bloom effect on top
      bloomComposerRef.current?.render();
    };

    console.log("Bloom effect system initialized successfully");
  }, []);

  // Update bloom effect for selected nodes
  const updateBloomEffect = useCallback(() => {
    if (!graphRef.current || !graphRef.current.scene) return;

    const scene = graphRef.current.scene();

    console.log(
      "Updating bloom effect for selected nodes:",
      selectedNodeIds.size
    );

    // Clear all bloom layers and restore original materials
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.layers.disable(BLOOM_LAYER);
        // Restore original material if we have it stored
        if (materialsRef.current[obj.uuid]) {
          obj.material = materialsRef.current[obj.uuid];
          delete materialsRef.current[obj.uuid];
        }
      }
    });

    // Enable bloom for selected nodes
    selectedNodeIds.forEach((nodeId) => {
      const nodeObj = graphRef.current.getNodeObjById(nodeId);
      if (nodeObj && nodeObj.__threeObj) {
        console.log("Enabling bloom for node:", nodeId);
        nodeObj.__threeObj.layers.enable(BLOOM_LAYER);

        // Store original material and create glow material
        if (nodeObj.__threeObj.material) {
          const originalMaterial = nodeObj.__threeObj.material;
          materialsRef.current[nodeObj.__threeObj.uuid] = originalMaterial;

          const glowMaterial = originalMaterial.clone();
          glowMaterial.emissive = new THREE.Color(0xffff00);
          glowMaterial.emissiveIntensity = 0.5;
          nodeObj.__threeObj.material = glowMaterial;
        }
      } else {
        console.warn("Could not find node object for:", nodeId);
      }
    });

    // Force a render update
    if (graphRef.current.render) {
      graphRef.current.render();
    }
  }, [selectedNodeIds]);

  // Handle resize events
  const handleResize = useCallback(() => {
    if (graphRef.current && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        graphRef.current.width(rect.width).height(rect.height);

        // Update bloom effect composer
        if (bloomComposerRef.current) {
          bloomComposerRef.current.setSize(rect.width, rect.height);
        }
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

      // Update bloom effect
      updateBloomEffect();

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
  }, [updateBloomEffect]);

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

  // Detect dark mode
  useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(match.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener("change", handler);
    return () => match.removeEventListener("change", handler);
  }, []);

  // Click outside to close config panel
  useEffect(() => {
    if (!showDisplayConfig) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        displayConfigEditorRef.current &&
        !displayConfigEditorRef.current.contains(event.target as Node)
      ) {
        setShowDisplayConfig(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDisplayConfig]);

  // Handle config apply
  const handleApplyForceGraphConfig = useCallback(
    (config: IForceGraphRenderConfig) => {
      const sceneGraph = getCurrentSceneGraph();
      if (sceneGraph) {
        sceneGraph.setForceGraphRenderConfig(config);
        if (graphRef.current) {
          ForceGraphManager.applyForceGraphRenderConfig(
            graphRef.current,
            config,
            sceneGraph
          );
        }
      }
    },
    []
  );

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
        // Restore original render method
        if (originalRenderRef.current) {
          graphRef.current.render = originalRenderRef.current;
        }
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
              transition: "all 0.2s ease",
              backdropFilter: "blur(10px)",
            }}
            title="Display Configuration"
          >
            <Settings2 size={20} />
          </button>
        ) : (
          <div
            ref={displayConfigEditorRef}
            style={{
              width: 320,
              maxWidth: "calc(100vw - 40px)",
              maxHeight: "calc(100vh - 40px)",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
              border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDarkMode ? "#e2e8f0" : "#1f2937",
                }}
              >
                Display Configuration
              </h3>
              <button
                onClick={() => setShowDisplayConfig(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  cursor: "pointer",
                  padding: 4,
                  borderRadius: 4,
                  fontSize: 16,
                  lineHeight: 1,
                  transition: "color 0.2s ease",
                }}
                title="Close"
              >
                ×
              </button>
            </div>
            <div
              style={{
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
                padding: 16,
              }}
            >
              <ForceGraphRenderConfigEditor
                onApply={handleApplyForceGraphConfig}
                isDarkMode={isDarkMode}
                initialConfig={
                  getCurrentSceneGraph()?.getForceGraphRenderConfig() || {
                    nodeTextLabels: false,
                    linkWidth: 2,
                    nodeSize: 6,
                    linkTextLabels: true,
                    nodeOpacity: 1,
                    linkOpacity: 1,
                    chargeStrength: -30,
                    backgroundColor: "#1a1a1a",
                    fontSize: 12,
                  }
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Area Selection Toggle Button */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 999999999,
        }}
      >
        <button
          onClick={toggleControlMode}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
            color:
              controlMode === "multiselection"
                ? "#3b82f6"
                : isDarkMode
                  ? "#e2e8f0"
                  : "#1f2937",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)",
          }}
          title={
            controlMode === "orbital"
              ? "Switch to Area Selection"
              : "Switch to Orbital Mode"
          }
        >
          <Square size={20} />
        </button>
      </div>

      {/* Selection Box */}
      {controlMode === "multiselection" && <SelectionBox />}
    </div>
  );
};

export default ForceGraph3DViewV2WithBloom;
