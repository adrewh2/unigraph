import { Edit, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ImageBoxData } from "../../core/types/ImageBoxData";
import "./ImageBoxInspector.css";
import { images } from "./images";

interface ImageBoxInspectorProps {
  imageBox: ImageBoxData;
  onClose?: () => void;
  onEdit?: (imageBox: ImageBoxData) => void;
  onDelete?: (imageBoxId: string) => void;
}

const ImageBoxInspector: React.FC<ImageBoxInspectorProps> = ({
  imageBox,
  onClose,
  onEdit,
  onDelete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ImageBoxData>(imageBox);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Canvas size for the preview
  const canvasSize = 300;

  useEffect(() => {
    const drawImageBox = (image: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      console.log("Drawing image box:", imageBox.id);
      console.log("Image dimensions:", image.width, image.height);
      console.log(
        "ImageBox coordinates:",
        imageBox.topLeft,
        imageBox.bottomRight
      );

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get image dimensions
      const imgWidth = image.width;
      const imgHeight = image.height;

      // Ensure image is actually loaded and has dimensions
      if (imgWidth === 0 || imgHeight === 0) {
        console.log("Image not fully loaded yet, retrying...");
        setTimeout(() => drawImageBox(image), 100);
        return;
      }

      // The coordinates are in pixel space, but we need to ensure they're within bounds
      // Let's also add some debugging to see what's happening
      console.log(
        "Original coordinates:",
        imageBox.topLeft,
        imageBox.bottomRight
      );
      console.log("Image dimensions:", imgWidth, imgHeight);

      // The coordinates might be in a different coordinate system
      // Let's try scaling them to the actual image dimensions
      // Assuming the coordinates are for an 800x600 image but the actual image might be different
      const expectedWidth = 800;
      const expectedHeight = 600;

      const coordScaleX = imgWidth / expectedWidth;
      const coordScaleY = imgHeight / expectedHeight;

      console.log("Coordinate scale factors:", coordScaleX, coordScaleY);

      const scaledTopLeft = {
        x: imageBox.topLeft.x * coordScaleX,
        y: imageBox.topLeft.y * coordScaleY,
      };

      const scaledBottomRight = {
        x: imageBox.bottomRight.x * coordScaleX,
        y: imageBox.bottomRight.y * coordScaleY,
      };

      console.log("Scaled coordinates:", scaledTopLeft, scaledBottomRight);

      const extractX = Math.max(0, Math.min(scaledTopLeft.x, imgWidth));
      const extractY = Math.max(0, Math.min(scaledTopLeft.y, imgHeight));
      const extractWidth = Math.min(
        scaledBottomRight.x - scaledTopLeft.x,
        imgWidth - extractX
      );
      const extractHeight = Math.min(
        scaledBottomRight.y - scaledTopLeft.y,
        imgHeight - extractY
      );

      console.log(
        "Extract area:",
        extractX,
        extractY,
        extractWidth,
        extractHeight
      );

      // Calculate scaling to fit in canvas while maintaining aspect ratio
      const canvasScaleX = canvasSize / extractWidth;
      const canvasScaleY = canvasSize / extractHeight;
      const scale = Math.min(canvasScaleX, canvasScaleY);

      const drawWidth = extractWidth * scale;
      const drawHeight = extractHeight * scale;

      // Center the drawing
      const offsetX = (canvasSize - drawWidth) / 2;
      const offsetY = (canvasSize - drawHeight) / 2;

      console.log("Draw dimensions:", drawWidth, drawHeight);
      console.log("Offset:", offsetX, offsetY);

      console.log("Drawing extracted area:");
      console.log("Source:", extractX, extractY, extractWidth, extractHeight);
      console.log("Destination:", offsetX, offsetY, drawWidth, drawHeight);

      // Draw the extracted area
      ctx.drawImage(
        image,
        extractX,
        extractY,
        extractWidth,
        extractHeight,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
    };

    const loadImage = () => {
      const image = new Image();
      const imageSrc = images[imageBox.imageUrl];

      console.log("Loading image for ImageBox:", imageBox.id);
      console.log("Image URL:", imageBox.imageUrl);
      console.log("Resolved image src:", imageSrc);

      if (!imageSrc) {
        console.error("Image not found in images object:", imageBox.imageUrl);
        setImageError(`Image not found: ${imageBox.imageUrl}`);
        return;
      }

      image.onload = () => {
        console.log("Image loaded successfully for:", imageBox.id);
        console.log("Image dimensions:", image.width, image.height);

        // Double-check that the image has valid dimensions
        if (image.width > 0 && image.height > 0) {
          setImageLoaded(true);
          setImageError(null);
          // Add a small delay to ensure canvas is ready
          setTimeout(() => drawImageBox(image), 50);
        } else {
          console.log("Image loaded but has zero dimensions, retrying...");
          setTimeout(() => {
            if (image.width > 0 && image.height > 0) {
              setImageLoaded(true);
              setImageError(null);
              drawImageBox(image);
            } else {
              setImageError("Image loaded but has invalid dimensions");
            }
          }, 100);
        }
      };

      image.onerror = () => {
        console.error("Failed to load image:", imageSrc);
        // Try loading the image directly as a fallback
        console.log("Trying direct image load as fallback...");
        const fallbackImage = new Image();
        fallbackImage.onload = () => {
          console.log("Fallback image loaded successfully");
          setImageLoaded(true);
          setImageError(null);
          drawImageBox(fallbackImage);
        };
        fallbackImage.onerror = () => {
          console.error("Fallback image also failed to load");
          setImageError(`Failed to load image: ${imageSrc}`);
        };
        fallbackImage.src = imageBox.imageUrl;
      };

      image.src = imageSrc;
    };

    loadImage();
  }, [imageBox]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit?.(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(imageBox);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(`Are you sure you want to delete "${imageBox.label}"?`)
    ) {
      onDelete?.(imageBox.id);
    }
  };

  const renderEditForm = () => (
    <div className="image-box-inspector-view">
      <div className="inspector-header">
        <h3>
          <input
            type="text"
            value={editedData.label}
            onChange={(e) =>
              setEditedData({ ...editedData, label: e.target.value })
            }
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "18px",
              fontWeight: "600",
              color: "#333",
              width: "100%",
              outline: "none",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          />
        </h3>
        <div className="header-actions">
          <button onClick={handleSave} className="edit-button">
            <Edit size={16} />
          </button>
          <button onClick={handleCancel} className="delete-button">
            <X size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="image-preview">
        {imageError ? (
          <div className="error-message">{imageError}</div>
        ) : !imageLoaded ? (
          <div className="loading-message">Loading image...</div>
        ) : (
          <div>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="image-box-canvas"
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              Canvas size: {canvasSize}×{canvasSize}px
            </div>
          </div>
        )}
      </div>

      <div className="image-box-details">
        <div className="detail-group">
          <label>Type:</label>
          <span>{imageBox.type}</span>
        </div>
        <div className="detail-group">
          <label>Description:</label>
          <textarea
            value={editedData.description}
            onChange={(e) =>
              setEditedData({ ...editedData, description: e.target.value })
            }
            style={{
              border: "1px solid #ddd",
              background: "#f8f9fa",
              fontSize: "13px",
              color: "#333",
              width: "100%",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              minHeight: "60px",
              padding: "6px 8px",
              margin: 0,
              borderRadius: "4px",
            }}
          />
        </div>
        <div className="detail-group">
          <label>Image:</label>
          <span>{imageBox.imageUrl}</span>
        </div>
        <div className="detail-group">
          <label>Coordinates:</label>
          <div className="coordinates">
            <div>
              Top Left: ({imageBox.topLeft.x}, {imageBox.topLeft.y})
            </div>
            <div>
              Bottom Right: ({imageBox.bottomRight.x}, {imageBox.bottomRight.y})
            </div>
          </div>
        </div>
        <div className="detail-group">
          <label>Dimensions:</label>
          <span>
            {imageBox.bottomRight.x - imageBox.topLeft.x} ×{" "}
            {imageBox.bottomRight.y - imageBox.topLeft.y} pixels
          </span>
        </div>
      </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="image-box-inspector-view">
      <div className="inspector-header">
        <h3>{imageBox.label}</h3>
        <div className="header-actions">
          <button onClick={handleEdit} className="edit-button">
            <Edit size={16} />
          </button>
          <button onClick={handleDelete} className="delete-button">
            <Trash2 size={16} />
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="image-preview">
        {imageError ? (
          <div className="error-message">{imageError}</div>
        ) : !imageLoaded ? (
          <div className="loading-message">Loading image...</div>
        ) : (
          <div>
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="image-box-canvas"
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              Canvas size: {canvasSize}×{canvasSize}px
            </div>
          </div>
        )}
      </div>

      <div className="image-box-details">
        <div className="detail-group">
          <label>Type:</label>
          <span>{imageBox.type}</span>
        </div>
        <div className="detail-group">
          <label>Description:</label>
          <span>{imageBox.description || "No description"}</span>
        </div>
        <div className="detail-group">
          <label>Image:</label>
          <span>{imageBox.imageUrl}</span>
        </div>
        <div className="detail-group">
          <label>Coordinates:</label>
          <div className="coordinates">
            <div>
              Top Left: ({imageBox.topLeft.x}, {imageBox.topLeft.y})
            </div>
            <div>
              Bottom Right: ({imageBox.bottomRight.x}, {imageBox.bottomRight.y})
            </div>
          </div>
        </div>
        <div className="detail-group">
          <label>Dimensions:</label>
          <span>
            {imageBox.bottomRight.x - imageBox.topLeft.x} ×{" "}
            {imageBox.bottomRight.y - imageBox.topLeft.y} pixels
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="image-box-inspector">
      {isEditing ? renderEditForm() : renderViewMode()}
    </div>
  );
};

export default ImageBoxInspector;
