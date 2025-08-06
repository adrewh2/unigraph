import { useTheme } from "@aesgraph/app-shell";
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Tag,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Annotation,
  listAnnotations,
  saveAnnotation,
  TextSelectionAnnotationData,
} from "../../api/annotationsApi";
import { getWebpage } from "../../api/webpagesApi";
import useAppConfigStore from "../../store/appConfigStore";
import { useHtmlPageViewerStore } from "../../store/htmlPageViewerStore";
import { addNotification } from "../../store/notificationStore";
import { useUserStore } from "../../store/userStore";
import AnnotationDialog from "./AnnotationDialog";

interface HtmlPageViewerProps {
  resourceId?: string;
  url?: string;
  title?: string;
  tabId?: string;
  onClose?: () => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
  text: string;
}

const HtmlPageViewer: React.FC<HtmlPageViewerProps> = ({
  resourceId,
  url,
  title,
  tabId,
  onClose,
}) => {
  const { theme } = useTheme();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Start with false to prevent flicker
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [currentTitle, setCurrentTitle] = useState<string>(title || "");
  const [loadedResourceId, setLoadedResourceId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  );
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotationCard, setShowAnnotationCard] =
    useState<Annotation | null>(null);

  // Refs
  const processedResourceIds = useRef<Set<string>>(new Set());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Store hooks
  const { user } = useUserStore();
  const { currentSceneGraph } = useAppConfigStore();

  // Get store functions
  const {
    getContent,
    setContent,
    setLoading: setStoreLoading,
    setError: setStoreError,
    hasValidContent,
  } = useHtmlPageViewerStore();

  // Inject script to capture selection in iframe
  const injectSelectionScript = useCallback(() => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) return;

      // Inject a script that captures selection and communicates with parent
      const script = `
        (function() {
          let lastSelection = '';
          
          // Capture selection on mouseup
          document.addEventListener('mouseup', function(e) {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              lastSelection = selection.toString().trim();
              console.log('Selection captured in iframe:', lastSelection);
            }
          });
          
          // Capture selection on contextmenu
          document.addEventListener('contextmenu', function(e) {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              lastSelection = selection.toString().trim();
              console.log('Context menu selection in iframe:', lastSelection);
              
              // Send message to parent
              window.parent.postMessage({
                type: 'iframe-selection',
                selection: lastSelection,
                x: e.clientX,
                y: e.clientY
              }, '*');
            }
          });
          
          // Expose function to get last selection
          window.getLastSelection = function() {
            return lastSelection;
          };
        })();
      `;

      // Execute the script in the iframe
      (iframeWindow as any).eval(script);
      console.log("Selection script injected into iframe");
    } catch (error) {
      console.warn("Could not inject selection script:", error);
    }
  }, []);

  // Load annotations for the current webpage
  const loadAnnotations = useCallback(async () => {
    console.log("loadAnnotations called with:", { user: user?.id, currentUrl });

    if (!user?.id || !currentUrl) {
      console.log("loadAnnotations: missing user or currentUrl", {
        user: user?.id,
        currentUrl,
      });
      return;
    }

    console.log("Loading annotations for:", {
      userId: user.id,
      currentUrl: currentUrl,
      user: user,
    });

    try {
      // First, let's try to get all annotations for the user to see if there are any
      const allUserAnnotations = await listAnnotations({
        userId: user.id,
      });
      console.log("All user annotations:", allUserAnnotations);

      // Check if any annotations have URLs that might match
      if (allUserAnnotations.length > 0) {
        console.log("URLs from existing annotations:");
        allUserAnnotations.forEach((ann: Annotation) => {
          if (ann.parent_resource_id) {
            console.log("  -", ann.parent_resource_id);
          }
        });
      }

      // Then try the specific webpage query
      const webpageAnnotations = await listAnnotations({
        userId: user.id,
        parentResourceType: "webpage",
        parentResourceId: currentUrl,
      });

      console.log("Loaded annotations for webpage:", webpageAnnotations);
      console.log("Annotation query params:", {
        userId: user.id,
        parentResourceType: "webpage",
        parentResourceId: currentUrl,
      });
      setAnnotations(webpageAnnotations);
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
  }, [user?.id, currentUrl]);

  // Define fetchWebpageContent function with useCallback
  const fetchWebpageContent = useCallback(
    async (webpageId: string) => {
      console.log("fetchWebpageContent called with webpageId:", webpageId);
      setLoading(true);
      setStoreLoading(webpageId, true);
      setError(null);
      setStoreError(webpageId, null);

      try {
        const webpage = await getWebpage(webpageId);
        console.log("getWebpage result:", webpage);

        if (webpage && webpage.html_content) {
          console.log(
            "Setting content for resourceId:",
            webpageId,
            "Content length:",
            webpage.html_content.length,
            "URL:",
            webpage.url
          );

          // Cache the content in the store
          setContent(webpageId, {
            html: webpage.html_content,
            url: webpage.url,
            title: webpage.title || webpage.url,
            resourceId: webpageId,
          });

          setHtml(webpage.html_content);
          setCurrentUrl(webpage.url);
          setCurrentTitle(webpage.title || webpage.url);
          document.title = webpage.title || webpage.url;
          setLoadedResourceId(webpageId);
        } else {
          console.log(
            "No webpage or html_content found for webpageId:",
            webpageId
          );
          const errorMsg = "No HTML content available for this webpage";
          setError(errorMsg);
          setStoreError(webpageId, errorMsg);
        }
      } catch (err) {
        console.error("Error in fetchWebpageContent:", err);
        const errorMsg = `Error loading webpage: ${err instanceof Error ? err.message : String(err)}`;
        setError(errorMsg);
        setStoreError(webpageId, errorMsg);
      } finally {
        setLoading(false);
        setStoreLoading(webpageId, false);
      }
    },
    [setContent, setStoreLoading, setStoreError]
  );

  // Handle text selection and context menu
  const handleIframeLoad = useCallback(() => {
    console.log("Iframe loaded");
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) {
        console.log("No iframe document available");
        return;
      }

      console.log("Adding event listeners to iframe document");
      // Add event listeners to the iframe document
      iframeDoc.addEventListener("mouseup", handleTextSelection);
      iframeDoc.addEventListener("contextmenu", handleContextMenu);

      // Close context menu when clicking outside
      iframeDoc.addEventListener("click", () => {
        setContextMenu(null);
      });

      // Close context menu on escape key
      iframeDoc.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          setContextMenu(null);
        }
      });
    } catch (error) {
      console.warn(
        "Could not access iframe content due to CORS restrictions:",
        error
      );
    }

    // Try to inject selection script as fallback
    setTimeout(() => {
      injectSelectionScript();
    }, 100);
  }, [injectSelectionScript, loadAnnotations]);

  // Inject highlighting script for existing annotations
  const injectHighlightingScript = useCallback(() => {
    if (!iframeRef.current || annotations.length === 0) return;

    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) return;

      // Create highlighting script
      const annotationsJson = JSON.stringify(annotations);
      const script =
        "(function() {" +
        "const annotations = " +
        annotationsJson +
        ";" +
        "function highlightAnnotations() {" +
        "annotations.forEach(function(annotation) {" +
        "if (annotation.data && annotation.data.selected_text) {" +
        "const text = annotation.data.selected_text;" +
        "highlightText(text, annotation.id);" +
        "}" +
        "});" +
        "}" +
        "function highlightText(searchText, annotationId) {" +
        "const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);" +
        "const textNodes = [];" +
        "let node;" +
        "while (node = walker.nextNode()) { textNodes.push(node); }" +
        "textNodes.forEach(function(textNode) {" +
        "const text = textNode.textContent;" +
        "if (text && text.includes(searchText)) {" +
        "const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\\\\]\\\\]/g, '\\\\\\\\$&'), 'g');" +
        "const parts = text.split(regex);" +
        "if (parts.length > 1) {" +
        "const fragment = document.createDocumentFragment();" +
        "let partIndex = 0;" +
        "let matchIndex = 0;" +
        "while (partIndex < parts.length) {" +
        "if (parts[partIndex]) {" +
        "fragment.appendChild(document.createTextNode(parts[partIndex]));" +
        "}" +
        "if (matchIndex < text.match(regex).length) {" +
        "const span = document.createElement('span');" +
        "span.className = 'annotation-highlight';" +
        "span.setAttribute('data-annotation-id', annotationId);" +
        "span.style.backgroundColor = '#ffeb3b';" +
        "span.style.cursor = 'pointer';" +
        "span.style.borderRadius = '2px';" +
        "span.textContent = text.match(regex)[matchIndex];" +
        "span.addEventListener('click', function() {" +
        "const annotationId = this.getAttribute('data-annotation-id');" +
        "if (annotationId) {" +
        "window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');" +
        "}" +
        "});" +
        "fragment.appendChild(span);" +
        "matchIndex++;" +
        "}" +
        "partIndex++;" +
        "}" +
        "textNode.parentNode.replaceChild(fragment, textNode);" +
        "}" +
        "}" +
        "});" +
        "}" +
        "if (document.readyState === 'loading') {" +
        "document.addEventListener('DOMContentLoaded', highlightAnnotations);" +
        "} else {" +
        "highlightAnnotations();" +
        "}" +
        "})();";

      // Execute the script in the iframe
      (iframeWindow as any).eval(script);
      console.log(
        "Highlighting script injected for",
        annotations.length,
        "annotations"
      );
    } catch (error) {
      console.warn("Could not inject highlighting script:", error);
    }
  }, [annotations]);

  // Inject highlighting script when annotations change
  useEffect(() => {
    if (annotations.length > 0 && iframeRef.current) {
      setTimeout(() => {
        injectHighlightingScript();
      }, 500); // Give iframe time to load
    }
  }, [annotations, injectHighlightingScript]);

  // Add event listeners to the main document as fallback
  useEffect(() => {
    const handleMainDocumentMouseUp = (event: MouseEvent) => {
      // Only handle if we're clicking inside the iframe area
      if (iframeRef.current) {
        const iframeRect = iframeRef.current.getBoundingClientRect();

        if (
          event.clientX >= iframeRect.left &&
          event.clientX <= iframeRect.right &&
          event.clientY >= iframeRect.top &&
          event.clientY <= iframeRect.bottom
        ) {
          // Check if we clicked on an annotation highlight by checking the target
          const target = event.target as HTMLElement;
          if (
            target &&
            target.classList &&
            target.classList.contains("annotation-highlight")
          ) {
            return; // Let the iframe handle annotation clicks
          }

          handleTextSelection(event);
        }
      }
    };

    const handleMainDocumentContextMenu = (event: MouseEvent) => {
      // Only handle if we're right-clicking inside the iframe area
      if (iframeRef.current) {
        const iframeRect = iframeRef.current.getBoundingClientRect();

        if (
          event.clientX >= iframeRect.left &&
          event.clientX <= iframeRect.right &&
          event.clientY >= iframeRect.top &&
          event.clientY <= iframeRect.bottom
        ) {
          handleContextMenu(event);
        }
      }
    };

    const handleMainDocumentClick = () => {
      setContextMenu(null);
    };

    const handleMainDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setShowAnnotationCard(null);
      }
    };

    // Handle messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "iframe-selection") {
        setSelectedText(event.data.selection);
        setContextMenu({
          x: event.data.x,
          y: event.data.y,
          text: event.data.selection,
        });
      } else if (event.data && event.data.type === "show-annotation") {
        const annotation = annotations.find(
          (a) => a.id === event.data.annotationId
        );
        if (annotation) {
          setShowAnnotationCard(annotation);
        }
      }
    };

    // Add listeners to main document
    document.addEventListener("mouseup", handleMainDocumentMouseUp);
    document.addEventListener("contextmenu", handleMainDocumentContextMenu);
    document.addEventListener("click", handleMainDocumentClick);
    document.addEventListener("keydown", handleMainDocumentKeyDown);
    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("mouseup", handleMainDocumentMouseUp);
      document.removeEventListener(
        "contextmenu",
        handleMainDocumentContextMenu
      );
      document.removeEventListener("click", handleMainDocumentClick);
      document.removeEventListener("keydown", handleMainDocumentKeyDown);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleTextSelection = useCallback((event: MouseEvent) => {
    console.log("handleTextSelection called", event);

    // Try to get selection from iframe document first
    let selection: Selection | null = null;
    let selectedText = "";

    try {
      if (iframeRef.current) {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          selection = iframeDoc.getSelection();
          console.log("Iframe selection:", selection?.toString());
        }
      }
    } catch (error) {
      console.log("Could not access iframe selection:", error);
    }

    // Fallback to main window selection
    if (!selection || !selection.toString().trim()) {
      selection = window.getSelection();
      console.log("Main window selection:", selection?.toString());
    }

    if (!selection || selection.toString().trim() === "") {
      setContextMenu(null);
      return;
    }

    selectedText = selection.toString().trim();
    if (selectedText) {
      console.log("Setting context menu with text:", selectedText);
      setSelectedText(selectedText);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        text: selectedText,
      });
    }
  }, []);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    console.log("handleContextMenu called", event);
    event.preventDefault();

    // Try to get selection from iframe document first
    let selection: Selection | null = null;
    let selectedText = "";

    try {
      if (iframeRef.current) {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          selection = iframeDoc.getSelection();
          console.log("Iframe context menu selection:", selection?.toString());
        }
      }
    } catch (error) {
      console.log("Could not access iframe selection for context menu:", error);
    }

    // Fallback to main window selection
    if (!selection || !selection.toString().trim()) {
      selection = window.getSelection();
      console.log("Main window context menu selection:", selection?.toString());
    }

    if (!selection || selection.toString().trim() === "") {
      setContextMenu(null);
      return;
    }

    selectedText = selection.toString().trim();
    if (selectedText) {
      console.log(
        "Setting context menu from right-click with text:",
        selectedText
      );
      setSelectedText(selectedText);
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        text: selectedText,
      });
    }
  }, []);

  const handleCreateAnnotation = useCallback(() => {
    setShowAnnotationDialog(true);
    setContextMenu(null);
  }, []);

  const handleAnnotationSubmit = useCallback(
    async (annotationData: TextSelectionAnnotationData) => {
      if (!user?.id) return;

      try {
        // Create annotation object
        const annotation = {
          id: crypto.randomUUID(),
          title: annotationData.comment,
          data: annotationData,
          user_id: user.id,
          parent_resource_type: "webpage",
          parent_resource_id: currentUrl,
        };

        // Save to database
        await saveAnnotation(annotation);

        // Also save to scene graph if available
        if (currentSceneGraph) {
          const graph = currentSceneGraph.getGraph();
          const annotationNode = graph.createNode({
            id: annotation.id,
            type: "annotation",
            label: annotation.title,
            position: { x: 0, y: 0, z: 0 },
            userData: {
              annotationData: annotationData,
              annotation: annotation,
            },
          });

          // Create webpage node if it doesn't exist
          const webpageNode = graph.createNodeIfMissing(currentUrl, {
            id: currentUrl,
            type: "webpage",
            label: currentTitle,
            position: { x: 0, y: 0, z: 0 },
          });

          // Create edge between annotation and webpage
          graph.createEdge(annotationNode.getId(), webpageNode.getId(), {
            type: "annotation-parent",
          });

          // Notify graph change
          currentSceneGraph.notifyGraphChanged();
        }

        // Show success notification
        addNotification({
          message: `Annotation created successfully from "${currentTitle}"`,
          type: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Failed to create annotation:", error);
        addNotification({
          message: `Failed to create annotation: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
          duration: 5000,
        });
      }
    },
    [currentUrl, currentTitle, user?.id, currentSceneGraph]
  );

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(selectedText);
    setContextMenu(null);
  }, [selectedText]);

  const handleSearchGoogle = useCallback(() => {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(selectedText)}`,
      "_blank"
    );
    setContextMenu(null);
  }, [selectedText]);

  // Initialize component from props or URL parameters
  useEffect(() => {
    // Get resourceId from props or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resourceIdFromParams = urlParams.get("resourceId");
    const urlFromParams = urlParams.get("url");
    const titleFromParams = urlParams.get("title");

    const finalResourceId = resourceId || resourceIdFromParams;
    const finalUrl =
      url || urlFromParams ? decodeURIComponent(urlFromParams!) : "";
    const finalTitle =
      title || titleFromParams ? decodeURIComponent(titleFromParams!) : "";

    // Set initial state
    setCurrentUrl(finalUrl);
    setCurrentTitle(finalTitle);

    if (finalTitle) {
      document.title = finalTitle;
    }

    console.log("HtmlPageViewer - Debug:", {
      finalResourceId,
      hasCached: finalResourceId ? hasValidContent(finalResourceId) : false,
      loadedResourceId,
      html: html ? html.length : 0,
      tabId,
    });

    // Check if we have cached content first
    if (finalResourceId) {
      // Skip if we've already processed this resourceId in this render cycle
      if (processedResourceIds.current.has(finalResourceId)) {
        return;
      }

      const cachedContent = getContent(finalResourceId);
      if (cachedContent && hasValidContent(finalResourceId)) {
        console.log("Using cached content for resourceId:", finalResourceId);
        setHtml(cachedContent.html);
        setCurrentUrl(cachedContent.url);
        setCurrentTitle(cachedContent.title);
        setLoadedResourceId(finalResourceId);
        setLoading(false);
        setError(null);
        processedResourceIds.current.add(finalResourceId);
        return; // Exit early to prevent any flickering
      } else if (loadedResourceId !== finalResourceId) {
        console.log("Fetching from server for resourceId:", finalResourceId);
        setLoading(true); // Only set loading to true if we need to fetch
        fetchWebpageContent(finalResourceId);
        processedResourceIds.current.add(finalResourceId);
      } else if (loadedResourceId === finalResourceId && html) {
        // Content is already loaded for this resourceId, just ensure loading is false
        setLoading(false);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [
    resourceId,
    url,
    title,
    loadedResourceId,
    hasValidContent,
    html,
    tabId,
    getContent,
    fetchWebpageContent,
  ]); // Only depend on props and loadedResourceId

  // Component lifecycle debugging
  useEffect(() => {
    console.log("HtmlPageViewer mounted");
    return () => {
      console.log("HtmlPageViewer unmounted");
      // Reset document title when component unmounts
      document.title = "Unigraph";
      // Clear processed resourceIds - capture the ref value
      const currentProcessedIds = processedResourceIds.current;
      currentProcessedIds.clear();
    };
  }, []);

  // Load annotations when currentUrl changes
  useEffect(() => {
    if (currentUrl && user?.id) {
      loadAnnotations();
    }
  }, [currentUrl, user?.id, loadAnnotations]);

  const handleRefresh = () => {
    if (loadedResourceId) {
      // Clear the cache for this resource and refetch
      const { clearContent } = useHtmlPageViewerStore.getState();
      clearContent(loadedResourceId);
      fetchWebpageContent(loadedResourceId);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(currentUrl, "_blank");
  };

  const handleGoBack = () => {
    onClose?.();
  };

  // Only show loading if we're actually loading and don't have content yet
  if (loading && !html) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <RefreshCw
            size={24}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{ marginTop: "8px" }}>Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: theme.colors.error, marginBottom: "16px" }}>
            {error}
          </p>
          <button
            onClick={handleRefresh}
            style={{
              padding: "8px 16px",
              backgroundColor: theme.colors.primary,
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleGoBack}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {currentTitle || title || currentUrl}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleRefresh}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleOpenInNewTab}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Content - Isolated iframe */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "0",
          backgroundColor: "white",
        }}
      >
        {html && (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title={currentTitle || title || "HTML Content"}
            sandbox="allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 10000,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "4px",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              color: theme.colors.textMuted,
              borderBottom: `1px solid ${theme.colors.border}`,
              marginBottom: "4px",
            }}
          >
            &ldquo;
            {contextMenu.text.length > 50
              ? contextMenu.text.substring(0, 50) + "..."
              : contextMenu.text}
            &rdquo;
          </div>

          <button
            onClick={handleCreateAnnotation}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <MessageSquare size={16} />
            Create Annotation
          </button>

          <button
            onClick={handleCopyText}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Tag size={16} />
            Copy Text
          </button>

          <button
            onClick={handleSearchGoogle}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: theme.colors.text,
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ExternalLink size={16} />
            Search Google
          </button>
        </div>
      )}

      {/* Annotation Dialog */}
      <AnnotationDialog
        isOpen={showAnnotationDialog}
        onClose={() => setShowAnnotationDialog(false)}
        onSubmit={handleAnnotationSubmit}
        selectedText={selectedText}
        pageUrl={currentUrl}
        pageTitle={currentTitle}
      />

      {/* Annotation Card */}
      {showAnnotationCard && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 10001,
            }}
            onClick={() => setShowAnnotationCard(null)}
          />
          {/* Modal */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxWidth: "90%",
              maxHeight: "80%",
              overflow: "auto",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              zIndex: 10002,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                Annotation Details
              </h2>
              <button
                onClick={() => setShowAnnotationCard(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Selected Text
              </label>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#6b7280",
                  border: "1px solid #e5e7eb",
                  maxHeight: "100px",
                  overflow: "auto",
                }}
              >
                {(showAnnotationCard.data as TextSelectionAnnotationData)
                  ?.selected_text || "No text selected"}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Comment
              </label>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  minHeight: "60px",
                }}
              >
                {(showAnnotationCard.data as TextSelectionAnnotationData)
                  ?.comment || "No comment"}
              </div>
            </div>

            {(showAnnotationCard.data as TextSelectionAnnotationData)
              ?.secondary_comment && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Secondary Comment
                </label>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                    minHeight: "40px",
                  }}
                >
                  {(showAnnotationCard.data as TextSelectionAnnotationData)
                    ?.secondary_comment || ""}
                </div>
              </div>
            )}

            {Array.isArray(
              (showAnnotationCard.data as TextSelectionAnnotationData)?.tags
            ) &&
              ((showAnnotationCard.data as TextSelectionAnnotationData)?.tags
                ?.length ?? 0) > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    Tags
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {(
                      showAnnotationCard.data as TextSelectionAnnotationData
                    )?.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#e0e7ff",
                          color: "#3730a3",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowAnnotationCard(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HtmlPageViewer;
