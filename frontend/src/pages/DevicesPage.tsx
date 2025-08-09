import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  ViewList,
  ViewModule,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useGetDevicesQuery } from '@/store/api/devicesApi';
import type { Device } from '@/types';

const DevicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const { data: devicesData, isLoading, refetch } = useGetDevicesQuery({
    search: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: 1,
    pageSize: 100,
  });

  const devices = devicesData?.data || [];

  const handleViewDevice = (device: Device) => {
    navigate(`/devices/${device.id}`);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setAddDeviceOpen(true);
  };

  const handleDeleteDevice = (device: Device) => {
    if (confirm(`Are you sure you want to delete device "${device.deviceName}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete device:', device.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'deviceId', headerName: 'Device ID', width: 120 },
    { field: 'deviceName', headerName: 'Device Name', flex: 1, minWidth: 200 },
    { field: 'ownerName', headerName: 'Owner', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: 'installationDate', headerName: 'Installed', width: 120 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => handleViewDevice(params.row)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEditDevice(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDeleteDevice(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1}>
          Devices
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDeviceOpen(true)}
        >
          Add Device
        </Button>
      </Box>

      {/* Filters and Controls */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="cards" aria-label="cards view">
            <ViewModule />
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      {viewMode === 'grid' ? (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={devices}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
          />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" noWrap>
                      {device.deviceName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setSelectedDevice(device);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    ID: {device.deviceId}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    Owner: {device.ownerName}
                  </Typography>
                  <Chip
                    label={device.status}
                    color={getStatusColor(device.status) as any}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDevice(device)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          selectedDevice && handleViewDevice(selectedDevice);
          setMenuAnchor(null);
        }}>
          <Visibility sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => {
          selectedDevice && handleEditDevice(selectedDevice);
          setMenuAnchor(null);
        }}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          selectedDevice && handleDeleteDevice(selectedDevice);
          setMenuAnchor(null);
        }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Device Dialog */}
      <AddDeviceDialog
        open={addDeviceOpen}
        onClose={() => {
          setAddDeviceOpen(false);
          setSelectedDevice(null);
        }}
        device={selectedDevice}
      />
    </Box>
  );
};

// Add Device Dialog Component
interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  device?: Device | null;
}

const AddDeviceDialog: React.FC<AddDeviceDialogProps> = ({ open, onClose, device }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    ownerName: '',
    phoneNumber: '',
    installationAddress: '',
    warrantyMonths: 12,
  });

  React.useEffect(() => {
    if (device) {
      setFormData({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        ownerName: device.ownerName,
        phoneNumber: device.phoneNumber || '',
        installationAddress: device.installationAddress || '',
        warrantyMonths: device.warrantyMonths,
      });
    } else {
      setFormData({
        deviceId: '',
        deviceName: '',
        ownerName: '',
        phoneNumber: '',
        installationAddress: '',
        warrantyMonths: 12,
      });
    }
  }, [device, open]);

  const handleSubmit = () => {
    // TODO: Implement save functionality
    console.log('Save device:', formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Device ID"
            value={formData.deviceId}
            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Device Name"
            value={formData.deviceName}
            onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Owner Name"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            fullWidth
          />
          <TextField
            label="Installation Address"
            value={formData.installationAddress}
            onChange={(e) => setFormData({ ...formData, installationAddress: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            label="Warranty (Months)"
            type="number"
            value={formData.warrantyMonths}
            onChange={(e) => setFormData({ ...formData, warrantyMonths: parseInt(e.target.value) || 0 })}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {device ? 'Update' : 'Add'} Device
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DevicesPage;
