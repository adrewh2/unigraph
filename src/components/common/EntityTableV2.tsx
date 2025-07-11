import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";
import styles from "./EntityTable.module.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface EntityTableV2Props {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  maxHeight?: string | number;
}

const EntityTableV2: React.FC<EntityTableV2Props> = ({
  container,
  onEntityClick,
  maxHeight = 600,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entity: Entity | null;
  } | null>(null);

  const { setEditingEntity, setJsonEditEntity } = useAppContext();

  // Search functionality
  const searchInValue = useCallback(
    (value: any, searchText: string): boolean => {
      const searchLower = searchText.toLowerCase();

      if (value === null || value === undefined) {
        return false;
      }

      // Handle Sets
      if (value instanceof Set) {
        return Array.from(value).some((item) =>
          searchInValue(item, searchText)
        );
      }

      // Handle Arrays
      if (Array.isArray(value)) {
        return value.some((item) => searchInValue(item, searchText));
      }

      // Handle Objects (including userData)
      if (typeof value === "object") {
        return Object.values(value).some((val) =>
          searchInValue(val, searchText)
        );
      }

      // Handle primitive values
      return String(value).toLowerCase().includes(searchLower);
    },
    []
  );

  // Value formatting
  const formatValue = useCallback((value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (value instanceof Set) return `[${Array.from(value).join(", ")}]`;
    if (Array.isArray(value)) return `[${value.join(", ")}]`;

    if (typeof value === "object") {
      // Special handling for empty objects
      if (Object.keys(value).length === 0) return "{}";

      try {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (key: string, value: any) => {
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) return "[Circular]";
              seen.add(value);
            }
            return value;
          };
        };

        // Compact formatting for small objects
        const json = JSON.stringify(value, getCircularReplacer());
        if (json.length < 50) {
          return json; // Show inline if small
        }

        // Pretty print for larger objects
        return JSON.stringify(value, getCircularReplacer(), 2);
      } catch (e) {
        return `[Complex Object] ${e}`;
      }
    }

    return String(value);
  }, []);

  // Context menu handling
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, entity: Entity) => {
      event.preventDefault();
      setContextMenu((prevContextMenu) =>
        prevContextMenu === null
          ? {
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              entity,
            }
          : null
      );
    },
    []
  );

  const handleClose = () => {
    setContextMenu(null);
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      label: "Edit",
      action: () => {
        if (contextMenu?.entity) {
          setEditingEntity(contextMenu.entity);
        }
        handleClose();
      },
    },
    {
      label: "Advanced Edit",
      action: () => {
        if (contextMenu?.entity) {
          setJsonEditEntity(contextMenu.entity);
        }
        handleClose();
      },
    },
    {
      label: "Action 1",
      action: () => {
        console.log("Action 1 clicked");
        handleClose();
      },
    },
    {
      label: "Action 2",
      action: () => {
        console.log("Action 2 clicked");
        handleClose();
      },
    },
  ];

  // Generate column definitions dynamically
  const columnDefs = useMemo<ColDef<Entity>[]>(() => {
    const COLUMN_ORDER = ["id", "type", "tags", "userData"];
    const allColumns = new Set<string>();

    container.forEach((entity) => {
      Object.keys(entity.getData()).forEach((key) => allColumns.add(key));
    });

    const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));
    const remainingColumns = Array.from(allColumns).filter(
      (col) => !COLUMN_ORDER.includes(col)
    );

    const finalColumns = [...orderedColumns, ...remainingColumns];

    return finalColumns.map((col) => ({
      headerName: col,
      flex: 1,
      minWidth: 120,
      maxWidth: 300,
      sortable: true,
      resizable: true,
      valueGetter: (params) => {
        if (!params.data) return "";
        const value = (params.data.getData() as any)[col];
        return formatValue(value);
      },
      filterParams: {
        filterOptions: ["contains", "equals", "startsWith", "endsWith"],
        buttons: ["apply", "reset"],
        closeOnApply: true,
      },
      // Custom filter function for complex search
      filterValueGetter: (params) => {
        if (!params.data) return "";
        const value = (params.data.getData() as any)[col];
        return value;
      },
      // Custom filter function
      filter: (params: any) => {
        if (!params.data) return false;
        const value = (params.data.getData() as any)[col];
        const filterValue = params.filterValue;
        if (!filterValue) return true;
        return searchInValue(value, filterValue);
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        padding: "8px",
        fontSize: "14px",
        lineHeight: "1.4",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }));
  }, [container, searchInValue, formatValue]);

  // Default column definition
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      minWidth: 120,
      maxWidth: 300,
      filter: true,
      filterParams: {
        filterOptions: ["contains", "equals", "startsWith", "endsWith"],
        buttons: ["apply", "reset"],
        closeOnApply: true,
      },
    }),
    []
  );

  // Convert entities to array for AG Grid
  const rowData = useMemo(() => {
    const data = container.toArray();
    return data;
  }, [container]);

  // Grid API reference
  const gridRef = useRef<AgGridReact<Entity>>(null);

  // Handle row click
  const onRowClicked = useCallback(
    (event: any) => {
      if (onEntityClick && event.data) {
        onEntityClick(event.data);
      }
    },
    [onEntityClick]
  );

  // Handle row double click
  const onRowDoubleClicked = useCallback(
    (event: any) => {
      if (onEntityClick && event.data) {
        onEntityClick(event.data);
      }
    },
    [onEntityClick]
  );

  // Handle context menu
  const onCellContextMenu = useCallback(
    (event: any) => {
      if (event.data) {
        handleContextMenu(event.event, event.data);
      }
    },
    [handleContextMenu]
  );

  // Handle global search
  const onFilterChanged = useCallback((event: any) => {}, []);

  // Handle model updated
  const onModelUpdated = useCallback((event: any) => {}, []);

  return (
    <div
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
      style={{
        height: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
        width: "100%",
        overflow: "auto",
        borderRadius: 10,
      }}
    >
      <style>
        {`
        .entity-table-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f5f6fa;
        }
        .entity-table-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #f5f6fa;
        }
        .entity-table-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 6px;
        }
        .entity-table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bfc7d1;
        }
        .ag-theme-balham {
          --ag-row-height: 48px;
          --ag-header-height: 48px;
          --ag-font-size: 14px;
          --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .ag-theme-balham .ag-header-cell {
          font-weight: 600;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        .ag-theme-balham .ag-row {
          border-bottom: 1px solid #f1f3f4;
        }
        .ag-theme-balham .ag-row:hover {
          background-color: #f8f9fa;
        }
        .ag-theme-balham .ag-row-selected {
          background-color: #e3f2fd;
        }
        `}
      </style>

      <div className="entity-table-scrollbar" style={{ height: "100%" }}>
        <AgGridReact
          ref={gridRef}
          theme={themeBalham}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="normal"
          rowSelection="single"
          animateRows={true}
          suppressCellFocus={true}
          enableRangeSelection={true}
          suppressContextMenu={false}
          allowContextMenuWithControlKey={false}
          suppressMenuHide={false}
          pagination={false}
          suppressPaginationPanel={true}
          suppressHorizontalScroll={false}
          suppressRowClickSelection={true}
          suppressRowDeselection={true}
          suppressRowTransform={false}
          suppressAnimationFrame={false}
          suppressBrowserResizeObserver={false}
          suppressColumnVirtualisation={false}
          suppressRowVirtualisation={false}
          rowHeight={48}
          headerHeight={48}
          getRowStyle={() => ({
            display: "flex",
            alignItems: "center",
            cursor: onEntityClick ? "pointer" : "default",
          })}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onCellContextMenu={onCellContextMenu}
          onFilterChanged={onFilterChanged}
          onModelUpdated={onModelUpdated}
          onGridReady={(params) => {
            console.log("AG Grid ready with params:", params);
            console.log("Grid API:", params.api);
            console.log("Row data at grid ready:", rowData);
            console.log("Column definitions at grid ready:", columnDefs);
          }}
          overlayNoRowsTemplate={`<span style="color:#888;">No entities found</span>`}
          overlayLoadingTemplate={`<span style="color:#1976d2;">Loading entities...</span>`}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.mouseY,
            left: contextMenu.mouseX,
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: "150px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuItems.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                borderBottom:
                  index < contextMenuItems.length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
              onClick={() => {
                if (item.action) {
                  item.action();
                }
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={handleClose}
        />
      )}
    </div>
  );
};

export default EntityTableV2;
