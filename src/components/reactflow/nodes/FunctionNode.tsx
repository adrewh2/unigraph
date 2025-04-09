import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";
import LinkIcon from "@mui/icons-material/Link";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { NodeProps, NodeToolbar, Position } from "@xyflow/react";
import React, { useState } from "react";

import PortConnectionDialog from "./dialogs/PortConnectionDialog";
import {
  CompactNodeContainer,
  CompactNodeContent,
  CompactNodeHeader,
  FloatingActionButton,
  PortConnectedBadge,
  PortLabel,
  StyledDataHandle,
  StyledFunctionHandle,
} from "./shared/StyledComponents";

export interface ConnectedDataInstance {
  id: string;
  name: string;
  type: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
  description?: string;
  connected?: boolean;
  connectedInstance?: ConnectedDataInstance;
}

export interface FunctionOutput {
  name: string;
  type: string;
  description?: string;
  connected?: boolean;
  connectedInstance?: ConnectedDataInstance;
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
  const [portMenu, setPortMenu] = useState<{
    element: HTMLElement | null;
    isInput: boolean;
    portName: string;
    portType: string;
  } | null>(null);

  const [connectionDialog, setConnectionDialog] = useState<{
    open: boolean;
    isInput: boolean;
    portName: string;
    portType: string;
  } | null>(null);

  // Calculate dynamic spacing for handles
  const inputCount = nodeData.inputs?.length || 0;
  const outputCount = nodeData.outputs?.length || 0;

  // Default to at least one input and output if none provided
  const displayInputs =
    inputCount > 0 ? nodeData.inputs : [{ name: "input", type: "any" }];

  const displayOutputs =
    outputCount > 0 ? nodeData.outputs : [{ name: "output", type: "any" }];

  const handlePortClick = (
    event: React.MouseEvent,
    isInput: boolean,
    name: string,
    type: string
  ) => {
    event.stopPropagation();
    setPortMenu({
      element: event.currentTarget as HTMLElement,
      isInput,
      portName: name,
      portType: type,
    });
  };

  const handleMenuClose = () => {
    setPortMenu(null);
  };

  const handleBrowseDataMarketplace = () => {
    if (!portMenu) return;

    setConnectionDialog({
      open: true,
      isInput: portMenu.isInput,
      portName: portMenu.portName,
      portType: portMenu.portType,
    });

    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setConnectionDialog(null);
  };

  const handleConnect = (
    instanceId: string,
    instanceName: string,
    instanceType: string
  ) => {
    console.log(
      `Connected ${connectionDialog?.portName} to instance ${instanceId}`
    );

    // Update the node data to mark this port as connected
    if (connectionDialog?.isInput) {
      // Find the input and mark it as connected
      const updatedInputs = displayInputs?.map((input) =>
        input.name === connectionDialog.portName
          ? {
              ...input,
              connected: true,
              connectedInstance: {
                id: instanceId,
                name: instanceName,
                type: instanceType,
              },
            }
          : input
      );

      // For demo purposes - in a real app you'd update the node data in your state management
      if (nodeData.inputs) {
        nodeData.inputs = updatedInputs as FunctionParameter[];
      }
    } else {
      // Find the output and mark it as connected
      const updatedOutputs = displayOutputs?.map((output) =>
        output.name === connectionDialog?.portName
          ? {
              ...output,
              connected: true,
              connectedInstance: {
                id: instanceId,
                name: instanceName,
                type: instanceType,
              },
            }
          : output
      );

      // For demo purposes - in a real app you'd update the node data in your state management
      if (nodeData.outputs) {
        nodeData.outputs = updatedOutputs as FunctionOutput[];
      }
    }

    // Force a re-render (in a real app you'd use proper state management)
    const event = new CustomEvent("force-rerender");
    window.dispatchEvent(event);

    handleCloseDialog();
  };

  // Add handler for opening port dialog directly
  const handleOpenPortDialog = (
    isInput: boolean,
    portName: string,
    portType: string
  ) => {
    setConnectionDialog({
      open: true,
      isInput,
      portName,
      portType,
    });
  };

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

                {/* Add per-port connect button for inputs */}
                {!input.connected && (
                  <FloatingActionButton
                    position="left"
                    color="primary"
                    onClick={() =>
                      handleOpenPortDialog(true, input.name, input.type)
                    }
                    title={`Connect ${input.name}`}
                  />
                )}

