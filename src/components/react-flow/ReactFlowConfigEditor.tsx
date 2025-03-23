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
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "4px",
    fontSize: "12px",
  };

  const groupStyle = {
    marginBottom: "16px",
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
    color: isDarkMode ? "#f3f4f6" : "#1f2937",
    border: `1px solid ${isDarkMode ? "#4b5563" : "#d1d5db"}`,
    borderRadius: "4px",
    outline: "none",
  };

  const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: isDarkMode ? "#3b82f6" : "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "8px",
    width: "100%",
  };

  return (
    <div style={formStyle}>
      <h3 style={{ marginTop: 0 }}>ReactFlow Display Settings</h3>

      <div style={groupStyle}>
        <h4 style={{ marginTop: 0, fontSize: "14px" }}>Node Settings</h4>

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="nodeBorderRadius">
            Border Radius
          </label>
          <input
            type="range"
            id="nodeBorderRadius"
            name="nodeBorderRadius"
            min="0"
            max="20"
            step="1"
            value={config.nodeBorderRadius}
            onChange={handleChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px" }}>0</span>
            <span style={{ fontSize: "10px" }}>{config.nodeBorderRadius}</span>
            <span style={{ fontSize: "10px" }}>20</span>
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="nodeStrokeWidth">
            Stroke Width
          </label>
          <input
            type="range"
            id="nodeStrokeWidth"
            name="nodeStrokeWidth"
            min="0"
            max="5"
            step="0.5"
            value={config.nodeStrokeWidth}
            onChange={handleChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px" }}>0</span>
            <span style={{ fontSize: "10px" }}>{config.nodeStrokeWidth}</span>
            <span style={{ fontSize: "10px" }}>5</span>
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="nodeFontSize">
            Font Size
          </label>
          <input
            type="range"
            id="nodeFontSize"
            name="nodeFontSize"
            min="8"
            max="20"
            step="1"
            value={config.nodeFontSize}
            onChange={handleChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px" }}>8</span>
            <span style={{ fontSize: "10px" }}>{config.nodeFontSize}px</span>
            <span style={{ fontSize: "10px" }}>20</span>
          </div>
        </div>
      </div>

      <div style={groupStyle}>
        <h4 style={{ marginTop: 0, fontSize: "14px" }}>Edge Settings</h4>

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="edgeStrokeWidth">
            Stroke Width
          </label>
          <input
            type="range"
            id="edgeStrokeWidth"
            name="edgeStrokeWidth"
            min="0.5"
            max="5"
            step="0.5"
            value={config.edgeStrokeWidth}
            onChange={handleChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px" }}>0.5</span>
            <span style={{ fontSize: "10px" }}>{config.edgeStrokeWidth}</span>
            <span style={{ fontSize: "10px" }}>5</span>
          </div>
        </div>

        <div style={{ marginBottom: "8px" }}>
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

      <div style={groupStyle}>
        <h4 style={{ marginTop: 0, fontSize: "14px" }}>Background</h4>

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="backgroundVariant">
            Background Style
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

        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle} htmlFor="backgroundGap">
            Background Gap
          </label>
          <input
            type="range"
            id="backgroundGap"
            name="backgroundGap"
            min="5"
            max="30"
            step="1"
            value={config.backgroundGap}
            onChange={handleChange}
            style={inputStyle}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px" }}>5</span>
            <span style={{ fontSize: "10px" }}>{config.backgroundGap}px</span>
            <span style={{ fontSize: "10px" }}>30</span>
          </div>
        </div>
      </div>

      <div style={groupStyle}>
        <h4 style={{ marginTop: 0, fontSize: "14px" }}>Other Settings</h4>

        <div
          style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}
        >
          <input
            type="checkbox"
            id="minimap"
            name="minimap"
            checked={config.minimap}
            onChange={handleChange}
            style={{ marginRight: "8px" }}
          />
          <label htmlFor="minimap">Show Minimap</label>
        </div>

        <div
          style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}
        >
          <input
            type="checkbox"
            id="snapToGrid"
            name="snapToGrid"
            checked={config.snapToGrid}
            onChange={handleChange}
            style={{ marginRight: "8px" }}
          />
          <label htmlFor="snapToGrid">Snap to Grid</label>
        </div>
      </div>

      <button style={buttonStyle} onClick={handleApply}>
        Apply Settings
      </button>
    </div>
  );
};

export default ReactFlowConfigEditor;
