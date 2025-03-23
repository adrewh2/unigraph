import { BackgroundVariant } from "@xyflow/react";
import React, { useEffect, useState } from "react";

interface ReactFlowConfigEditorProps {
  isDarkMode?: boolean;
  onApply: (config: ReactFlowRenderConfig) => void;
  initialConfig?: ReactFlowRenderConfig;
}

export interface ReactFlowRenderConfig {
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  nodeFontSize?: number;
  edgeStrokeWidth?: number;
  edgeFontSize?: number;
  connectionLineStyle?:
    | "default"
    | "straight"
    | "step"
    | "smoothstep"
    | "bezier";
  minimap?: boolean;
  backgroundVariant?: BackgroundVariant;
  backgroundGap?: number;
  backgroundSize?: number;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
}

export const DEFAULT_REACTFLOW_CONFIG: ReactFlowRenderConfig = {
  nodeBorderRadius: 4,
  nodeStrokeWidth: 1,
  nodeFontSize: 12,
  edgeStrokeWidth: 1,
  edgeFontSize: 10,
  connectionLineStyle: "bezier",
  minimap: true,
  backgroundVariant: BackgroundVariant.Dots,
  backgroundGap: 12,
  backgroundSize: 1,
  snapToGrid: false,
  snapGrid: [15, 15],
};

