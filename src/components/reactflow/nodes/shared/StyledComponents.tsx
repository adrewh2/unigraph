import { Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Handle } from "@xyflow/react";

// Common styled components for nodes
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

export const StyledTypeHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.primary.main,
  borderRadius: "4px",
  width: "10px",
  height: "10px",
}));

export const StyledDataHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.success.main,
  borderRadius: "50%",
  width: "10px",
  height: "10px",
}));

export const StyledFunctionHandle = styled(Handle)(({ theme }) => ({
  background: theme.palette.warning.main,
  borderRadius: "0",
  width: "12px",
  height: "12px",
  transform: "rotate(45deg)",
}));

export const ParamSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px dashed ${theme.palette.divider}`,
}));
