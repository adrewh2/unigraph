import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
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
