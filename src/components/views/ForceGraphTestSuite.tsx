import React from "react";
import ForceGraph3DViewSimple from "./ForceGraph3DViewSimple";
import ForceGraphDebugInfo from "../debug/ForceGraphDebugInfo";

/**
 * Combined testing view that shows both the debug info and the simple ForceGraph3D component
 */
const ForceGraphTestSuite: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontWeight: 'bold'
      }}>
        ForceGraph3D Test Suite
      </div>
      
      {/* Debug Info Panel - Fixed height */}
      <div style={{ 
        height: '300px',
        borderBottom: '1px solid #dee2e6',
        overflow: 'hidden'
      }}>
        <ForceGraphDebugInfo />
      </div>
      
      {/* Simple ForceGraph3D View - Takes remaining space */}
      <div style={{ flex: 1, minHeight: '400px' }}>
        <ForceGraph3DViewSimple />
      </div>
    </div>
  );
};

export default ForceGraphTestSuite;
