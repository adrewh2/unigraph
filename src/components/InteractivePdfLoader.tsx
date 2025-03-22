import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import "pdfjs-dist/web/pdf_viewer.css";
import React, { useCallback, useState } from "react";
import { SceneGraph } from "../core/model/SceneGraph";
import { ImageAnnotation } from "../core/types/ImageAnnotation";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface InteractivePdfLoaderProps {
  onSceneGraphParsed: (sceneGraph: SceneGraph) => void;
}

const InteractivePdfLoader: React.FC<InteractivePdfLoaderProps> = ({
  onSceneGraphParsed,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setError(null);
    }
  };

  async function renderPageAsImage(
    pdf: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
  ): Promise<string> {
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for higher resolution
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Get the base64 PNG data URL of the page
    return canvas.toDataURL("image/png");
  }

  const parsePdfToSceneGraph = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf: pdfjsLib.PDFDocumentProxy =
          await pdfjsLib.getDocument(arrayBuffer).promise;

        const image = await renderPageAsImage(pdf, 1);
        console.log("Image:", image);

        const sceneGraph = new SceneGraph({
          metadata: {
            name: file.name,
            description: "SceneGraph generated from interactive PDF elements.",
          },
        });

        sceneGraph.getGraph().createNode(image, {
          type: "image",
          userData: { imageUrl: image },
        });

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const annotations = await page.getAnnotations();

          annotations.forEach((annotation) => {
            if (annotation.subtype === "Widget" && annotation.rect) {
              const nodeId = `${annotation.id}`;
              const [x1, y1, x2, y2] = annotation.rect;
              const width = Math.abs(x2 - x1);
              const height = Math.abs(y2 - y1);
              const x = Math.min(x1, x2);
              const y = Math.min(y1, y2);

              const imageBox = new ImageAnnotation(nodeId, {
                id: nodeId,
                type: "ImageBox",
                label: annotation.fieldName || "Interactive Element",
                description: annotation.contents || "",
                topLeft: { x, y },
                bottomRight: { x: x + width, y: y + height },
                imageUrl: image,
              });

              sceneGraph.getEntityCache().addEntity(imageBox);

              sceneGraph.getGraph().createNode(nodeId, {
                type: "imageBox",
                userData: {
                  imageUrl: image,
                  topLeft: { x, y },
                  bottomRight: { x: x + width, y: y + height },
                  label: annotation.fieldName || "Interactive Element",
                  description: annotation.contents || "",
                },
              });

              //   sceneGraph.getGraph().createNode(nodeId, {
              //     label: annotation.fieldName || "Interactive Element",
              //     type: "ImageBox",
              //     description: annotation.contents || "",
              //     userData: {
              //       dimensions: { width, height },
              //       position: { x, y, z: 0 },
              //     },
              //   });
            }
          });
        }

        onSceneGraphParsed(sceneGraph);
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing PDF:", err);
        setError("Failed to parse the PDF. Please try again.");
        setIsLoading(false);
      }
    },
    [onSceneGraphParsed]
  );

  const handleParseClick = () => {
    if (pdfFile) {
      parsePdfToSceneGraph(pdfFile);
    } else {
      setError("Please select a PDF file first.");
    }
  };

  return (
    <div
      style={{
        zIndex: 99999,
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        width: "90%",
        maxWidth: "500px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#333" }}>Interactive PDF Loader</h2>
      <p style={{ margin: "15px 0", color: "#555" }}>
        Upload an interactive PDF file to extract form fields and annotations
        into a graph structure.
      </p>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "4px",
            width: "80%",
            margin: "0 auto",
            display: "block",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={handleParseClick}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: isLoading ? "#cccccc" : "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {isLoading ? "Parsing..." : "Parse PDF"}
        </button>
        <button
          onClick={() => onSceneGraphParsed(new SceneGraph())}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f1f1f1",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p style={{ color: "#d32f2f", marginTop: "15px", fontWeight: "500" }}>
          {error}
        </p>
      )}
      {isLoading && (
        <p style={{ color: "#1976d2", marginTop: "15px" }}>
          Loading and parsing PDF...
        </p>
      )}
      {pdfFile && !isLoading && (
        <p style={{ color: "#388e3c", marginTop: "15px" }}>
          Selected: {pdfFile.name}
        </p>
      )}
    </div>
  );
};

export default InteractivePdfLoader;
