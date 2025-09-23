import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useMemo, useRef, useState } from "react";
import YouTube from "react-youtube";
import { Annotation, listAnnotations } from "../../api/annotationsApi";
import { createDocument, updateDocument } from "../../api/documentsApi";
import { useAuth } from "../../hooks/useAuth";
import LexicalEditorV3 from "../applets/Lexical/LexicalEditorV3";

export interface YouTubePlayerViewProps {
  videoId: string;
  title?: string;
}

const YouTubePlayerView: React.FC<YouTubePlayerViewProps> = ({
  videoId,
  title,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [_existingAnnotationId, setExistingAnnotationId] = useState<
    string | null
  >(null);
  const storageKey = useMemo(() => `youtube-note-doc-${videoId}`, [videoId]);

  // YouTube player state tracking
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [_duration, _setDuration] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const playerRef = useRef<any>(null);
  const insertTimestampRef = useRef<((timestamp: string) => void) | null>(null);

  // Helper function to format timestamp
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  };

  // YouTube player event handlers
  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    setPlayerReady(true);
  };

  const onPlayerStateChange = (event: any) => {
    // Update current time periodically when playing
    if (event.data === 1) {
      // Playing
      const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      }, 1000);

      // Store interval ID to clear later
      (event.target as any)._timeInterval = interval;
    } else if (event.target._timeInterval) {
      // Clear interval when paused/stopped
      clearInterval(event.target._timeInterval);
      delete event.target._timeInterval;
    }
  };

  // Add styles for the YouTube iframe
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .youtube-iframe {
        width: 100% !important;
        height: 100% !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Load existing annotation for this video
        const annotations = (await listAnnotations({
          userId: user?.id,
          parentResourceType: "youtube_video",
          parentResourceId: videoId,
          includeContent: true,
        })) as Annotation[];

        let annotationContent = "";
        if (annotations && annotations.length > 0) {
          const a = annotations[0];
          setExistingAnnotationId(a.id);
          let data = a.data as any;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch {
              // ignore
            }
          }
          annotationContent = data?.comment || "";
        }

        // If there is an existing annotation, prefer its id for updates
        // so we don't create duplicates.
        if (annotations && annotations.length > 0) {
          const _existingAnnotation = annotations[0];
        }

        // Ensure a backing document exists for LexicalEditorV3
        let existingDocId = localStorage.getItem(storageKey);
        if (!existingDocId) {
          const newDoc = await createDocument({
            title: `${title || videoId} Notes`,
            content: annotationContent || "",
            extension: "txt",
            metadata: {
              type: "youtube_note",
              references: [
                {
                  referenceEntityType: "youtube_video",
                  referenceId: videoId,
                  referenceTags: [],
                  referenceRelationType: "parent",
                },
              ],
            },
            data: {},
          });
          existingDocId = newDoc.id;
          localStorage.setItem(storageKey, existingDocId);
        } else if (annotationContent) {
          // Sync annotation content into existing doc if present
          await updateDocument({
            id: existingDocId,
            content: annotationContent,
          });
        }

        if (isMounted) setDocumentId(existingDocId);
      } catch (err) {
        console.error("YouTube notes init failed:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [storageKey, title, videoId, user?.id]);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
    } as any,
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        {title && (
          <h3 style={{ margin: 0, color: getColor(theme.colors, "text") }}>
            {title}
          </h3>
        )}
      </div>

      <div
        style={{
          aspectRatio: "4/3",
          width: "100%",
          backgroundColor: getColor(theme.colors, "surface"),
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
        }}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          style={{ width: "100%", height: "100%" }}
          iframeClassName="youtube-iframe"
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          backgroundColor: getColor(theme.colors, "surface"),
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
            fontWeight: 600,
            color: getColor(theme.colors, "text"),
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Notes</span>
          {playerReady && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "12px",
                  color: getColor(theme.colors, "textSecondary"),
                  fontFamily: "monospace",
                }}
              >
                {formatTimestamp(currentTime)}
              </span>
              <button
                onClick={() => {
                  const timestamp = formatTimestamp(currentTime);
                  if (insertTimestampRef.current) {
                    insertTimestampRef.current(timestamp);
                  }
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  backgroundColor: getColor(theme.colors, "primary"),
                  color: getColor(theme.colors, "text"),
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                title="Insert current timestamp (timestamps can be deleted with Delete/Backspace keys)"
              >
                Insert Timestamp
              </button>
            </div>
          )}
        </div>
        <div
          style={{
            padding: "4px 12px",
            fontSize: "11px",
            color: getColor(theme.colors, "textSecondary"),
            backgroundColor: getColor(theme.colors, "surface"),
            borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          }}
        >
          💡 Tip: Timestamps can be deleted using Delete or Backspace keys when
          selected
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {documentId ? (
            <LexicalEditorV3
              documentId={documentId}
              onTimestampInsert={(insertFn) => {
                insertTimestampRef.current = insertFn;
              }}
              onChange={async (text, serializedState) => {
                try {
                  if (!user?.id) {
                    // Not signed in; skip saving to avoid invisible rows
                    return;
                  }

                  // Create annotation payload with proper structure (commented out for now)
                  const _annotationData = {
                    type: "text_selection" as const,
                    comment: serializedState || text, // Save full Lexical serialization, fallback to text
                    tags: [],
                    page_url: `https://www.youtube.com/watch?v=${videoId}`,
                  };

                  // Notify Resource Manager to refresh annotations
                  window.dispatchEvent(new CustomEvent("annotationsUpdated"));
                } catch (e) {
                  console.warn("Failed to save YouTube note annotation:", e);
                }
              }}
            />
          ) : (
            <div style={{ padding: 12, color: getColor(theme.colors, "text") }}>
              Loading notes...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerView;
