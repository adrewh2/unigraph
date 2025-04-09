import DataObjectIcon from "@mui/icons-material/DataObject";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
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
import React, { useEffect, useState } from "react";

// Mock data registry - in a real app, this would come from your data service
const mockDataInstances = [
  {
    id: "data1",
    name: "User Profile",
    type: "Person",
    tags: ["validated", "active"],
  },
  {
    id: "data2",
    name: "Customer Database",
    type: "Person",
    tags: ["enterprise"],
  },
  {
    id: "data3",
    name: "Product Catalog",
    type: "Product",
    tags: ["inventory"],
  },
  {
    id: "data4",
    name: "Sales Records",
    type: "Transaction",
    tags: ["financial"],
  },
  { id: "data5", name: "User List", type: "Person", tags: ["active"] },
  {
    id: "data6",
    name: "Employee Directory",
    type: "Person",
    tags: ["internal"],
  },
  { id: "data7", name: "Event Log", type: "Event", tags: ["system"] },
  {
    id: "data8",
    name: "Analytics Dashboard",
    type: "Statistics",
    tags: ["dashboard"],
  },
  {
    id: "data9",
    name: "Billing Information",
    type: "Payment",
    tags: ["financial"],
  },
  {
    id: "data10",
    name: "Marketing Campaign",
    type: "Campaign",
    tags: ["active"],
  },
];

interface PortConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  isInput: boolean;
  portName: string;
  portType: string;
  onConnect: (instanceId: string) => void;
}

const PortConnectionDialog: React.FC<PortConnectionDialogProps> = ({
  open,
  onClose,
  isInput,
  portName,
  portType,
  onConnect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [availableInstances, setAvailableInstances] = useState<
    typeof mockDataInstances
  >([]);

  // Simulate loading data from a registry
  useEffect(() => {
    setIsLoading(true);

    // Filter instances by type to show only compatible ones
    const timer = setTimeout(() => {
      const filteredInstances = mockDataInstances.filter(
        (instance) => instance.type.toLowerCase() === portType.toLowerCase()
      );
      setAvailableInstances(filteredInstances);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [portType]);

  // Filter instances based on search term
  const filteredInstances = availableInstances.filter(
    (instance) =>
      instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstance(instanceId);
  };

  const handleConnect = () => {
    if (selectedInstance) {
      onConnect(selectedInstance);
    }
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
          <Typography variant="h6">
            Connect {isInput ? "Input" : "Output"}: {portName}
          </Typography>
          <Chip
            label={portType}
            color={isInput ? "primary" : "success"}
            size="small"
            icon={<DataObjectIcon />}
          />
        </Box>
      </DialogTitle>

      <Box px={3} py={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={`Search ${portType} instances`}
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
        ) : filteredInstances.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No compatible {portType} instances found
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DataObjectIcon />}
            >
              Create New {portType} Instance
            </Button>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: "50vh", overflow: "auto" }}>
            {filteredInstances.map((instance) => (
              <ListItem key={instance.id} disablePadding>
                <ListItemButton
                  selected={selectedInstance === instance.id}
                  onClick={() => handleSelectInstance(instance.id)}
                  sx={{
                    borderLeft: selectedInstance === instance.id ? 3 : 0,
                    borderColor: "primary.main",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <StorageIcon
                      color={instance.type === "Person" ? "info" : "success"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={instance.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {instance.type}
                        </Typography>
                        <Box mt={0.5}>
                          {instance.tags.map((tag) => (
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
          onClick={handleConnect}
          variant="contained"
          disabled={!selectedInstance || isLoading}
          color={isInput ? "primary" : "success"}
          size="small"
        >
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortConnectionDialog;
