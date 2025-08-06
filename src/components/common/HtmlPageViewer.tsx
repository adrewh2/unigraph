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
  const [cardPosition, setCardPosition] = useState({ x: 100, y: 100 });
  const [cardSize, setCardSize] = useState({ width: 450, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
      
      // Note: highlighting will be triggered by the useEffect that watches annotations
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentUrl]); // Only need user.id, not the full user object

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectSelectionScript, annotations]); // handleTextSelection and handleContextMenu are defined below and are stable

  // Inject highlighting script for existing annotations
  const injectHighlightingScript = useCallback(() => {
    console.log("injectHighlightingScript called with annotations:", annotations.length);
    
    if (!iframeRef.current || annotations.length === 0) {
      console.log("Cannot inject highlighting: iframe missing or no annotations");
      return;
    }

    try {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;

      if (!iframeWindow) {
        console.log("Cannot inject highlighting: iframe window not available");
        return;
      }

      console.log("Injecting highlighting script for annotations:", annotations);

      // Create highlighting script
      const annotationsJson = JSON.stringify(annotations);
      const script =
        "(function() {" +
        "const annotations = " +
        annotationsJson +
        ";" +
        "console.log('Highlighting script executing with', annotations.length, 'annotations');" +
        "function clearExistingHighlights() {" +
        "const existingHighlights = document.querySelectorAll('.annotation-highlight');" +
        "existingHighlights.forEach(function(highlight) {" +
        "const parent = highlight.parentNode;" +
        "parent.replaceChild(document.createTextNode(highlight.textContent), highlight);" +
        "parent.normalize();" +
        "});" +
        "}" +
        "function highlightAnnotations() {" +
        "console.log('highlightAnnotations called, document ready state:', document.readyState);" +
        "clearExistingHighlights();" +
        "annotations.forEach(function(annotation) {" +
        "if (annotation.data && annotation.data.selected_text) {" +
        "const text = annotation.data.selected_text;" +
        "console.log('Highlighting text for annotation:', annotation.id, 'text:', text);" +
        "highlightText(text, annotation.id);" +
        "}" +
        "});" +
        "console.log('Highlighting completed for', annotations.length, 'annotations');" +
        "}" +
        "function highlightText(searchText, annotationId) {" +
        "console.log('highlightText called with:', searchText, 'annotationId:', annotationId);" +
        "if (!document.body) {" +
        "console.warn('Document body not available for highlighting');" +
        "return;" +
        "}" +
        "const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);" +
        "const textNodes = [];" +
        "let node;" +
        "while (node = walker.nextNode()) { textNodes.push(node); }" +
        "console.log('Found', textNodes.length, 'text nodes to search');" +
        "let highlightCount = 0;" +
        "textNodes.forEach(function(textNode) {" +
        "const text = textNode.textContent;" +
        "if (text && text.includes(searchText)) {" +
        "console.log('Found matching text in node:', text.substring(0, 100), '...');" +
        "const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\\\\]\\\\]/g, '\\\\\\\\$&'), 'g');" +
        "const parts = text.split(regex);" +
        "if (parts.length > 1) {" +
        "highlightCount++;" +
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
        "console.log('Annotation span clicked, ID:', this.getAttribute('data-annotation-id'));" +
        "const annotationId = this.getAttribute('data-annotation-id');" +
        "if (annotationId) {" +
        "console.log('Sending show-annotation message for ID:', annotationId);" +
        "window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');" +
        "} else {" +
        "console.warn('No annotation ID found on clicked element');" +
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
        "console.log('Highlighted', highlightCount, 'text instances for annotation:', annotationId);" +
        "}" +
        "if (document.readyState === 'loading') {" +
        "document.addEventListener('DOMContentLoaded', function() {" +
        "console.log('DOMContentLoaded event fired, running highlightAnnotations');" +
        "setTimeout(highlightAnnotations, 100);" +
        "});" +
        "} else if (document.readyState === 'interactive' || document.readyState === 'complete') {" +
        "console.log('Document already loaded, running highlightAnnotations immediately');" +
        "setTimeout(highlightAnnotations, 100);" +
        "}" +
        "window.addEventListener('load', function() {" +
        "console.log('Window load event fired, running highlightAnnotations again');" +
        "setTimeout(highlightAnnotations, 200);" +
        "});" +
        "setInterval(function() {" +
        "const highlights = document.querySelectorAll('.annotation-highlight');" +
        "if (highlights.length === 0 && annotations.length > 0) {" +
        "console.log('No highlights found but annotations exist, re-highlighting');" +
        "highlightAnnotations();" +
        "}" +
        "}, 2000);" +
        "console.log('Highlighting script setup complete');" +
        "})();";

      // Execute the script in the iframe
      (iframeWindow as any).eval(script);
      console.log(
        "Highlighting script injected for",
        annotations.length,
        "annotations"
      );
    } catch (error) {
      console.error("Error injecting highlighting script:", error);
    }
  }, [annotations]);

  // Inject highlighting script when annotations change
  useEffect(() => {
    if (annotations.length > 0 && iframeRef.current) {
      // Give iframe more time to load and stabilize
      setTimeout(() => {
        injectHighlightingScript();
      }, 1000); // Increased from 500ms to 1000ms
    }
  }, [annotations, injectHighlightingScript]);

  // Re-inject highlighting when iframe loads and we have annotations
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || annotations.length === 0) return;

    const handleLoad = () => {
      console.log("Iframe load detected, re-injecting highlighting script");
      setTimeout(() => {
        injectHighlightingScript();
      }, 500);
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
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
      console.log("Received message:", event.data);
      
      if (event.data && event.data.type === "iframe-selection") {
        setSelectedText(event.data.selection);
        setContextMenu({
          x: event.data.x,
          y: event.data.y,
          text: event.data.selection,
        });
      } else if (event.data && event.data.type === "show-annotation") {
        console.log("Show annotation message received for ID:", event.data.annotationId);
        console.log("Current annotations:", annotations);
        
        const annotation = annotations.find(
          (a) => a.id === event.data.annotationId
        );
        
        console.log("Found annotation:", annotation);
        
        if (annotation) {
          setShowAnnotationCard(annotation);
          console.log("Annotation card should be shown");
        } else {
          console.warn("Annotation not found in local state, ID:", event.data.annotationId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]); // handleTextSelection and handleContextMenu are defined below and are stable

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

        // Immediately add to local annotations state for optimistic update
        setAnnotations(prevAnnotations => [...prevAnnotations, annotation]);

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

        // Reload annotations to get the latest from server (optional, but ensures consistency)
        setTimeout(() => {
          loadAnnotations();
        }, 100);
      } catch (error) {
        console.error("Failed to create annotation:", error);
        addNotification({
          message: `Failed to create annotation: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
          duration: 5000,
        });
      }
    },
    [currentUrl, currentTitle, user?.id, currentSceneGraph, loadAnnotations]
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
    // Capture the ref value at mount time
    const currentProcessedIds = processedResourceIds.current;
    return () => {
      console.log("HtmlPageViewer unmounted");
      // Reset document title when component unmounts
      document.title = "Unigraph";
      // Clear processed resourceIds using the captured value
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

  // Drag and resize handlers
  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    if (type === "drag") {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - cardPosition.x,
        y: e.clientY - cardPosition.y,
      });
    } else {
      setIsResizing(true);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Constrain position to keep card within viewport
        const constrainedX = Math.max(0, Math.min(newX, viewportWidth - cardSize.width));
        const constrainedY = Math.max(0, Math.min(newY, viewportHeight - cardSize.height));
        
        setCardPosition({
          x: constrainedX,
          y: constrainedY,
        });
      } else if (isResizing) {
        // Calculate new size
        const newWidth = Math.max(350, e.clientX - cardPosition.x);
        const newHeight = Math.max(250, e.clientY - cardPosition.y);
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Constrain size to fit within viewport
        const constrainedWidth = Math.min(newWidth, viewportWidth - cardPosition.x);
        const constrainedHeight = Math.min(newHeight, viewportHeight - cardPosition.y);
        
        setCardSize({
          width: constrainedWidth,
          height: constrainedHeight,
        });
      }
    },
    [isDragging, isResizing, dragOffset, cardPosition, cardSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global mouse event listeners for drag/resize
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

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
          {annotations.length > 0 && (
            <button
              onClick={() => {
                console.log("Manual highlight trigger");
                console.log("Current annotations:", annotations);
                console.log("Annotations data:", annotations.map(a => ({
                  id: a.id,
                  selected_text: (a.data as TextSelectionAnnotationData)?.selected_text || 'N/A'
                })));
                injectHighlightingScript();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#666",
                padding: "4px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
              title="Re-highlight annotations"
            >
              🖍️
            </button>
          )}
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
        <div
          style={{
            position: "fixed",
            top: cardPosition.y,
            left: cardPosition.x,
            width: cardSize.width,
            height: cardSize.height,
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            zIndex: 10002,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Title Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#f8fafc",
              cursor: "move",
              borderRadius: "12px 12px 0 0",
            }}
            onMouseDown={(e) => handleMouseDown(e, "drag")}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "600",
                color: "#1f2937",
                letterSpacing: "-0.025em",
              }}
            >
              📝 Annotation Details
            </h2>
            <button
              onClick={() => setShowAnnotationCard(null)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
                color: "#6b7280",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Area */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Selected Text Section */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Selected Text
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#4b5563",
                  border: "1px solid #e5e7eb",
                  maxHeight: "120px",
                  overflow: "auto",
                  lineHeight: "1.5",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{(showAnnotationCard.data as TextSelectionAnnotationData)
                  ?.selected_text || "No text selected"}&rdquo;
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Comment
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#1f2937",
                  border: "1px solid #e5e7eb",
                  minHeight: "80px",
                  lineHeight: "1.6",
                }}
              >
                {(showAnnotationCard.data as TextSelectionAnnotationData)
                  ?.comment || "No comment"}
              </div>
            </div>

            {/* Secondary Comment Section */}
            {(showAnnotationCard.data as TextSelectionAnnotationData)
              ?.secondary_comment && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Additional Notes
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#1f2937",
                    border: "1px solid #e5e7eb",
                    minHeight: "60px",
                    lineHeight: "1.6",
                  }}
                >
                  {(showAnnotationCard.data as TextSelectionAnnotationData)
                    ?.secondary_comment || ""}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {Array.isArray(
              (showAnnotationCard.data as TextSelectionAnnotationData)?.tags
            ) &&
              ((showAnnotationCard.data as TextSelectionAnnotationData)?.tags
                ?.length ?? 0) > 0 && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
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
                          padding: "6px 12px",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer with Close Button */}
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f8fafc",
              display: "flex",
              justifyContent: "flex-end",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <button
              onClick={() => setShowAnnotationCard(null)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Close
            </button>
          </div>

          {/* Resize handle */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              width: "20px",
              height: "20px",
              cursor: "nw-resize",
              background:
                "linear-gradient(-45deg, transparent 30%, #d1d5db 30%, #d1d5db 40%, transparent 40%, transparent 60%, #d1d5db 60%, #d1d5db 70%, transparent 70%)",
              borderRadius: "0 0 12px 0",
            }}
            onMouseDown={(e) => handleMouseDown(e, "resize")}
          />
        </div>
      )}
    </div>
  );
};

export default HtmlPageViewer;
