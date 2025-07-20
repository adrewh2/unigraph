import React from "react";

// ForceGraph3D view definitions for app-shell integration
import ForceGraph3DView from "./ForceGraph3DView";
import ForceGraph3DViewSimple from "./ForceGraph3DViewSimple";
import ForceGraphDebugInfo from "../debug/ForceGraphDebugInfo";
import ForceGraphTestSuite from "./ForceGraphTestSuite";

export const forceGraph3DViews = [
  {
    id: "force-graph-3d",
    title: "ForceGraph 3D",
    description: "Full-featured ForceGraph 3D visualization with support for main and tab instances",
    icon: "🌐",
    component: (props: any) => <ForceGraph3DView {...props} />,
    category: "visualization",
  },
  {
    id: "force-graph-3d-simple",
    title: "ForceGraph 3D (Simple)",
    description: "Simplified ForceGraph 3D component for debugging initialization issues",
    icon: "🔍",
    component: (props: any) => <ForceGraph3DViewSimple {...props} />,
    category: "debug",
  },
  {
    id: "force-graph-debug-info",
    title: "ForceGraph Debug Info",
    description: "Shows current status and debug information for ForceGraph 3D system",
    icon: "🐛",
    component: (props: any) => <ForceGraphDebugInfo {...props} />,
    category: "debug",
  },
  {
    id: "force-graph-test-suite",
    title: "ForceGraph Test Suite",
    description: "Combined view with debug info and simple ForceGraph for testing",
    icon: "🧪",
    component: (props: any) => <ForceGraphTestSuite {...props} />,
    category: "debug",
  },
];
