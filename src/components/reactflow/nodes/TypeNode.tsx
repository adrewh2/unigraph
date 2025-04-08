import CodeIcon from "@mui/icons-material/Code";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SchemaIcon from "@mui/icons-material/Schema";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React, { useState } from "react";

import {
  NodeContainer,
  NodeContent,
  NodeHeader,
  StyledTypeHandle,
} from "./shared/StyledComponents";

export interface TypeNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  properties?: Record<string, string>; // Property name -> type
}

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

export default TypeNode;
