import {
  Workspace as AppShellWorkspace,
  ThemeId,
  WorkspaceConfig,
  WorkspaceProvider,
  defaultViews,
  registerViews,
} from "app-shell";
import "app-shell/dist/app-shell.css";
import React from "react";
import AIChatPanel from "../ai/AIChatPanel";

// Create custom views that include our AIChatPanel
const aiChatView = {
  id: "ai-chat",
  title: "AI Chat",
  icon: "💬",
  component: (props: any) => <AIChatPanel isDarkMode={true} {...props} />,
};

// Register all views as a single array
registerViews([...defaultViews, aiChatView]);

const AppShellView: React.FC = () => {
  // Create a sample workspace configuration

  const workspaceConfig: Partial<WorkspaceConfig> = {
    theme: "dark" as ThemeId,
    leftPane: {
      defaultSize: 250,
      maxSize: 500,
      minSize: 100,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
    rightPane: {
      defaultSize: 300,
      maxSize: 400,
      minSize: 150,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
    bottomPane: {
      defaultSize: 200,
      maxSize: 300,
      minSize: 100,
      collapseThreshold: 80,
      collapsedSize: 8,
    },
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <WorkspaceProvider initialConfig={workspaceConfig}>
        <AppShellWorkspace />
      </WorkspaceProvider>
    </div>
  );
};

export default AppShellView;
