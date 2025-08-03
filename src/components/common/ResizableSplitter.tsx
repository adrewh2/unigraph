import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ResizableSplitter.css";

interface ResizableSplitterProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelWidth: number;
  onWidthChange: (width: number) => void;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  splitterWidth?: number;
  className?: string;
}

const ResizableSplitter: React.FC<ResizableSplitterProps> = ({
  leftPanel,
  rightPanel,
  leftPanelWidth,
  onWidthChange,
  minLeftWidth = 200,
  maxLeftWidth = 600,
  splitterWidth = 6,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.clientX);
      setStartWidth(leftPanelWidth);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [leftPanelWidth]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const newWidth = Math.max(
        minLeftWidth,
        Math.min(maxLeftWidth, startWidth + deltaX)
      );
      onWidthChange(newWidth);
    },
    [isDragging, startX, startWidth, minLeftWidth, maxLeftWidth, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`resizable-splitter-container ${className}`}
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        className="resizable-splitter-left-panel"
        style={{
          width: `${leftPanelWidth}px`,
          minWidth: `${minLeftWidth}px`,
          maxWidth: `${maxLeftWidth}px`,
          flexShrink: 0,
        }}
      >
        {leftPanel}
      </div>
      <div
        ref={splitterRef}
        className={`resizable-splitter-handle ${isDragging ? "dragging" : ""}`}
        style={{
          width: `${splitterWidth}px`,
          flexShrink: 0,
          cursor: "col-resize",
        }}
        onMouseDown={handleMouseDown}
      />
      <div
        className="resizable-splitter-right-panel"
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizableSplitter;
