import React, { useEffect, useRef } from "react";
import { getForceGraphInstance } from "../../store/appConfigStore";

interface ForceGraph3DViewProps {
  width?: number;
  height?: number;
}

/**
 * ForceGraph3D view component that displays the running ForceGraph3D instance in an app-shell tab.
 * This component gets the active ForceGraph3D instance from the appConfigStore and displays it.
 */
const ForceGraph3DView: React.FC<ForceGraph3DViewProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const forceGraphInstance = getForceGraphInstance();
    
    if (forceGraphInstance && containerRef.current) {
      // Get the canvas element from the force graph instance
      const canvas = forceGraphInstance.renderer().domElement;
      
      if (canvas && containerRef.current) {
        // Clear any existing content
        containerRef.current.innerHTML = '';
        
        // Set the canvas size
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Append the canvas to our container
        containerRef.current.appendChild(canvas);
        
        // Trigger a re-render of the force graph
        forceGraphInstance.refresh();
      }
    }
  }, [width, height]);

  if (!getForceGraphInstance()) {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666',
          fontSize: '16px'
        }}
      >
        No ForceGraph3D instance available. Please initialize a 3D graph first.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} 
      />
    </div>
  );
};

export default ForceGraph3DView;
