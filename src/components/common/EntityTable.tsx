import { MaterialReactTable, MRT_ColumnDef } from "material-react-table";
import React, { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Entity } from "../../core/model/entity/abstractEntity";
import { EntitiesContainer } from "../../core/model/entity/entitiesContainer";
import { SceneGraph } from "../../core/model/SceneGraph";
import { ContextMenuItem } from "./ContextMenu";
import styles from "./EntityTable.module.css";

interface EntityTableProps {
  container: EntitiesContainer<any, any>;
  sceneGraph: SceneGraph;
  onEntityClick?: (entity: Entity) => void;
  renderActions?: (entity: Entity) => React.ReactNode;
  isDarkMode?: boolean;
  maxHeight?: string;
}

const EntityTable: React.FC<EntityTableProps> = ({
  container,
  sceneGraph,
  onEntityClick,
  renderActions,
  isDarkMode = false,
  maxHeight = 600,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    entity: Entity | null;
  } | null>(null);

  const THEME = {
    light: {
      background: "#ffffff",
      tableBackground: "rgba(255, 255, 255, 0.8)",
      headerBackground: "rgba(255, 255, 255, 0.95)",
      rowBackground: "rgba(255, 255, 255, 0.6)",
      rowHover: "rgba(0, 122, 255, 0.1)",
      text: "#000000",
      mutedText: "#666666",
      border: "rgba(0, 0, 0, 0.1)",
      input: {
        background: "rgba(0, 0, 0, 0.05)",
        focusBackground: "rgba(0, 0, 0, 0.08)",
        text: "#000000",
        placeholder: "#666666",
      },
      tag: {
        background: "rgba(0, 122, 255, 0.1)",
        text: "#0066cc",
      },
      code: {
        background: "rgba(0, 0, 0, 0.05)",
        text: "#333333",
      },
    },
    dark: {
      background: "#1a1a1a",
      tableBackground: "rgba(0, 0, 0, 0.3)",
      headerBackground: "rgba(30, 30, 30, 0.95)",
      rowBackground: "rgba(255, 255, 255, 0.03)",
      rowHover: "rgba(255, 255, 255, 0.05)",
      text: "#ffffff",
      mutedText: "#999999",
      border: "rgba(255, 255, 255, 0.1)",
      input: {
        background: "rgba(255, 255, 255, 0.05)",
        focusBackground: "rgba(255, 255, 255, 0.08)",
        text: "#ffffff",
        placeholder: "#999999",
      },
      tag: {
        background: "rgba(64, 156, 255, 0.2)",
        text: "#409cff",
      },
      code: {
        background: "rgba(255, 255, 255, 0.05)",
        text: "#e2e8f0",
      },
    },
  };

  const theme = isDarkMode ? THEME.dark : THEME.light;

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

  const handleContextMenu = (event: React.MouseEvent, entity: Entity) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            entity,
          }
        : null
    );
  };

  const columns = useMemo<MRT_ColumnDef<Entity>[]>(() => {
    const COLUMN_ORDER = ["id", "type", "tags", "userData"];
    const allColumns = new Set<string>();

    container.forEach((entity) => {
      Object.keys(entity.getData()).forEach((key) => allColumns.add(key));
    });

    const orderedColumns = COLUMN_ORDER.filter((col) => allColumns.has(col));
    const remainingColumns = Array.from(allColumns).filter(
      (col) => !COLUMN_ORDER.includes(col)
    );

    return [...orderedColumns, ...remainingColumns].map((col) => ({
      accessorKey: `data.${col}`,
      header: col,
      Cell: ({ row }) => {
        const value = (row.original.getData() as any)[col];
        return formatValue(value);
      },
      filterFn: (row, _columnId, filterValue) => {
        const value = (row.original.getData() as any)[col];
        return searchInValue(value, filterValue);
      },
    }));
  }, [container, searchInValue]);

  const { setEditingEntity, setJsonEditEntity } = useAppContext();

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

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <div
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
      style={{
        height: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px`,
      }}
    >
      <MaterialReactTable
        columns={columns}
        data={container.toArray()}
        enableColumnPinning
        enableFacetedValues
        enableRowActions
        enableRowSelection
        muiTableContainerProps={{
          sx: {
            maxHeight: "calc(100% - 100px)", // Leave space for pagination
          },
        }}
        muiTablePaperProps={{
          sx: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
        initialState={{
          density: "compact",
          pagination: { pageSize: 25, pageIndex: 0 },
        }}
        enableStickyHeader
        enableBottomToolbar
      />
    </div>
  );
};

export default EntityTable;
