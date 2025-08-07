import { Download, Search, ZoomIn, ZoomOut } from "lucide-react";
import React from "react";

interface PdfViewerProps {
  url?: string;
  title?: string;
  initialPage?: number;
  initialScale?: number;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  url = "https://arxiv.org/pdf/1307.5461", // Quantum hyperbolic geometry in loop quantum gravity
  title = "Quantum hyperbolic geometry in loop quantum gravity with cosmological constant",
  initialPage = 1,
  initialScale = 1.0,
}) => {
  console.log("PdfViewer mounting with URL:", url);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [scale, setScale] = React.useState(initialScale);

  // Simple loading state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const zoomIn = React.useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = React.useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleSearch = React.useCallback(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }
    // This is a simplified search - in a real implementation, you'd use PDF.js search API
    console.log("Searching for:", searchText);
  }, [searchText]);

  const downloadPdf = React.useCallback(() => {
    const link = document.createElement("a");
    link.href = url;
    link.download = title || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [url, title]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="text-red-500 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Unable to Load PDF
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => setError(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Loading PDF
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while the document loads...
            </p>
            <div className="text-xs text-gray-500 bg-gray-100 rounded p-2 break-all">
              {url}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full bg-gray-50"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Search"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={downloadPdf}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Download PDF"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>

            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="text-sm text-gray-600">
            {searchResults.length} result(s) found
          </div>
        )}
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div className="flex justify-center">
          <div
            className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              style={{ width: "800px", height: "600px" }}
              title={title}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
