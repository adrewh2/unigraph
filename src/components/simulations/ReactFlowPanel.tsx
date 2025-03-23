import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnInit,
  OnSelectionChangeParams,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { SelectionMode } from "reactflow";
import {
  MOUSE_HOVERED_NODE_COLOR,
  SELECTED_NODE_COLOR,
} from "../../core/force-graph/createForceGraph";
import { NodeId } from "../../core/model/Node";
import { EntityIds } from "../../core/model/entity/entityIds";
import {
  getSelectedNodeId,
  getSelectedNodeIds,
  setHoveredNodeId,
  setSelectedNodeId,
  setSelectedNodeIds,
} from "../../store/graphInteractionStore";
import { setRightActiveSection } from "../../store/workspaceConfigStore";
import CustomNode from "../CustomNode";

import "@xyflow/react/dist/style.css";
import ResizerNode from "../resizerNode";

// Remove the custom Node interface that was causing the type conflict
interface ReactFlowPanelProps {
  nodes: Node[];
  edges: Edge[];
  onLoad?: (instance: ReactFlowInstance) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void;
  onBackgroundContextMenu?: (
    event: React.MouseEvent<Element, MouseEvent>
  ) => void;
  onNodeDragStop?: (event: React.MouseEvent, node: Node, nodes: Node[]) => void;
  // sceneGraph: SceneGraph;
}

const nodeTypes = {
  customNode: CustomNode, // Register the custom node component
  resizerNode: ResizerNode,
};

// Add a style tag for selected and hovered nodes
const nodeStyles = document.createElement("style");
nodeStyles.textContent = `
  .react-flow__node.selected {
    box-shadow: 0 0 0 2px ${SELECTED_NODE_COLOR} !important;
    border: 2px solid ${SELECTED_NODE_COLOR} !important;
    border-radius: 4px !important;
  }

  .react-flow__node-customNode.selected, .react-flow__node-resizerNode.selected {
    outline: 2px solid ${SELECTED_NODE_COLOR} !important;
    outline-offset: 2px;
  }
  
  /* Add hover styles */
  .react-flow__node:hover {
    box-shadow: 0 0 0 2px ${MOUSE_HOVERED_NODE_COLOR} !important;
    border: 2px solid ${MOUSE_HOVERED_NODE_COLOR} !important;
    border-radius: 4px !important;
  }
  
  .react-flow__node-customNode:hover:not(.selected), .react-flow__node-resizerNode:hover:not(.selected) {
    outline: 2px solid ${MOUSE_HOVERED_NODE_COLOR} !important;
    outline-offset: 2px;
  }
`;

const ReactFlowPanel: React.FC<ReactFlowPanelProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onLoad,
  onNodeContextMenu,
  onBackgroundContextMenu,
  onNodeDragStop,
}) => {
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const selectionChangeRef = useRef(false);

  // PRE-PROCESS nodes to include selection state from global store
  const processedNodes = useMemo(() => {
    const selectedNodeId = getSelectedNodeId();
    const selectedNodeIds = getSelectedNodeIds();

    return initialNodes.map((node) => ({
      ...node,
      selected:
        node.id === selectedNodeId || selectedNodeIds.has(node.id as NodeId),
    }));
  }, [initialNodes]);

  const [nodes, setNodes, originalOnNodesChange] =
    useNodesState(processedNodes);
  const [edges, setEdges, originalOnEdgesChange] = useEdgesState(initialEdges);

  // Fix the type mismatch by avoiding direct NodeChange typing - use any as an intermediary
  const handleNodesChange = useCallback(
    (changes: any) => {
      setTimeout(() => {
        originalOnNodesChange(changes);
      });
    },
    [originalOnNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      setTimeout(() => {
        originalOnEdgesChange(changes);
      });
    },
    [originalOnEdgesChange]
  );

  // Add the selection styles to the document head
  useEffect(() => {
    document.head.appendChild(nodeStyles);
    return () => {
      document.head.removeChild(nodeStyles);
    };
  }, []);

  // Custom node click handler that sets the selected node
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    selectionChangeRef.current = true;

    // Set this node as the selected node in the global store
    setSelectedNodeId(node.id as NodeId);

    // Open the node details panel
    setRightActiveSection("node-details");

    // Update the ReactFlow nodes directly to show selection immediately
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );
    }
  }, []);

  // Handle selection change in ReactFlow
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      // Skip if this selection change was triggered by our node click handler
      if (selectionChangeRef.current) {
        selectionChangeRef.current = false;
        return;
      }

      if (!selectedNodes || selectedNodes.length === 0) {
        // Clear selection in global store
        setSelectedNodeIds(new EntityIds([]));
        return;
      }

      if (selectedNodes.length === 1) {
        // Single node selection
        setSelectedNodeId(selectedNodes[0].id as NodeId);
        setRightActiveSection("node-details");
      } else {
        // Multi-node selection
        const nodeIds = selectedNodes.map((node) => node.id as NodeId);
        setSelectedNodeIds(new EntityIds(nodeIds));
      }
    },
    []
  );

  // Handle node hover
  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setHoveredNodeId(node.id as NodeId);
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Handle background click to clear selection
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(processedNodes);
  }, [processedNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Fix the onInit handler to use the correct type
  const handleInit: OnInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
      if (onLoad) {
        onLoad(instance);
      }
      instance.fitView({ padding: 0.1 });

      // Focus on selected node if there is one
      const selectedNodeId = getSelectedNodeId();
      if (selectedNodeId) {
        const selectedNode = instance.getNode(selectedNodeId);
        if (selectedNode) {
          instance.fitView({
            nodes: [selectedNode],
            padding: 0.5,
          });
        }
      }
    },
    [onLoad]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      ref={reactFlowWrapper}
    >
      <ReactFlowProvider>
        <ReactFlow
          selectionMode={SelectionMode.Partial}
          selectionOnDrag={true}
          selectNodesOnDrag={false}
          panOnDrag={[2]}
          panOnScroll={false}
          multiSelectionKeyCode="Shift"
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onInit={handleInit} // Use the properly typed handler
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(event) =>
            onBackgroundContextMenu?.(
              event as React.MouseEvent<Element, MouseEvent>
            )
          }
          onPaneClick={handlePaneClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onNodeClick={handleNodeClick}
          onSelectionChange={handleSelectionChange}
          fitView={true}
          minZoom={0.1}
          maxZoom={200}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
          }}
          nodeTypes={nodeTypes} // Use the custom node types
          style={{
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ReactFlowPanel;
