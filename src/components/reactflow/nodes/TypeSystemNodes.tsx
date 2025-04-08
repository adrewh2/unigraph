import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SchemaIcon from "@mui/icons-material/Schema";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Handle, NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React, { useState } from "react";

// Define proper interfaces for the node data types
interface TypeNodeData {
  label: string;
  description?: string;
  properties?: Record<string, string>; // Property name -> type
}

interface DataNodeData {
  label: string;
  description?: string;
  typeName?: string;
  preview?: Record<string, any> | string;
}

interface FunctionParameter {
  name: string;
  type: string;
}

interface FunctionNodeData {
  label: string;
  description?: string;
  returnType?: string;
  parameters?: FunctionParameter[];
  tags?: string[];
}

// Styled components for nodes
const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  minWidth: 180,
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  position: "relative",
  "&:hover": {
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const NodeHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1),
}));

const NodeContent = styled(Box)({
  position: "relative",
});

const NodeFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing(1),
}));

const StyledTypeHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.primary.main,
  borderRadius: "4px",
  width: "10px",
  height: "10px",
}));

const StyledDataHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.success.main,
  borderRadius: "50%",
  width: "10px",
  height: "10px",
}));

const StyledFunctionHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.warning.main,
  borderRadius: "0",
  width: "12px",
  height: "12px",
  transform: "rotate(45deg)",
}));

const ParamSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px dashed ${theme.palette.divider}`,
}));

// Type Node Component
export const TypeNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as TypeNodeData;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <NodeContainer
      sx={{
        bgcolor: selected ? "rgba(173, 216, 230, 0.3)" : "background.paper",
        border: selected ? "2px solid #1976d2" : "1px solid #ccc",
      }}
    >
      <NodeToolbar position={Position.Top} isVisible={selected}>
        <Tooltip title="Edit Schema">
          <IconButton size="small">
            <SchemaIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Code">
          <IconButton size="small">
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </NodeToolbar>

      <NodeHeader>
        <Box display="flex" alignItems="center">
          <SchemaIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold">
            {nodeData.label}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </NodeHeader>

      <NodeContent>
        <Typography variant="caption" color="text.secondary">
          {nodeData.description || "Type definition"}
        </Typography>

        {nodeData.properties && (
          <Box mt={1}>
            {Object.entries(nodeData.properties).map(
              ([propName, propType], idx) => (
                <Chip
                  key={idx}
                  label={`${propName}: ${propType}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
                />
              )
            )}
          </Box>
        )}
      </NodeContent>

      <StyledTypeHandle type="source" position={Position.Right} id="type-out" />
      <StyledTypeHandle type="target" position={Position.Left} id="type-in" />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Edit Type</MenuItem>
        <MenuItem onClick={handleMenuClose}>Duplicate</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
      </Menu>
    </NodeContainer>
  );
};

// Data Node Component
export const DataNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as DataNodeData;

  return (
    <NodeContainer
      sx={{
        bgcolor: selected ? "rgba(200, 230, 201, 0.3)" : "background.paper",
        border: selected ? "2px solid #4caf50" : "1px solid #ccc",
      }}
    >
      <NodeToolbar position={Position.Top} isVisible={selected}>
        <Tooltip title="View Data">
          <IconButton size="small">
            <StorageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </NodeToolbar>

      <NodeHeader>
        <Box display="flex" alignItems="center">
          <StorageIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold">
            {nodeData.label}
          </Typography>
        </Box>
        <Chip
          label={nodeData.typeName || "untyped"}
          size="small"
          color={nodeData.typeName ? "primary" : "default"}
          variant="outlined"
        />
      </NodeHeader>

      <NodeContent>
        {nodeData.preview ? (
          <Box
            sx={{
              p: 1,
              bgcolor: "grey.100",
              borderRadius: 1,
              fontSize: "0.75rem",
              fontFamily: "monospace",
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            {typeof nodeData.preview === "string"
              ? nodeData.preview
              : JSON.stringify(nodeData.preview, null, 2)}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {nodeData.description || "Data object"}
          </Typography>
        )}
      </NodeContent>

      <StyledDataHandle type="source" position={Position.Right} id="data-out" />
      <StyledDataHandle type="target" position={Position.Left} id="data-in" />

      <StyledTypeHandle
        type="target"
        position={Position.Top}
        id="type-input"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />
    </NodeContainer>
  );
};

// Function Node Component
export const FunctionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as FunctionNodeData;

  return (
    <NodeContainer
      sx={{
        bgcolor: selected ? "rgba(255, 236, 179, 0.3)" : "background.paper",
        border: selected ? "2px solid #ff9800" : "1px solid #ccc",
      }}
    >
      <NodeToolbar position={Position.Top} isVisible={selected}>
        <Tooltip title="Edit Function">
          <IconButton size="small">
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Execute">
          <IconButton size="small">
            <FunctionsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </NodeToolbar>

      <NodeHeader>
        <Box display="flex" alignItems="center">
          <FunctionsIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" fontWeight="bold">
            {nodeData.label}
          </Typography>
        </Box>
        <Chip
          label={nodeData.returnType || "void"}
          size="small"
          color="primary"
          variant="outlined"
        />
      </NodeHeader>

      <NodeContent>
        <Typography variant="caption" color="text.secondary">
          {nodeData.description || "Function"}
        </Typography>

        {nodeData.parameters && nodeData.parameters.length > 0 && (
          <ParamSection>
            <Typography
              variant="caption"
              fontWeight="bold"
              display="block"
              mb={0.5}
            >
              Parameters:
            </Typography>
            {nodeData.parameters.map((param, idx) => (
              <Chip
                key={idx}
                label={`${param.name}: ${param.type}`}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5, fontSize: "0.7rem" }}
              />
            ))}
          </ParamSection>
        )}
      </NodeContent>

      <NodeFooter>
        {nodeData.tags &&
          nodeData.tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ ml: 0.5, fontSize: "0.7rem" }}
            />
          ))}
      </NodeFooter>

      {/* Input handle for data */}
      <StyledDataHandle type="target" position={Position.Left} id="data-in" />

      {/* Output handle for data */}
      <StyledDataHandle type="source" position={Position.Right} id="data-out" />

      {/* Input handle for function type */}
      <StyledFunctionHandle
        type="target"
        position={Position.Top}
        id="function-type-in"
        style={{ left: "50%", transform: "translateX(-50%) rotate(45deg)" }}
      />
    </NodeContainer>
  );
};

export const nodeTypes = {
  typeNode: TypeNode,
  dataNode: DataNode,
  functionNode: FunctionNode,
};
