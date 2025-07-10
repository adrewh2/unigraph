import type { ColDef } from "ag-grid-community";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeBalham,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-balham.css";
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
  style?: React.CSSProperties;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading,
  error,
  onProjectDoubleClick,
  style = {},
}) => {
  const [showCreatedColumn, setShowCreatedColumn] = useState(false);

  const [colDefs] = useState<ColDef<ProjectRow>[]>([
    { headerName: "Name", field: "name", flex: 1, filter: false },
    { headerName: "Description", field: "description", flex: 2, filter: false },
    {
      headerName: "Created",
      field: "created_at",
      flex: 1,
      filter: false,
      hide: true, // Hidden by default
      // Show only date and hour:minute, but keep full value for sorting
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
        // Sort by full date/time (including seconds)
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
    {
      headerName: "Last Updated",
      field: "last_updated_at",
      flex: 1,
      filter: false,
      // Show only date and hour:minute, but keep full value for sorting
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
        // Sort by full date/time (including seconds)
        const a = valueA ? new Date(valueA as string).getTime() : 0;
        const b = valueB ? new Date(valueB as string).getTime() : 0;
        return a - b;
      },
    },
  ]);

  // Update column visibility based on state
  const updatedColDefs = useMemo(() => {
    return colDefs.map((col) => {
      if (col.field === "created_at") {
        return { ...col, hide: !showCreatedColumn };
      }
      return col;
    });
  }, [colDefs, showCreatedColumn]);

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
        border: "1px solid #ccc", // Add border for debugging
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
        columnDefs={updatedColDefs}
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
