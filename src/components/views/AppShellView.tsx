import {
  Workspace as AppShellWorkspace,
  ThemeId,
  Theme,
  WorkspaceConfig,
  WorkspaceProvider,
  ThemeProvider,
  ThemeVariables,
  defaultViews,
  registerViews,
  ExampleThemedComponent,
  useTheme,
  themes,
  commonSizes,
  getColor,
} from "app-shell";
import "app-shell/dist/app-shell.css";
import React from "react";
import AIChatPanel from "../ai/AIChatPanel";
import SemanticWebQueryPanel from "../semantic/SemanticWebQueryPanel";

// Create custom views that include our AIChatPanel and SemanticWebQueryPanel
const aiChatView = {
  id: "ai-chat",
  title: "AI Chat",
  icon: "💬",
  component: (props: any) => <AIChatPanel isDarkMode={true} {...props} />,
};

const semanticWebQueryView = {
  id: "semantic-web-query",
  title: "SPARQL Query",
  icon: "🔍",
  component: (props: any) => (
    <SemanticWebQueryPanel theme={props.theme} {...props} />
  ),
};

// Create a themed component using the useTheme hook
const CustomThemedPanel: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: theme.sizes.spacing.lg,
        backgroundColor: getColor(theme.colors, "surface"),
        borderRadius: theme.sizes.borderRadius.md,
        border: `1px solid ${getColor(theme.colors, "border")}`,
        color: getColor(theme.colors, "text"),
        margin: theme.sizes.spacing.md,
      }}
    >
      <h3
        style={{
          color: getColor(theme.colors, "primary"),
          fontSize: theme.sizes.fontSize.lg,
          marginBottom: theme.sizes.spacing.sm,
        }}
      >
        Custom Themed Component
      </h3>
      <p
        style={{
          color: getColor(theme.colors, "textSecondary"),
          fontSize: theme.sizes.fontSize.sm,
        }}
      >
        This component demonstrates how external projects can create custom
        themes and use all the theming utilities from app-shell.
      </p>
      <ExampleThemedComponent
        title="Demo Component"
        content="This shows theme inheritance working!"
      />
    </div>
  );
};

const customThemedPanelView = {
  id: "custom-themed-panel",
  title: "Theme Demo",
  icon: "🎨",
  component: (props: any) => <CustomThemedPanel {...props} />,
};

// Register all views as a single array
registerViews([...defaultViews, aiChatView, semanticWebQueryView, customThemedPanelView]);

// Example: Create a custom theme for demonstration
const customUnigraphTheme: Theme = {
  id: "unigraph-custom" as ThemeId,
  name: "Unigraph Custom",
  colors: {
    primary: "#4f46e5",
    secondary: "#06b6d4",
    accent: "#f59e0b",
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    backgroundTertiary: "#334155",
    surface: "#475569",
    surfaceHover: "#64748b",
    surfaceActive: "#94a3b8",
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    textInverse: "#0f172a",
    border: "#475569",
    borderFocus: "#4f46e5",
    borderHover: "#64748b",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",
    link: "#06b6d4",
    linkHover: "#0891b2",
  },
  sizes: commonSizes, // Use the shared size definitions
};

// Register our custom theme (this demonstrates how external projects can add themes)
// Note: In a real implementation, this could be done via a theme registration API
Object.assign(themes, { "unigraph-custom": customUnigraphTheme });

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
      {/* Wrap with ThemeProvider to use our custom theme */}
      <ThemeProvider themeId="unigraph-custom">
        <ThemeVariables>
          <WorkspaceProvider initialConfig={workspaceConfig}>
            <AppShellWorkspace />
          </WorkspaceProvider>
        </ThemeVariables>
      </ThemeProvider>
    </div>
  );
};

export default AppShellView;