                <PortLabel
                  variant="input"
                  connected={!!input.connected}
                  onClick={(e) =>
                    handlePortClick(e, true, input.name, input.type)
                  }
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(144, 202, 249, 0.3)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  {input.connected && input.connectedInstance ? (
                    <PortConnectedBadge
                      key={`connected-badge-${idx}`}
                      color="primary"
                    >
                      <StorageIcon
                        sx={{
                          fontSize: "0.7rem",
                          mr: 0.3,
                        }}
                      />
                    </PortConnectedBadge>
                  ) : null}
                  <Typography
                    variant="caption"
                    fontSize="0.65rem"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    {input.name}
                    <span style={{ opacity: 0.7 }}>: {input.type}</span>
                    {input.connected && !input.connectedInstance && (
                      <LinkIcon
                        sx={{
                          ml: 0.5,
                          fontSize: "0.7rem",
                          color: "primary.main",
                        }}
                      />
                    )}
                  </Typography>
                </PortLabel>
                {input.connected && input.connectedInstance && (
                  <Tooltip
                    title={`Connected to: ${input.connectedInstance.name}`}
                    placement="top"
                  >
                    <Chip
                      label={input.connectedInstance.name}
                      size="small"
                      color="primary"
                      sx={{
                        height: 16,
                        ml: 0.5,
                        fontSize: "0.6rem",
                        "& .MuiChip-label": { px: 0.5, py: 0 },
                      }}
                    />
                  </Tooltip>
                )}
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
                {output.connected && output.connectedInstance && (
                  <Tooltip
                    title={`Connected to: ${output.connectedInstance.name}`}
                    placement="top"
                  >
                    <Chip
                      label={output.connectedInstance.name}
                      size="small"
                      color="success"
                      sx={{
                        height: 16,
                        mr: 0.5,
                        fontSize: "0.6rem",
                        "& .MuiChip-label": { px: 0.5, py: 0 },
                      }}
                    />
                  </Tooltip>
                )}
                <PortLabel
                  variant="output"
                  connected={!!output.connected}
                  onClick={(e) =>
                    handlePortClick(e, false, output.name, output.type)
                  }
                  sx={{
                    cursor: "pointer",
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
                    {output.name}
                    <span style={{ opacity: 0.7 }}>: {output.type}</span>
                    {output.connected && !output.connectedInstance && (
                      <LinkIcon
                        sx={{
                          ml: 0.5,
                          fontSize: "0.7rem",
                          color: "success.main",
                        }}
                      />
                    )}
                  </Typography>
                  {output.connected && output.connectedInstance ? (
                    <PortConnectedBadge
                      key={`connected-badge-out-${idx}`}
                      color="success"
                    >
                      <StorageIcon
                        sx={{
                          fontSize: "0.7rem",
                          ml: 0.3,
                        }}
                      />
                    </PortConnectedBadge>
                  ) : null}
                </PortLabel>

                {/* Add per-port connect button for outputs */}
                {!output.connected && (
                  <FloatingActionButton
                    position="right"
                    color="success"
                    onClick={() =>
                      handleOpenPortDialog(false, output.name, output.type)
                    }
                    title={`Connect ${output.name}`}
                  />
                )}

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

      {/* Function type handle */}
      <StyledFunctionHandle
        type="target"
        position={Position.Top}
        id="function-type-in"
        style={{ left: "50%", transform: "translateX(-50%) rotate(45deg)" }}
      />

      {/* Port Context Menu */}
      <Menu
        anchorEl={portMenu?.element}
        open={Boolean(portMenu)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleBrowseDataMarketplace}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Connect to Data Instance"
            secondary={`Browse ${portMenu?.portType} instances`}
            primaryTypographyProps={{ fontSize: "0.85rem" }}
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
      </Menu>

      {/* Port Connection Dialog */}
      {connectionDialog && (
        <PortConnectionDialog
          open={connectionDialog.open}
          onClose={handleCloseDialog}
          isInput={connectionDialog.isInput}
          portName={connectionDialog.portName}
          portType={connectionDialog.portType}
          onConnect={handleConnect}
        />
      )}
    </CompactNodeContainer>
  );
};

export default FunctionNode;
