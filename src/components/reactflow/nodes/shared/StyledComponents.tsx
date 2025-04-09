import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, Paper, Tooltip, styled } from "@mui/material";
import { Handle } from "@xyflow/react";
import React from "react";

// Original styled components for nodes (keeping for backward compatibility)
export const NodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5),
  minWidth: 180,
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  position: "relative",
  "&:hover": {
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
}));

export const NodeHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(1),
}));

export const NodeContent = styled(Box)({
  position: "relative",
});

export const NodeFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing(1),
}));

// New compact versions of the components
export const CompactNodeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: 150,
  borderRadius: "6px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
  position: "relative",
  "&:hover": {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
  },
}));

export const CompactNodeHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(0.5),
}));

export const CompactNodeContent = styled(Box)({
  position: "relative",
  fontSize: "0.85rem",
});

export const CompactNodeFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
  borderTop: `1px dashed ${theme.palette.divider}`,
}));

export const CompactParamSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
  borderTop: `1px dashed ${theme.palette.divider}`,
}));

// Shared handle styles
export const StyledTypeHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.primary.main,
  borderRadius: "4px",
  width: "8px",
  height: "8px",
}));

export const StyledDataHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.success.main,
  borderRadius: "50%",
  width: "8px",
  height: "8px",
}));

export const StyledFunctionHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.warning.main,
  borderRadius: "0",
  width: "10px",
  height: "10px",
  transform: "rotate(45deg)",
}));

// Keep these for backward compatibility
export const ParamSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px dashed ${theme.palette.divider}`,
}));

// New styled components for function node ports
export const PortLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant" && prop !== "connected",
})<{ variant: "input" | "output"; connected?: boolean }>(
  ({ theme, variant, connected }) => ({
    fontSize: "0.65rem",
    padding: "2px 4px",
    borderRadius: "3px",
    position: "relative",
    backgroundColor: connected
      ? variant === "input"
        ? "rgba(144, 202, 249, 0.16)"
        : "rgba(129, 199, 132, 0.16)"
      : "rgba(0, 0, 0, 0.05)", // Grey background when not connected
    border: `${connected ? "2px" : "1px"} solid ${
      connected
        ? variant === "input"
          ? theme.palette.primary.main
          : theme.palette.success.main
        : "rgba(0, 0, 0, 0.15)" // Grey border when not connected
    }`,
    margin: variant === "input" ? "0 0 0 4px" : "0 4px 0 0",
    maxWidth: "100px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: connected
      ? theme.palette.text.primary
      : theme.palette.text.secondary, // Lighter text when not connected
    // Slight glow effect when connected
    boxShadow: connected
      ? `0 0 3px ${variant === "input" ? theme.palette.primary.main : theme.palette.success.main}`
      : "none",
  })
);

// Badge for connected ports
export const PortConnectedBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== "color",
})<{ color: "primary" | "success" }>(({ theme, color }) => ({
  position: "absolute",
  top: -5,
  [color === "primary" ? "left" : "right"]: -5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor:
    color === "primary"
      ? theme.palette.primary.main
      : theme.palette.success.main,
  color: "#fff",
  borderRadius: "50%",
  width: 14,
  height: 14,
  fontSize: "0.6rem",
  zIndex: 2,
}));

// Floating action button that appears outside the node
export const FloatingActionButton = styled(
  ({
    position,
    color,
    onClick,
    title,
    disabled,
    children,
    ...rest
  }: {
    position: "left" | "right";
    color: "primary" | "secondary" | "success" | "error" | "info" | "warning";
    onClick: (event: React.MouseEvent) => void;
    title?: string;
    disabled?: boolean;
    children?: React.ReactNode;
  }) => (
    <Box
      sx={{
        position: "absolute",
        [position]: "-18px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
      }}
      {...rest}
    >
      <Tooltip
        title={title || "Connect"}
        placement={position === "left" ? "left" : "right"}
      >
        <span>
          <IconButton
            color={color}
            onClick={onClick}
            size="small"
            disabled={disabled}
            sx={{
              backgroundColor: "white",
              border: `2px solid ${disabled ? "rgba(0,0,0,0.1)" : `var(--mui-palette-${color}-main)`}`,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: disabled
                  ? "white"
                  : `var(--mui-palette-${color}-50)`,
                transform: disabled ? "none" : "scale(1.1)",
              },
            }}
          >
            {children || <AddIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
)({});
