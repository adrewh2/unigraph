import React, { useEffect, useState } from "react";
import { getCurrentSceneGraph, getForceGraphInstance } from "../../store/appConfigStore";
import ForceGraph3DView from "./ForceGraph3DView";

/**
 * Debug wrapper for ForceGraph3DView to help diagnose initialization issues
 */
const ForceGraph3DViewDebug: React.FC<{ useMainInstance?: boolean }> = ({ 
  useMainInstance = false 
}) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showForceGraph, setShowForceGraph] = useState(false);

  const addDebugLog = (message: string) => {
    console.log(`[ForceGraph3D Debug] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
  };

  useEffect(() => {
    addDebugLog("Component mounted");
    
    // Check store state
    const sceneGraph = getCurrentSceneGraph();
    const mainInstance = getForceGraphInstance();
    
    addDebugLog(`Scene Graph: ${sceneGraph ? sceneGraph.getMetadata().name : 'null'}`);
    addDebugLog(`Main ForceGraph Instance: ${mainInstance ? 'exists' : 'null'}`);
    addDebugLog(`Use Main Instance: ${useMainInstance}`);
    
    if (sceneGraph) {
      const nodeCount = sceneGraph.getGraph().getNodes().size;
      const edgeCount = sceneGraph.getGraph().getEdges().size;
      addDebugLog(`Graph has ${nodeCount} nodes, ${edgeCount} edges`);
    }

    // Show the actual component after brief delay
    const timer = setTimeout(() => {
      addDebugLog("Showing ForceGraph3DView component");
      setShowForceGraph(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [useMainInstance]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Debug info panel */}
      <div style={{ 
        height: '150px', 
        overflow: 'auto', 
        background: '#f5f5f5', 
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        borderBottom: '1px solid #ccc'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ForceGraph3D Debug Log:</div>
        {debugInfo.map((info, index) => (
          <div key={index}>{info}</div>
        ))}
      </div>
      
      {/* ForceGraph component */}
      <div style={{ flex: 1 }}>
        {showForceGraph ? (
          <ForceGraph3DView 
            useMainInstance={useMainInstance}
            width={800}
            height={600}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: '#666'
          }}>
            Preparing to initialize ForceGraph3D...
          </div>
        )}
      </div>
    </div>
  );
};

export default ForceGraph3DViewDebug;
