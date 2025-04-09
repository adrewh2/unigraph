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
  CompactParamSection,
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
    <CompactNodeContainer
      sx={{
        bgcolor: selected ? "rgba(255, 236, 179, 0.3)" : "background.paper",
        border: selected ? "2px solid #ff9800" : "1px solid #ccc",
        maxWidth: 220,
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

      <CompactNodeHeader>
        <Box display="flex" alignItems="center">
          <FunctionsIcon color="warning" sx={{ mr: 0.5, fontSize: "1rem" }} />
          <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
            {nodeData.label}
          </Typography>
        </Box>
        <Chip
          label={nodeData.returnType || "void"}
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            height: 20,
            "& .MuiChip-label": { px: 1, fontSize: "0.65rem" },
          }}
        />
      </CompactNodeHeader>

      <CompactNodeContent>
        {nodeData.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize="0.7rem"
          >
            {nodeData.description}
          </Typography>
        )}

        {nodeData.parameters && nodeData.parameters.length > 0 && (
          <CompactParamSection>
            <Typography
              variant="caption"
              fontWeight="bold"
              display="block"
              mb={0.5}
              fontSize="0.7rem"
            >
              Parameters:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {nodeData.parameters.map((param, idx) => (
                <Chip
                  key={idx}
                  label={`${param.name}: ${param.type}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    "& .MuiChip-label": {
                      px: 0.75,
                      fontSize: "0.65rem",
                    },
                  }}
                />
              ))}
            </Box>
          </CompactParamSection>
        )}
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
    </CompactNodeContainer>
  );
};

export default FunctionNode;
