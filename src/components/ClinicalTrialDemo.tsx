import { Box, Button, Divider, Tab, Tabs, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import {
  clinicalTrialAnalyticsPipeline,
  getClinicalTrialDemoNodes,
} from "../data/clinicalTrialTypeSystem";
import TypeSystemPanel from "./reactflow/TypeSystemPanel";

// Add the property definition interface
interface PropertyDefinition {
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
}

/**
 * Component that showcases the clinical trial analytics pipeline
 */
const ClinicalTrialDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLoadDemo = useCallback(() => {
    // In a real implementation, we would load the ReactFlow nodes and edges
    console.log("Loading clinical trial demo...", getClinicalTrialDemoNodes());
    setDemoLoaded(true);
  }, []);

  // Render counts for different entity types
  const typesCount = clinicalTrialAnalyticsPipeline.types.length;
  const instancesCount = clinicalTrialAnalyticsPipeline.instances.length;
  const functionsCount = clinicalTrialAnalyticsPipeline.functions.length;
  const connectionsCount = clinicalTrialAnalyticsPipeline.connections.length;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Analytics Pipeline" />
          <Tab label={`Data Types (${typesCount})`} />
          <Tab label={`Data Instances (${instancesCount})`} />
          <Tab label={`Analysis Functions (${functionsCount})`} />
        </Tabs>
      </Box>

      <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}>
        {activeTab === 0 && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5">
                Clinical Trial Analytics Pipeline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This demo shows a data processing pipeline for analyzing
                clinical trial data, connecting patient data, vital signs, lab
                results, adverse events, and efficacy measurements through a
                series of analysis functions.
              </Typography>
              <Box
                sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLoadDemo}
                  sx={{ mt: 1 }}
                >
                  {demoLoaded ? "Reset Demo Pipeline" : "Load Demo Pipeline"}
                </Button>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {typesCount} data types • {instancesCount} data instances •{" "}
                    {functionsCount} functions • {connectionsCount} connections
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <TypeSystemPanel
                initialData={
                  demoLoaded ? getClinicalTrialDemoNodes() : undefined
                }
                // keyPrefix="clinical-"
              />
            </Box>
          </Box>
        )}

        {/* Additional tabs for browsing the type system entities would be similar to TypeSystemDemo.tsx */}
        {activeTab === 1 && (
          <Box sx={{ overflowY: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Data Types
            </Typography>
            <Typography variant="body2" paragraph>
              The following data types are defined in the clinical trial
              analytics pipeline:
            </Typography>
            {/* Display data types here */}
            {clinicalTrialAnalyticsPipeline.types.map((type) => (
              <Box
                key={type.id}
                sx={{
                  mb: 3,
                  border: "1px solid #e0e0e0",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {type.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {type.description}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Properties:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {Object.entries(type.properties).map(
                    ([propName, propDef]) => {
                      // Fix: Add type assertion to properly type the property definition
                      const typedPropDef = propDef as PropertyDefinition;
                      return (
                        <Box key={propName} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{propName}</strong>: {typedPropDef.type}
                            {typedPropDef.required && (
                              <span style={{ color: "red", marginLeft: 4 }}>
                                *
                              </span>
                            )}
                          </Typography>
                          {typedPropDef.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ pl: 2 }}
                            >
                              {typedPropDef.description}
                            </Typography>
                          )}
                        </Box>
                      );
                    }
                  )}
                </Box>
                {type.tags && (
                  <Box
                    sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
                  >
                    {type.tags.map((tag: string) => (
                      <Box
                        key={tag}
                        sx={{
                          bgcolor: "rgba(0,0,0,0.08)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Similar views for instances and functions tabs */}
      </Box>
    </Box>
  );
};

export default ClinicalTrialDemo;
