import FilterListIcon from "@mui/icons-material/FilterList";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React from "react";

import {
  NodeContainer,
  NodeContent,
  NodeHeader,
  StyledDataHandle,
  StyledTypeHandle,
} from "./shared/StyledComponents";

export interface TableColumn {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "object";
  width?: number;
}

export interface TableRow {
  [key: string]: any;
}

export interface DataNodeData {
  label: string;
  description?: string;
  typeName?: string;
  columns: TableColumn[];
  rows: TableRow[];
  preview?: Record<string, any> | string;
}

const StyledTableContainer = styled(TableContainer)({
  maxHeight: 200,
  maxWidth: 400,
  overflowX: "auto",
  overflowY: "auto",
  fontSize: "0.75rem",
  marginTop: 8,
  "& .MuiTableCell-root": {
    padding: "2px 4px",
    fontSize: "0.7rem",
  },
  "& .MuiTableCell-head": {
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
});

const formatCellValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return "-";

  if (type === "boolean") return value ? "true" : "false";
  if (type === "object") return JSON.stringify(value);
  if (type === "date" && value instanceof Date)
    return value.toLocaleDateString();

  return String(value);
};

export const DataNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as DataNodeData;

  return (
    <NodeContainer
      sx={{
        bgcolor: selected ? "rgba(200, 230, 201, 0.3)" : "background.paper",
        border: selected ? "2px solid #4caf50" : "1px solid #ccc",
        minWidth: "250px",
      }}
    >
      <NodeToolbar position={Position.Top} isVisible={selected}>
        <Tooltip title="View Data">
          <IconButton size="small">
            <StorageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter">
          <IconButton size="small">
            <FilterListIcon fontSize="small" />
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
        <Typography variant="caption" color="text.secondary">
          {nodeData.description ||
            `Data table with ${nodeData.rows?.length || 0} rows`}
        </Typography>

        {nodeData.columns && nodeData.rows ? (
          <Paper variant="outlined">
            <StyledTableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {nodeData.columns.map((column, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          minWidth: column.width || 80,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Typography variant="caption" fontWeight="bold">
                            {column.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 0.5, fontSize: "0.6rem" }}
                          >
                            ({column.type})
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nodeData.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                      {nodeData.columns.map((column, colIdx) => (
                        <TableCell key={`${rowIdx}-${colIdx}`}>
                          {formatCellValue(row[column.name], column.type)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Paper>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No data available
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

export default DataNode;
