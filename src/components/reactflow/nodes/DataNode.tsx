import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import FunctionsTwoToneIcon from "@mui/icons-material/FunctionsTwoTone";
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
import React, { useState } from "react";

import DataPortFunctionDialog from "./dialogs/DataPortFunctionDialog";
import {
  CompactNodeContainer,
  CompactNodeContent,
  CompactNodeHeader,
  FloatingActionButton,
  PortLabel,
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

export interface DataNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  typeName?: string;
  columns: TableColumn[];
  rows: TableRow[];
  // Keep preview for backward compatibility
  preview?: Record<string, any> | string;
}

const CompactTableContainer = styled(TableContainer)({
  maxHeight: 160,
  maxWidth: 300,
  overflowX: "auto",
  overflowY: "auto",
  fontSize: "0.75rem",
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

export const DataNode: React.FC<NodeProps> = ({ data, selected, id }) => {
  const nodeData = data as unknown as DataNodeData;
  const [functionDialog, setFunctionDialog] = useState<{
    open: boolean;
    dataType: string;
  } | null>(null);

  // Convert legacy preview data to tabular format if needed
  let tableData = nodeData;
  if (!nodeData.columns && !nodeData.rows && nodeData.preview) {
    // Convert preview to a table format
    const preview = nodeData.preview;
    if (typeof preview === "object" && preview !== null) {
      const columns: TableColumn[] = [];
      const row: TableRow = {};

      Object.entries(preview).forEach(([key, value]) => {
        // Determine type
        let type: TableColumn["type"] = "string";
        if (typeof value === "number") type = "number";
        else if (typeof value === "boolean") type = "boolean";
        else if (value instanceof Date) type = "date";
        else if (typeof value === "object") type = "object";

        columns.push({ name: key, type, width: 100 });
        row[key] = value;
      });

      tableData = {
        ...nodeData,
        columns,
        rows: [row],
      };
    }
  }

  const handleDataPortClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use the data node's type to find compatible functions
    setFunctionDialog({
      open: true,
      dataType: tableData.typeName || "any",
    });
  };

  return (
    <CompactNodeContainer
      sx={{
        bgcolor: selected ? "rgba(200, 230, 201, 0.3)" : "background.paper",
        border: selected ? "2px solid #4caf50" : "1px solid #ccc",
        minWidth: "220px",
        maxWidth: "300px",
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

      <CompactNodeHeader
        sx={{
          bgcolor: "grey.700",
          color: "common.white",
          p: 0.5,
          borderRadius: "4px 4px 0 0",
          mb: 1,
        }}
      >
        <Box display="flex" alignItems="center">
          <StorageIcon sx={{ mr: 0.5, fontSize: "1rem", color: "inherit" }} />
          <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
            {tableData.label}
          </Typography>
        </Box>
        <Chip
          label={tableData.typeName || "untyped"}
          size="small"
          color={tableData.typeName ? "primary" : "default"}
          variant="outlined"
          sx={{
            height: 20,
            "& .MuiChip-label": { px: 1, fontSize: "0.65rem" },
            borderColor: "rgba(255,255,255,0.5)",
            color: "common.white",
          }}
        />
      </CompactNodeHeader>

      <CompactNodeContent>
        {tableData.columns && tableData.rows ? (
          <Paper variant="outlined" sx={{ mb: 0 }}>
            <CompactTableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {tableData.columns.map((column, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          minWidth: column.width || 70,
                          whiteSpace: "nowrap",
                          py: 0.5,
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            fontSize="0.65rem"
                          >
                            {column.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 0.5, fontSize: "0.55rem" }}
                          >
                            ({column.type})
                          </Typography>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                      {tableData.columns.map((column, colIdx) => (
                        <TableCell key={`${rowIdx}-${colIdx}`} sx={{ py: 0.5 }}>
                          {formatCellValue(row[column.name], column.type)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CompactTableContainer>
          </Paper>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No data available
          </Typography>
        )}
      </CompactNodeContent>

      {/* Output port with click interaction */}
      <Box
        sx={{
          position: "absolute",
          right: -4,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <PortLabel
          variant="output"
          onClick={handleDataPortClick}
          sx={{
            cursor: "pointer",
            mr: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(129, 199, 132, 0.3)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant="caption"
            fontSize="0.65rem"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FunctionsTwoToneIcon sx={{ fontSize: "0.8rem", mr: 0.5 }} />
            Find Function
          </Typography>
        </PortLabel>
        <StyledDataHandle
          type="source"
          position={Position.Right}
          id="data-out"
        />
      </Box>

      {/* Floating Action Button for connecting to functions */}
      <FloatingActionButton
        position="right"
        color="success"
        onClick={handleDataPortClick}
        title="Add Function"
      >
        <AddCircleIcon />
      </FloatingActionButton>

      <StyledDataHandle type="source" position={Position.Right} id="data-out" />
      <StyledDataHandle type="target" position={Position.Left} id="data-in" />

      <StyledTypeHandle
        type="target"
        position={Position.Top}
        id="type-input"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      />

      {/* Function selection dialog */}
      {functionDialog && (
        <DataPortFunctionDialog
          open={functionDialog.open}
          onClose={() => setFunctionDialog(null)}
          dataType={functionDialog.dataType}
          dataNodeId={id}
          dataNodeName={nodeData.label}
        />
      )}
    </CompactNodeContainer>
  );
};

export default DataNode;
