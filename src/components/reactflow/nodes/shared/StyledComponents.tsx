import { Box, Paper, styled } from "@mui/material";
import { Handle } from "@xyflow/react";

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
  shouldForwardProp: (prop) => prop !== "variant",
  // eslint-disable-next-line unused-imports/no-unused-vars
})<{ variant: "input" | "output" }>(({ theme, variant }) => ({
  fontSize: "0.65rem",
  padding: "2px 4px",
  borderRadius: "3px",
  backgroundColor:
    variant === "input"
      ? "rgba(144, 202, 249, 0.16)"
      : "rgba(129, 199, 132, 0.16)",
  border: `1px solid ${
    variant === "input"
      ? "rgba(144, 202, 249, 0.4)"
      : "rgba(129, 199, 132, 0.4)"
  }`,
  margin: variant === "input" ? "0 0 0 4px" : "0 4px 0 0",
  maxWidth: "100px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));
