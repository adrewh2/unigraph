import {
  Box,
  Button,
  CircularProgress,
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
  const [isCancelling, setIsCancelling] = useState(false);

  // Use state directly from the store for more responsive UI
  const { jobStatus } = useActiveLayoutStore();
  const isJobRunning = jobStatus.isRunning;

  // Format the time as mm:ss
  const formattedTime = () => {
    const minutes = Math.floor(selectLayoutJobDuration() / 60);
    const seconds = selectLayoutJobDuration() % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      console.log("Cancelling layout computation");

      // Cancel the layout computation in the worker
      LayoutEngine.cancelCurrentLayout();

      // Allow UI to update to cancelling state
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Ensure the job is marked as cancelled in the store
      cancelLayoutJob();
    } catch (error) {
      console.error("Error cancelling layout:", error);
      cancelLayoutJob();
    }
  };

  // Start a timer to update the elapsed time
  useEffect(() => {
    if (!isJobRunning) {
      // Reset cancelling state when job is no longer running
      setIsCancelling(false);
      return;
    }

    const timer = setInterval(() => {
      // Force a re-render to update the displayed time
      setForceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isJobRunning]);

  // Debug logging
  useEffect(() => {
    console.log(
      "Layout job status:",
      isJobRunning ? "RUNNING" : "NOT RUNNING",
      jobStatus
    );
  }, [isJobRunning, jobStatus]);

  return (
    <Dialog
      open={isJobRunning || isCancelling}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1500 }}
    >
      <DialogTitle>
        {isCancelling ? "Cancelling Layout..." : "Computing Layout"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {isCancelling
              ? `Cancelling ${jobStatus.layoutType} layout computation...`
              : `Computing ${jobStatus.layoutType} layout...`}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Time elapsed: {formattedTime()}
          </Typography>
        </Box>
        {isCancelling ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <LinearProgress
            variant={jobStatus.progress ? "determinate" : "indeterminate"}
            value={jobStatus.progress || 0}
            sx={{ my: 2 }}
          />
        )}
        <Typography variant="caption" color="textSecondary">
          {isCancelling
            ? "Cancelling layout computation..."
            : "Layout computations for large graphs may take several seconds."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="primary"
          variant="contained"
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelling..." : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
