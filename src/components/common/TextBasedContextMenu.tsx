import React from 'react';
import './TextBasedContextMenu.css';

export interface TextContextMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface TextBasedContextMenuProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  items: TextContextMenuItem[];
  onClose: () => void;
}

/**
 * A specialized context menu for text operations like annotation
 * Appears when text is selected and right-clicked
 */
const TextBasedContextMenu: React.FC<TextBasedContextMenuProps> = ({
  position,
  selectedText,
  items,
  onClose
}) => {
  if (!position) return null;

  // Calculate position to keep menu in viewport
  const adjustPosition = () => {
    if (!position) return { left: 0, top: 0 };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 180; // Reduced width for more compact menu
    const menuHeight = items.length * 28 + 30; // Estimated height based on items and text preview
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 5;
    }
    
    // Adjust vertical position
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight - 5;
    }
    
    return { left, top };
  };

  const { left, top } = adjustPosition();
  
  // Truncate text preview if too long
  const truncatedText = selectedText.length > 30 
    ? `${selectedText.substring(0, 30)}...` 
    : selectedText;

  return (
    <div 
      className="text-context-menu"
      style={{ 
        position: 'fixed', 
        left, 
        top,
        zIndex: 10000,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: '4px',
        fontSize: '13px',
        padding: '4px 0',
        minWidth: '140px',
        maxWidth: '180px',
      }}
    >
      {/* Text preview */}
      <div style={{
        padding: '4px 8px',
        color: '#666',
        fontStyle: 'italic',
        borderBottom: '1px solid #eee',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {truncatedText}
      </div>
      
      {/* Menu items */}
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          style={{
            padding: '6px 12px',
            cursor: item.disabled ? 'default' : 'pointer',
            opacity: item.disabled ? 0.5 : 1,
            backgroundColor: 'transparent',
            color: '#333',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default TextBasedContextMenu;
