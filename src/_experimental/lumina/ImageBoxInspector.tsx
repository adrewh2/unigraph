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

      // Draw a background to test if canvas is working
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get image dimensions
      const imgWidth = image.width;
      const imgHeight = image.height;

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

      // Check if scaled coordinates are reasonable
      if (scaledTopLeft.x >= imgWidth || scaledTopLeft.y >= imgHeight) {
        console.log(
          "Scaled coordinates are outside image bounds, drawing full image"
        );
        ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = "#ff0000";
        ctx.font = "14px Arial";
        ctx.fillText("Scaled coordinates outside image bounds", 5, 20);
        return;
      }

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

      // If the extract area is too small or invalid, draw the full image
      if (extractWidth <= 0 || extractHeight <= 0) {
        console.log("Invalid extract area, drawing full image");
        ctx.drawImage(image, 0, 0, canvasSize, canvasSize);

        // Add a red border to indicate this is the full image
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize, canvasSize);

        // Add label
        ctx.fillStyle = "#ff0000";
        ctx.font = "14px Arial";
        ctx.fillText("Full Image (invalid coordinates)", 5, 20);
        return;
      }

      // Check if the extraction area is very small (less than 10 pixels)
      if (extractWidth < 10 || extractHeight < 10) {
        console.log("Extraction area too small, drawing full image");
        ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = "#ff0000";
        ctx.font = "14px Arial";
        ctx.fillText("Full Image (extraction area too small)", 5, 20);
        return;
      }

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

      // Add a border around the extracted area
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);

      // Add label
      ctx.fillStyle = "#ff0000";
      ctx.font = "14px Arial";
      ctx.fillText(imageBox.label, offsetX + 5, offsetY + 20);
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
        setImageLoaded(true);
        setImageError(null);
        drawImageBox(image);
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
    <div className="image-box-inspector-edit">
      <h3>Edit Image Box</h3>
      <div className="form-group">
        <label>Label:</label>
        <input
          type="text"
          value={editedData.label}
          onChange={(e) =>
            setEditedData({ ...editedData, label: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Type:</label>
        <input
          type="text"
          value={editedData.type}
          onChange={(e) =>
            setEditedData({ ...editedData, type: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          value={editedData.description}
          onChange={(e) =>
            setEditedData({ ...editedData, description: e.target.value })
          }
        />
      </div>
      <div className="form-group">
        <label>Top Left (x, y):</label>
        <div className="coordinate-inputs">
          <input
            type="number"
            value={editedData.topLeft.x}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                topLeft: {
                  ...editedData.topLeft,
                  x: parseInt(e.target.value) || 0,
                },
              })
            }
          />
          <input
            type="number"
            value={editedData.topLeft.y}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                topLeft: {
                  ...editedData.topLeft,
                  y: parseInt(e.target.value) || 0,
                },
              })
            }
          />
        </div>
      </div>
      <div className="form-group">
        <label>Bottom Right (x, y):</label>
        <div className="coordinate-inputs">
          <input
            type="number"
            value={editedData.bottomRight.x}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                bottomRight: {
                  ...editedData.bottomRight,
                  x: parseInt(e.target.value) || 0,
                },
              })
            }
          />
          <input
            type="number"
            value={editedData.bottomRight.y}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                bottomRight: {
                  ...editedData.bottomRight,
                  y: parseInt(e.target.value) || 0,
                },
              })
            }
          />
        </div>
      </div>
      <div className="button-group">
        <button onClick={handleSave} className="save-button">
          Save
        </button>
        <button onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="image-box-inspector-view">
      <div className="inspector-header">
        <h3>{imageBox.label}</h3>
        <div className="header-actions">
          <button onClick={handleEdit} className="edit-button">
            Edit
          </button>
          <button onClick={handleDelete} className="delete-button">
            Delete
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              ×
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
              style={{ border: "2px solid red" }}
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
