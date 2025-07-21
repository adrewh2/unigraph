import {
  Workspace as AppShellWorkspace,
  WorkspaceConfig,
} from "@aesgraph/app-shell";
import "@aesgraph/app-shell/dist/app-shell.css";
import React from "react";
import { ThemeWorkspaceProvider } from "../providers/ThemeWorkspaceProvider";

interface AppShellWorkspaceWrapperProps {
  workspaceConfig: Partial<WorkspaceConfig>;
  style?: React.CSSProperties;
}

const AppShellWorkspaceWrapper: React.FC<AppShellWorkspaceWrapperProps> = ({
  workspaceConfig,
  style,
}) => {
  return (
    <ThemeWorkspaceProvider initialConfig={workspaceConfig}>
      <AppShellWorkspace fullViewport={false} />
    </ThemeWorkspaceProvider>
  );
};

export default AppShellWorkspaceWrapper;