const ReactFlowConfigEditor: React.FC<ReactFlowConfigEditorProps> = ({
  isDarkMode = true,
  onApply,
  initialConfig = DEFAULT_REACTFLOW_CONFIG,
}) => {
  const [config, setConfig] = useState<ReactFlowRenderConfig>(
    initialConfig || DEFAULT_REACTFLOW_CONFIG
  );

  useEffect(() => {
    setConfig(initialConfig || DEFAULT_REACTFLOW_CONFIG);
  }, [initialConfig]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target as HTMLInputElement;

    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = parseFloat(value);
    } else if (type === "checkbox") {
      parsedValue = (event.target as HTMLInputElement).checked;
    }

    setConfig({
      ...config,
      [name]: parsedValue,
    });
  };

  const handleApply = () => {
    onApply(config);
  };

  const formStyle = {
    color: isDarkMode ? "#e2e8f0" : "#1f2937",
    fontSize: "13px",
    padding: "8px 0",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "2px",
    fontSize: "11px",
    color: isDarkMode ? "#94a3b8" : "#4b5563",
  };

  const controlGroupStyle = {
    marginBottom: "8px",
  };

  const sectionStyle = {
    marginBottom: "8px",
    borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    paddingBottom: "6px",
  };

  const headerStyle = {
    fontSize: "12px",
    marginTop: 0,
    marginBottom: "4px",
    fontWeight: "500",
    color: isDarkMode ? "#d1d5db" : "#111827",
  };

  const mainHeaderStyle = {
    fontSize: "14px",
    marginTop: 0,
    marginBottom: "8px",
    fontWeight: "600",
    paddingBottom: "6px",
    borderBottom: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    color: isDarkMode ? "#f3f4f6" : "#111827",
  };

  const inputStyle = {
    width: "100%",
    padding: "4px 6px",
    height: "26px",
    backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
    color: isDarkMode ? "#f3f4f6" : "#1f2937",
    border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
    borderRadius: "4px",
    fontSize: "11px",
    outline: "none",
  };

  const rangeContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const rangeStyle = {
    ...inputStyle,
    flex: 1,
    height: "4px",
    padding: 0,
  };

  const _valueStyle = {
    fontSize: "10px",
    color: isDarkMode ? "#94a3b8" : "#6b7280",
    width: "24px",
    textAlign: "right" as const,
  };

  const checkboxContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "6px",
  };

  const checkboxStyle = {
    margin: 0,
  };

  const checkboxLabelStyle = {
    fontSize: "11px",
    margin: 0,
  };

  const buttonStyle = {
    padding: "6px 12px",
    backgroundColor: isDarkMode ? "#3b82f6" : "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    width: "100%",
  };

  return (
    <div style={formStyle}>
      <h3 style={mainHeaderStyle}>ReactFlow Display Settings</h3>

      <div style={sectionStyle}>
        <h4 style={headerStyle}>Node Settings</h4>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="nodeBorderRadius">
            Border Radius: {config.nodeBorderRadius}px
          </label>
          <div style={rangeContainerStyle}>
            <input
              type="range"
              id="nodeBorderRadius"
              name="nodeBorderRadius"
              min="0"
              max="20"
              step="1"
              value={config.nodeBorderRadius}
              onChange={handleChange}
              style={rangeStyle}
            />
          </div>
        </div>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="nodeStrokeWidth">
            Stroke Width: {config.nodeStrokeWidth}px
          </label>
          <div style={rangeContainerStyle}>
            <input
              type="range"
              id="nodeStrokeWidth"
              name="nodeStrokeWidth"
              min="0"
              max="5"
              step="0.5"
              value={config.nodeStrokeWidth}
              onChange={handleChange}
              style={rangeStyle}
            />
          </div>
        </div>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="nodeFontSize">
            Font Size: {config.nodeFontSize}px
          </label>
          <div style={rangeContainerStyle}>
            <input
              type="range"
              id="nodeFontSize"
              name="nodeFontSize"
              min="8"
              max="20"
              step="1"
              value={config.nodeFontSize}
              onChange={handleChange}
              style={rangeStyle}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h4 style={headerStyle}>Edge Settings</h4>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="edgeStrokeWidth">
            Stroke Width: {config.edgeStrokeWidth}px
          </label>
          <div style={rangeContainerStyle}>
            <input
              type="range"
              id="edgeStrokeWidth"
              name="edgeStrokeWidth"
              min="0.5"
              max="5"
              step="0.5"
              value={config.edgeStrokeWidth}
              onChange={handleChange}
              style={rangeStyle}
            />
          </div>
        </div>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="connectionLineStyle">
            Connection Style
          </label>
          <select
            id="connectionLineStyle"
            name="connectionLineStyle"
            value={config.connectionLineStyle}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="default">Default</option>
            <option value="straight">Straight</option>
            <option value="step">Step</option>
            <option value="smoothstep">Smooth Step</option>
            <option value="bezier">Bezier</option>
          </select>
        </div>
      </div>

      <div style={sectionStyle}>
        <h4 style={headerStyle}>Background</h4>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="backgroundVariant">
            Style
          </label>
          <select
            id="backgroundVariant"
            name="backgroundVariant"
            value={config.backgroundVariant}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value={BackgroundVariant.Dots}>Dots</option>
            <option value={BackgroundVariant.Lines}>Lines</option>
            <option value={BackgroundVariant.Cross}>Cross</option>
          </select>
        </div>

        <div style={controlGroupStyle}>
          <label style={labelStyle} htmlFor="backgroundGap">
            Gap: {config.backgroundGap}px
          </label>
          <div style={rangeContainerStyle}>
            <input
              type="range"
              id="backgroundGap"
              name="backgroundGap"
              min="5"
              max="30"
              step="1"
              value={config.backgroundGap}
              onChange={handleChange}
              style={rangeStyle}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="minimap"
            name="minimap"
            checked={config.minimap}
            onChange={handleChange}
            style={checkboxStyle}
          />
          <label style={checkboxLabelStyle} htmlFor="minimap">
            Show Minimap
          </label>
        </div>

        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="snapToGrid"
            name="snapToGrid"
            checked={config.snapToGrid}
            onChange={handleChange}
            style={checkboxStyle}
          />
          <label style={checkboxLabelStyle} htmlFor="snapToGrid">
            Snap to Grid
          </label>
        </div>
      </div>

      <button style={buttonStyle} onClick={handleApply}>
        Apply Settings
      </button>
    </div>
  );
};

export default ReactFlowConfigEditor;
