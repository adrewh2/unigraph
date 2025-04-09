import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React from "react";

import {
  CompactNodeContainer,
  CompactNodeContent,
  CompactNodeFooter,
  CompactNodeHeader,
  PortLabel,
  StyledDataHandle,
  StyledFunctionHandle,
} from "./shared/StyledComponents";

export interface FunctionParameter {
  name: string;
  type: string;
  description?: string;
}

export interface FunctionOutput {
  name: string;
  type: string;
  description?: string;
}

export interface FunctionNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  inputs?: FunctionParameter[];
  outputs?: FunctionOutput[];
  tags?: string[];
}

export const FunctionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as FunctionNodeData;

  // Calculate dynamic spacing for handles
  const inputCount = nodeData.inputs?.length || 0;
  const outputCount = nodeData.outputs?.length || 0;

  // Default to at least one input and output if none provided
  const displayInputs =
    inputCount > 0 ? nodeData.inputs : [{ name: "input", type: "any" }];

  const displayOutputs =
    outputCount > 0 ? nodeData.outputs : [{ name: "output", type: "any" }];

  return (
    <CompactNodeContainer
      sx={{
        bgcolor: selected ? "rgba(255, 236, 179, 0.3)" : "background.paper",
        border: selected ? "2px solid #ff9800" : "1px solid #ccc",
        width: "auto",
        minWidth: 220,
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

      <CompactNodeHeader
        sx={{
          bgcolor: "warning.main",
          color: "warning.contrastText",
          p: 0.5,
          borderRadius: "4px 4px 0 0",
          mb: 1,
        }}
      >
        <Box display="flex" alignItems="center">
          <FunctionsIcon sx={{ mr: 0.5, fontSize: "1rem", color: "inherit" }} />
          <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
            {nodeData.label}
          </Typography>
        </Box>
      </CompactNodeHeader>

      <CompactNodeContent>
        {nodeData.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize="0.7rem"
            sx={{ mb: 1, display: "block" }}
          >
            {nodeData.description}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            mb: 1,
          }}
        >
          {/* Input ports on the left */}
          <Box
            sx={{
              mr: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {displayInputs?.map((input, idx) => (
              <Box
                key={`input-${idx}`}
                sx={{
                  position: "relative",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  minHeight: "16px",
                }}
              >
                <StyledDataHandle
                  type="target"
                  position={Position.Left}
                  id={`input-${input.name}`}
                  style={{ left: -4 }}
                />
                <PortLabel variant="input">
                  <Typography variant="caption" fontSize="0.65rem">
                    {input.name}
                    <span style={{ opacity: 0.7 }}>: {input.type}</span>
                  </Typography>
                </PortLabel>
              </Box>
            ))}
          </Box>

          {/* Output ports on the right */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {displayOutputs?.map((output, idx) => (
              <Box
                key={`output-${idx}`}
                sx={{
                  position: "relative",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  minHeight: "16px",
                }}
              >
                <PortLabel variant="output">
                  <Typography variant="caption" fontSize="0.65rem">
                    {output.name}
                    <span style={{ opacity: 0.7 }}>: {output.type}</span>
                  </Typography>
                </PortLabel>
                <StyledDataHandle
                  type="source"
                  position={Position.Right}
                  id={`output-${output.name}`}
                  style={{ right: -4 }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </CompactNodeContent>

      {nodeData.tags && nodeData.tags.length > 0 && (
        <CompactNodeFooter>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              justifyContent: "flex-end",
            }}
          >
            {nodeData.tags.map((tag, idx) => (
              <Chip
                key={idx}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  height: 16,
                  "& .MuiChip-label": {
                    px: 0.75,
                    fontSize: "0.6rem",
                  },
                }}
              />
            ))}
          </Box>
        </CompactNodeFooter>
      )}

      {/* Function type handle */}
      <StyledFunctionHandle
        type="target"
        position={Position.Top}
        id="function-type-in"
        style={{ left: "50%", transform: "translateX(-50%) rotate(45deg)" }}
      />
    </CompactNodeContainer>
  );
};

export default FunctionNode;
