import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { LayoutEngine } from "../../core/layouts/LayoutEngine";
import useActiveLayoutStore, {
  cancelLayoutJob,
  selectLayoutJobDuration,
} from "../../store/activeLayoutStore";

export const LayoutComputationDialog: React.FC = () => {
  const [forceUpdate, setForceUpdate] = useState(0);

  // Use state snapshot directly from the store for more responsive UI
  const { jobStatus } = useActiveLayoutStore();
  const isJobRunning = jobStatus.isRunning;

  // Format the time as mm:ss
  const formattedTime = () => {
    const minutes = Math.floor(selectLayoutJobDuration() / 60);
    const seconds = selectLayoutJobDuration() % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    LayoutEngine.cancelCurrentLayout();
    cancelLayoutJob();
  };

  // Start a timer to update the elapsed time
  useEffect(() => {
    if (!isJobRunning) return;

    const timer = setInterval(() => {
      // Force a re-render to update the displayed time
      setForceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isJobRunning]);

  // Log the dialog state for debugging
  useEffect(() => {
    console.log(
      "Layout job status:",
      isJobRunning ? "RUNNING" : "NOT RUNNING",
      jobStatus
    );
  }, [isJobRunning, jobStatus]);

  return (
    <Dialog
      open={isJobRunning}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1500 }} // Ensure high z-index so it appears above other content
    >
      <DialogTitle>Computing Layout</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Computing {jobStatus.layoutType} layout...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Time elapsed: {formattedTime()}
          </Typography>
        </Box>
        <LinearProgress
          variant={jobStatus.progress ? "determinate" : "indeterminate"}
          value={jobStatus.progress || 0}
          sx={{ my: 2 }}
        />
        <Typography variant="caption" color="textSecondary">
          Layout computations for large graphs may take several seconds.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary" variant="contained">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
