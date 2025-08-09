import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'deviceId', headerName: 'Device', flex: 1 },
  { field: 'severity', headerName: 'Severity', width: 120 },
  { field: 'message', headerName: 'Message', flex: 2 },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'createdAt', headerName: 'Created', width: 180 },
];

const AlertsGrid: React.FC = () => {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGrid rows={[]} columns={columns} disableRowSelectionOnClick />
    </div>
  );
};

export default AlertsGrid;
