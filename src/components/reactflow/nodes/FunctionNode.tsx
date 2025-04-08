import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React from "react";

import {
  NodeContainer,
  NodeContent,
  NodeFooter,
  NodeHeader,
  ParamSection,
  StyledDataHandle,
  StyledFunctionHandle,
} from "./shared/StyledComponents";

export interface FunctionParameter {
  name: string;
  type: string;
}

export interface FunctionNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  returnType?: string;
  parameters?: FunctionParameter[];
  tags?: string[];
}

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

export default FunctionNode;
