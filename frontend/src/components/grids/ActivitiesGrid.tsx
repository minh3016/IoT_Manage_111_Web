import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'userId', headerName: 'User', width: 120 },
  { field: 'deviceId', headerName: 'Device', width: 120 },
  { field: 'action', headerName: 'Action', width: 150 },
  { field: 'createdAt', headerName: 'Time', width: 180 },
];

const ActivitiesGrid: React.FC = () => {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGrid rows={[]} columns={columns} disableRowSelectionOnClick />
    </div>
  );
};

export default ActivitiesGrid;
