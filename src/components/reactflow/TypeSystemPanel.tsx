import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
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
import { nodeTypes } from "./nodes/TypeSystemNodes";

// Define types for our node data
type TypeNodeData = {
  label: string;
  description?: string;
  properties?: Record<string, string>;
};

type DataNodeData = {
  label: string;
  description?: string;
  typeName?: string;
  preview?: Record<string, any> | string;
};

type FunctionNodeData = {
  label: string;
  description?: string;
  returnType?: string;
  parameters?: Array<{ name: string; type: string }>;
  tags?: string[];
};

// Sample initial data with proper typing
const initialNodes: Array<
  Node<TypeNodeData> | Node<DataNodeData> | Node<FunctionNodeData>
> = [
  {
    id: "type-1",
    type: "typeNode",
    position: { x: 100, y: 100 },
    data: {
      label: "Person",
      properties: {
        name: "string",
        age: "number",
        active: "boolean",
      },
    },
  },
  {
    id: "data-1",
    type: "dataNode",
    position: { x: 400, y: 100 },
    data: {
      label: "User Data",
      typeName: "Person",
      preview: { name: "John Doe", age: 32, active: true },
    },
  },
  {
    id: "func-1",
    type: "functionNode",
    position: { x: 250, y: 300 },
    data: {
      label: "isAdult",
      returnType: "boolean",
      parameters: [{ name: "person", type: "Person" }],
      description: "Checks if a person is an adult",
      tags: ["validation", "utility"],
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "type-1",
    target: "data-1",
    sourceHandle: "type-out",
    targetHandle: "type-input",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { stroke: "#1976d2" },
    animated: false,
  },
  {
    id: "e2-3",
    source: "data-1",
    target: "func-1",
    sourceHandle: "data-out",
    targetHandle: "data-in",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: { stroke: "#4caf50" },
    animated: true,
  },
];

export const TypeSystemPanel: React.FC = () => {
  const theme = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      // We can add custom logic here for validating connections between types
      setEdges((eds) => {
        // Determine the appropriate styling based on the connection
        let edgeStyle = {};
        let animated = false;

        // Type connections (blue)
        if (
          params.sourceHandle?.includes("type") ||
          params.targetHandle?.includes("type")
        ) {
          edgeStyle = { stroke: theme.palette.primary.main };
        }
        // Data connections (green)
        else if (
          params.sourceHandle?.includes("data") ||
          params.targetHandle?.includes("data")
        ) {
          edgeStyle = { stroke: theme.palette.success.main };
          animated = true;
        }
        // Function connections (orange)
        else if (
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

  const addTypeNode = () => {
    const newNode: Node<TypeNodeData> = {
      id: `type-${nodes.length + 1}`,
      type: "typeNode",
      position: { x: 100, y: 200 },
      data: {
        label: "New Type",
        properties: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDataNode = () => {
    const newNode: Node<DataNodeData> = {
      id: `data-${nodes.length + 1}`,
      type: "dataNode",
      position: { x: 400, y: 200 },
      data: {
        label: "New Data",
        typeName: "",
        preview: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addFunctionNode = () => {
    const newNode: Node<FunctionNodeData> = {
      id: `func-${nodes.length + 1}`,
      type: "functionNode",
      position: { x: 250, y: 400 },
      data: {
        label: "New Function",
        returnType: "any",
        parameters: [],
        tags: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
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
            Create and connect types, data, and functions
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addTypeNode}
            color="primary"
          >
            Type
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addDataNode}
            color="success"
          >
            Data
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addFunctionNode}
            color="warning"
          >
            Function
          </Button>
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
