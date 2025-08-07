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

  return (
    <div
      className="h-full w-full bg-gray-50"
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* PDF Content - Full Container */}
      <iframe
        src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full border-0"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        title={title}
      />
    </div>
  );
};

export default PdfViewer;
