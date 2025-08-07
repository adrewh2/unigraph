import { FileText } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface PdfJsViewerProps {
  url?: string;
  title?: string;
  initialPage?: number;
  initialScale?: number;
  onTextSelection?: (selectedText: string, pageNumber: number) => void;
  onPageChange?: (pageNumber: number) => void;
}

const PdfJsViewer: React.FC<PdfJsViewerProps> = ({
  url = "https://arxiv.org/pdf/1307.5461", // Quantum hyperbolic geometry in loop quantum gravity
  title = "Quantum hyperbolic geometry in loop quantum gravity with cosmological constant",
  initialPage = 1,
  initialScale = 1.0,
  onTextSelection,
  onPageChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Construct the PDF.js viewer URL with parameters
  const getViewerUrl = () => {
    const baseUrl = "/pdfjs/web/viewer.html";
    const params = new URLSearchParams();

    if (url) {
      // For now, use the regular viewer and test with a local PDF
      const viewerPath = "/pdfjs/web/viewer.html";

      // Use a local PDF for testing first
      const testPdfUrl = "/pdfjs/web/compressed.tracemonkey-pldi-09.pdf";
      params.append("file", testPdfUrl);

      return `${viewerPath}?${params.toString()}`;
    }

    return baseUrl;
  };

  const handleIframeLoad = () => {
    setLoading(false);
    console.log("PDF.js viewer iframe loaded");
    console.log("Viewer URL:", getViewerUrl());
  };

  const handleIframeError = () => {
    setError("Failed to load PDF viewer");
    setLoading(false);
  };

  useEffect(() => {
    // Reset loading state when URL changes
    setLoading(true);
    setError(null);
    console.log("PDF viewer URL changed:", url);
    console.log("Generated viewer URL:", getViewerUrl());
  }, [url]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <FileText className="mx-auto h-12 w-12 mb-4 text-red-400" />
          <p className="font-semibold">Error loading PDF viewer</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ height: "100%", width: "100%" }}>
      {/* PDF.js Viewer iframe */}
      <div
        className="w-full h-full relative"
        style={{ width: "100%", height: "100%" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading PDF viewer...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={getViewerUrl()}
          className="w-full h-full border-0"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
          title="PDF Viewer"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  );
};

export default PdfJsViewer;
