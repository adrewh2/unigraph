import CodeIcon from "@mui/icons-material/Code";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SchemaIcon from "@mui/icons-material/Schema";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React, { useState } from "react";

import {
  CompactNodeContainer,
  CompactNodeContent,
  CompactNodeHeader,
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
    <CompactNodeContainer
      sx={{
        bgcolor: selected ? "rgba(173, 216, 230, 0.3)" : "background.paper",
        border: selected ? "2px solid #1976d2" : "1px solid #ccc",
        maxWidth: 220,
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

      <CompactNodeHeader
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          p: 0.5,
          borderRadius: "4px 4px 0 0",
          mb: 1,
        }}
      >
        <Box display="flex" alignItems="center">
          <SchemaIcon sx={{ mr: 0.5, fontSize: "1rem", color: "inherit" }} />
          <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
            {nodeData.label}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          sx={{ padding: 0.25, color: "inherit" }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </CompactNodeHeader>

      <CompactNodeContent>
        {nodeData.properties && Object.keys(nodeData.properties).length > 0 ? (
          <TableContainer sx={{ maxHeight: 160 }}>
            <Table
              size="small"
              sx={{
                "& .MuiTableCell-root": {
                  py: 0.5,
                  px: 1,
                  fontSize: "0.7rem",
                  borderBottom: "1px dashed rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              <TableBody>
                {Object.entries(nodeData.properties).map(
                  ([propName, propType], idx) => (
                    <TableRow key={idx} hover>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          fontWeight: "bold",
                          width: "50%",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {propName}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", width: "50%" }}>
                        {propType}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {nodeData.description || "No properties defined"}
          </Typography>
        )}
      </CompactNodeContent>

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
    </CompactNodeContainer>
  );
};

export default TypeNode;
