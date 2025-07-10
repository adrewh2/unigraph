import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo, useState } from "react";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface ProjectRow {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  last_updated_at?: string;
}

interface ProjectsListProps {
  projects: ProjectRow[];
  loading?: boolean;
  error?: string | null;
  onProjectDoubleClick?: (projectId: string) => void;
  onExport?: (projectId: string) => void;
  onCopy?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
  style?: React.CSSProperties;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading,
  error,
  onProjectDoubleClick,
  onExport,
  onCopy,
  onDelete,
  onEdit,
  style = {},
}) => {
  // Action column renderer
  const ActionCellRenderer = (props: any) => {
    const { data } = props;
    return (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onExport && (
          <button
            title="Export"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
              padding: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onExport(data.id);
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V4M12 16l-4-4m4 4l4-4M4 20h16"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {onCopy && (
          <button
            title="Copy"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
              padding: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCopy(data.id);
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                stroke="#1976d2"
                strokeWidth="2"
              />
              <rect
                x="2"
                y="2"
                width="13"
                height="13"
                rx="2"
                stroke="#1976d2"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}
        {onEdit && (
          <button
            title="Edit"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1976d2",
              padding: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data.id);
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            title="Delete"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#e11d48",
              padding: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="6"
                width="14"
                height="14"
                rx="2"
                stroke="#e11d48"
                strokeWidth="2"
              />
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="#e11d48"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}
      </div>
    );
  };

  const [colDefs] = useState<ColDef<ProjectRow>[]>([
    { headerName: "Name", field: "name", flex: 1, filter: false },
    { headerName: "Description", field: "description", flex: 2, filter: false },
    {
      headerName: "Last Updated",
      field: "last_updated_at",
      flex: 1,
      filter: false,
      valueFormatter: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
      comparator: (valueA, valueB) => {
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
    {
      headerName: "Created",
      field: "created_at",
      flex: 1,
      filter: false,
      valueFormatter: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "",
      comparator: (valueA, valueB) => {
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
    {
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      maxWidth: 160,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      filter: false, // Disable built-in filtering to prevent interference
      sortable: true,
      resizable: true,
      minWidth: 120,
    }),
    []
  );

  return (
    <div
      style={{
        width: "100%",
        height: "320px",
        borderRadius: 10,
        border: "1px solid #ccc",
        ...style,
      }}
    >
      <AgGridReact
        theme={themeBalham}
        rowData={projects}
        loadingOverlayComponentParams={{
          loadingMessage: "Loading projects...",
        }}
        loading={loading}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        rowSelection="single"
        animateRows={true}
        suppressCellFocus={true}
        enableRangeSelection={true}
        suppressContextMenu={false}
        allowContextMenuWithControlKey={false}
        suppressMenuHide={false}
        onRowDoubleClicked={(event) => {
          if (event.data && event.data.id && onProjectDoubleClick) {
            onProjectDoubleClick(event.data.id);
          }
        }}
        overlayNoRowsTemplate={
          error
            ? `<span style="color:red;">${error}</span>`
            : `<span style="color:#888;">No projects found</span>`
        }
        sideBar={true}
      />
    </div>
  );
};

export default ProjectsList;
