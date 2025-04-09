import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FunctionsIcon from "@mui/icons-material/Functions";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useReactFlow } from "@xyflow/react";
import React, { useEffect, useState } from "react";

// Mock function registry - in a real app, this would come from your function service
const mockFunctionRegistry = [
  {
    id: "func-filter",
    name: "Filter Records",
    description: "Filter records based on criteria",
    inputs: [
      { name: "records", type: "Person", required: true },
      { name: "criteria", type: "Object", required: false },
    ],
    outputs: [{ name: "filteredRecords", type: "Person" }],
    tags: ["data", "filter"],
  },
  {
    id: "func-transform",
    name: "Transform Data",
    description: "Transform data from one format to another",
    inputs: [
      { name: "data", type: "Person", required: true },
      { name: "template", type: "string", required: false },
    ],
    outputs: [{ name: "transformed", type: "Object" }],
    tags: ["transform", "convert"],
  },
  {
    id: "func-aggregate",
    name: "Aggregate Stats",
    description: "Calculate statistics on data",
    inputs: [{ name: "dataset", type: "any", required: true }],
    outputs: [
      { name: "stats", type: "Stats" },
      { name: "summary", type: "string" },
    ],
    tags: ["analytics", "stats"],
  },
  {
    id: "func-validate",
    name: "Validate Data",
    description: "Validate data against schema",
    inputs: [
      { name: "input", type: "any", required: true },
      { name: "schema", type: "Object", required: false },
    ],
    outputs: [
      { name: "valid", type: "boolean" },
      { name: "errors", type: "Array" },
    ],
    tags: ["validation"],
  },
  {
    id: "func-enrich",
    name: "Enrich Person Data",
    description: "Add additional information to person records",
    inputs: [
      { name: "persons", type: "Person", required: true },
      { name: "source", type: "string", required: false },
    ],
    outputs: [{ name: "enriched", type: "Person" }],
    tags: ["enrichment", "person"],
  },
];

interface DataPortFunctionDialogProps {
  open: boolean;
  onClose: () => void;
  dataType: string;
  dataNodeId: string;
  dataNodeName: string;
}

const DataPortFunctionDialog: React.FC<DataPortFunctionDialogProps> = ({
  open,
  onClose,
  dataType,
  dataNodeId,
  dataNodeName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [compatibleFunctions, setCompatibleFunctions] = useState<
    typeof mockFunctionRegistry
  >([]);

  // Access ReactFlow instance to add nodes and edges
  const reactFlowInstance = useReactFlow();

  // Simulate loading functions from a registry
  useEffect(() => {
    setIsLoading(true);

    // Filter functions by compatible input types
    const timer = setTimeout(() => {
      const filteredFunctions = mockFunctionRegistry.filter((func) => {
        // Check if any function input is compatible with our data type
        return func.inputs.some((input) => {
          // Match exact type or 'any' type
          return (
            input.type.toLowerCase() === dataType.toLowerCase() ||
            input.type === "any"
          );
        });
      });

      setCompatibleFunctions(filteredFunctions);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [dataType]);

  // Filter functions based on search term
  const filteredFunctions = compatibleFunctions.filter(
    (func) =>
      func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      func.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSelectFunction = (functionId: string) => {
    setSelectedFunction(functionId);
  };

  const handleImportFunction = () => {
    if (!selectedFunction) return;

    // Find the selected function from our registry
    const funcToImport = filteredFunctions.find(
      (f) => f.id === selectedFunction
    );
    if (!funcToImport) return;

    // Get source node position for calculating new node position
    const sourceNode = reactFlowInstance.getNode(dataNodeId);
    if (!sourceNode) return;

    // Create a new function node
    const newNodeId = `func-${Date.now()}`;
    const compatibleInput = funcToImport.inputs.find(
      (input) => input.type === dataType || input.type === "any"
    );

    // Position the new node to the right of the data node
    const newNodePosition = {
      x: sourceNode.position.x + 300,
      y: sourceNode.position.y,
    };

    // Prepare the inputs with the first compatible one marked as connected
    const newInputs = funcToImport.inputs.map((input) => ({
      name: input.name,
      type: input.type,
      connected: input === compatibleInput,
      connectedInstance:
        input === compatibleInput
          ? {
              id: dataNodeId,
              name: dataNodeName,
              type: dataType,
            }
          : undefined,
    }));

    // Create the new function node
    const newNode = {
      id: newNodeId,
      type: "functionNode",
      position: newNodePosition,
      data: {
        label: funcToImport.name,
        description: funcToImport.description,
        inputs: newInputs,
        outputs: funcToImport.outputs,
        tags: funcToImport.tags,
      },
    };

    // Create an edge connecting the data node to the function node
    const newEdge = {
      id: `edge-${dataNodeId}-${newNodeId}`,
      source: dataNodeId,
      target: newNodeId,
      sourceHandle: "data-out",
      targetHandle: `input-${compatibleInput?.name}`,
      animated: true,
      style: { stroke: "#4caf50" },
    };

    // Update the graph using ReactFlow's methods
    reactFlowInstance.addNodes(newNode);
    reactFlowInstance.addEdges(newEdge);

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "60vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Select Compatible Function</Typography>
          <Chip
            label={dataType}
            color="success"
            size="small"
            icon={<FunctionsIcon />}
          />
        </Box>
      </DialogTitle>

      <Box px={3} py={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search functions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <FilterAltIcon
                  fontSize="small"
                  sx={{ cursor: "pointer", opacity: 0.7 }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            <CircularProgress size={32} />
          </Box>
        ) : filteredFunctions.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No compatible functions found for {dataType} data
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FunctionsIcon />}
            >
              Create New Function
            </Button>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: "50vh", overflow: "auto" }}>
            {filteredFunctions.map((func) => (
              <ListItem key={func.id} disablePadding>
                <ListItemButton
                  selected={selectedFunction === func.id}
                  onClick={() => handleSelectFunction(func.id)}
                  sx={{
                    borderLeft: selectedFunction === func.id ? 3 : 0,
                    borderColor: "warning.main",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <FunctionsIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={func.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {func.description}
                        </Typography>
                        <Box mt={0.5}>
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ display: "block", fontSize: "0.65rem" }}
                          >
                            Inputs:{" "}
                            {func.inputs
                              .map((i) => `${i.name}: ${i.type}`)
                              .join(", ")}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ display: "block", fontSize: "0.65rem" }}
                          >
                            Outputs:{" "}
                            {func.outputs
                              .map((o) => `${o.name}: ${o.type}`)
                              .join(", ")}
                          </Typography>
                        </Box>
                        <Box mt={0.5}>
                          {func.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                mr: 0.5,
                                height: 20,
                                "& .MuiChip-label": {
                                  fontSize: "0.6rem",
                                  px: 1,
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" size="small">
          Cancel
        </Button>
        <Button
          onClick={handleImportFunction}
          variant="contained"
          disabled={!selectedFunction || isLoading}
          color="warning"
          size="small"
        >
          Import Function
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataPortFunctionDialog;
