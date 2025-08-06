import { useTheme } from "@aesgraph/app-shell";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getWebpage } from "../../api/webpagesApi";
import { useHtmlPageViewerStore } from "../../store/htmlPageViewerStore";

interface HtmlPageViewerProps {
  resourceId?: string;
  url?: string;
  title?: string;
  tabId?: string;
  onClose?: () => void;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [currentTitle, setCurrentTitle] = useState<string>(title || "");
  const [loadedResourceId, setLoadedResourceId] = useState<string | null>(null);

  // Get store functions
  const {
    getContent,
    setContent,
    setLoading: setStoreLoading,
    setError: setStoreError,
    hasValidContent,
  } = useHtmlPageViewerStore();

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
      const cachedContent = getContent(finalResourceId);
      if (cachedContent && hasValidContent(finalResourceId)) {
        console.log("Using cached content for resourceId:", finalResourceId);
        setHtml(cachedContent.html);
        setCurrentUrl(cachedContent.url);
        setCurrentTitle(cachedContent.title);
        setLoadedResourceId(finalResourceId);
        setLoading(false);
      } else if (loadedResourceId !== finalResourceId) {
        console.log("Fetching from server for resourceId:", finalResourceId);
        fetchWebpageContent(finalResourceId);
      }
    } else {
      setLoading(false);
    }
  }, [resourceId, url, title, loadedResourceId]); // Use loadedResourceId instead of html

  // Component lifecycle debugging
  useEffect(() => {
    console.log("HtmlPageViewer mounted");
    return () => {
      console.log("HtmlPageViewer unmounted");
      // Reset document title when component unmounts
      document.title = "Unigraph";
    };
  }, []);

  const fetchWebpageContent = async (webpageId: string) => {
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
  };

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

  if (loading) {
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
            srcDoc={html}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "white",
            }}
            title={currentTitle || title || "HTML Content"}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
};

export default HtmlPageViewer;
