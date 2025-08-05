import { useTheme } from "@aesgraph/app-shell";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getWebpage } from "../../api/webpagesApi";

interface HtmlPageViewerProps {
  resourceId?: string;
  url?: string;
  title?: string;
  onClose?: () => void;
}

const HtmlPageViewer: React.FC<HtmlPageViewerProps> = ({
  resourceId,
  url,
  title,
  onClose,
}) => {
  const { theme } = useTheme();
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(url || "");
  const [currentTitle, setCurrentTitle] = useState<string>(title || "");
  const cssInjected = useRef(false);

  // Get URL parameters if not provided as props
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFromParams = urlParams.get("url");
    const titleFromParams = urlParams.get("title");
    const resourceIdFromParams = urlParams.get("resourceId");

    if (urlFromParams && !url) {
      setCurrentUrl(decodeURIComponent(urlFromParams));
    }

    if (titleFromParams && !title) {
      setCurrentTitle(decodeURIComponent(titleFromParams));
      // Update the title if provided via URL params
      document.title = decodeURIComponent(titleFromParams);
    }

    // Use resourceId from URL params if not provided as prop
    const finalResourceId = resourceId || resourceIdFromParams;
    if (finalResourceId) {
      fetchWebpageContent(finalResourceId);
    }
  }, [resourceId, url, title]);

  // Function to detect if URL is Wikipedia and load appropriate CSS
  const loadWikipediaCSS = (url: string) => {
    if (!url.includes("wikipedia.org")) return;

    if (cssInjected.current) return;
    cssInjected.current = true;

    const language = url.includes(".wikipedia.org")
      ? url.split(".")[0].replace("https://", "").replace("http://", "")
      : "en";

    const cssLinks = [
      `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=site.styles&only=styles&skin=vector`,
      `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.content.parsoid|mediawiki.skinning.interface|mediawiki.skinning.content&only=styles&skin=vector`,
      `https://${language}.wikipedia.org/w/load.php?debug=false&lang=${language}&modules=ext.cite.styles|ext.pygments&only=styles&skin=vector`,
    ];

    cssLinks.forEach((href) => {
      if (!document.querySelector(`link[data-wiki-css][href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;
        link.setAttribute("data-wiki-css", "true");
        document.head.appendChild(link);
      }
    });
  };

  const fetchWebpageContent = async (webpageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const webpage = await getWebpage(webpageId);

      if (webpage.html_content) {
        setHtml(webpage.html_content);
        setCurrentUrl(webpage.url);
        setCurrentTitle(webpage.title || webpage.url);
        document.title = webpage.title || webpage.url;

        // Load Wikipedia CSS if the URL is from Wikipedia
        loadWikipediaCSS(webpage.url);
      } else {
        setError("No HTML content available for this webpage");
      }
    } catch (err) {
      setError(
        `Error loading webpage: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Legacy external URL fetching (kept for backward compatibility)
  useEffect(() => {
    if (!resourceId && currentUrl) {
      const fetchExternalPage = async () => {
        setLoading(true);
        setError(null);

        try {
          // Use a CORS proxy to fetch the page content
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(currentUrl)}`;
          const response = await fetch(proxyUrl);
          const data = await response.json();

          if (data.contents) {
            setHtml(data.contents);
            // Load Wikipedia CSS if the URL is from Wikipedia
            loadWikipediaCSS(currentUrl);
          } else {
            setError("Failed to load page content");
          }
        } catch (err) {
          setError(
            `Error loading page: ${err instanceof Error ? err.message : String(err)}`
          );
        } finally {
          setLoading(false);
        }
      };

      fetchExternalPage();
    }
  }, [currentUrl, resourceId]);

  const handleRefresh = () => {
    setCurrentUrl(currentUrl);
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
              color: theme.colors.onPrimary,
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
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
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
              color: theme.colors.textSecondary,
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
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
              color: theme.colors.textSecondary,
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
              color: theme.colors.textSecondary,
              padding: "4px",
              borderRadius: "4px",
            }}
            title="Open in new tab"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            maxWidth: "100%",
            lineHeight: "1.6",
          }}
        />
      </div>
    </div>
  );
};

export default HtmlPageViewer;
