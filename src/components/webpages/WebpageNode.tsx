import React from "react";
import { Webpage } from "../../api/webpagesApi";

const WebpageNode = (props: any) => {
  const webpage: Webpage | undefined = props.data?.webpage;
  if (!webpage) return <div>Invalid webpage</div>;
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #d1d5db",
        borderRadius: 10,
        boxShadow: "0 2px 8px 0 rgba(25, 118, 210, 0.07)",
        padding: "10px 14px",
        minWidth: 160,
        maxWidth: 260,
        width: "fit-content",
        fontFamily: "inherit",
        fontSize: 13,
        color: "#222",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          marginBottom: 2,
          color: "#1976d2",
          whiteSpace: "pre-line",
          wordBreak: "break-word",
        }}
      >
        {webpage.title || "Webpage"}
      </div>
      {/* Screenshot only (no iframe or page embed) */}
      {webpage.screenshot_url && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "4px 0",
          }}
        >
          <img
            src={webpage.screenshot_url}
            alt="webpage screenshot"
            style={{
              maxWidth: 120,
              maxHeight: 90,
              borderRadius: 6,
              border: "1px solid #e0e0e0",
              objectFit: "cover",
              background: "#f5f6fa",
              display: "block",
            }}
          />
        </div>
      )}
      {/* URL */}
      {webpage.url && (
        <a
          href={webpage.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1976d2",
            fontSize: 12,
            textDecoration: "underline",
            marginTop: 2,
            marginBottom: 2,
            wordBreak: "break-all",
            display: "block",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {webpage.url.replace(/^https?:\/\//, "").slice(0, 40)}
          {webpage.url.length > 40 ? "..." : ""}
        </a>
      )}
    </div>
  );
};

export default WebpageNode;
