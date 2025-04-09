import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, IconButton, Paper, Typography, useTheme } from "@mui/material";
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import React, { useCallback, useRef, useState } from "react";
import "reactflow/dist/style.css";

import { nodeTypes } from "./nodes";

export const TypeSystemPanel: React.FC<{
  initialData?: { nodes: Node[]; edges: Edge[] };
}> = ({ initialData }) => {
  const theme = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialData?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialData?.edges ?? []
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        let edgeStyle = {};
        let animated = false;

        if (
          params.sourceHandle?.includes("type") ||
          params.targetHandle?.includes("type")
        ) {
          edgeStyle = { stroke: theme.palette.primary.main };
        } else if (
          params.sourceHandle?.includes("data") ||
          params.targetHandle?.includes("data")
        ) {
          edgeStyle = { stroke: theme.palette.success.main };
          animated = true;
        } else if (
          params.sourceHandle?.includes("function") ||
          params.targetHandle?.includes("function")
        ) {
          edgeStyle = { stroke: theme.palette.warning.main };
        }

        return addEdge(
          {
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: edgeStyle,
            animated,
          },
          eds
        );
      });
    },
    [setEdges, theme.palette]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNodeId && edge.target !== selectedNodeId
        )
      );
      setSelectedNodeId(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            Type System Designer
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Create and connect types, data tables, and functions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={deleteSelectedNode}
            disabled={!selectedNodeId}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton size="small">
            <SaveIcon />
          </IconButton>
        </Box>
      </Paper>

      <Box ref={reactFlowWrapper} sx={{ flex: 1, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes as unknown as NodeTypes}
          fitView
          attributionPosition="bottom-right"
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: "#4caf50" },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
      </Box>

      <Paper
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small">
            <UndoIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <RedoIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small">
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default TypeSystemPanel;
