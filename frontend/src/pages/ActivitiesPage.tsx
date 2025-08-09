import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Pagination,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Refresh,
  CheckCircle,
  Warning,
  Error,
  Info,
  Person,
  Memory,
  Timeline,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ActivitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);

  const mockActivities = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:00',
      user: 'admin',
      device: 'CM001',
      action: 'Temperature alarm cleared',
      type: 'system',
      severity: 'info',
      details: 'Cold storage temperature returned to normal range (2.1°C)',
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:00',
      user: 'tech1',
      device: 'CM002',
      action: 'Compressor started manually',
      type: 'user',
      severity: 'success',
      details: 'Manual compressor start initiated by technician',
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:00',
      user: 'system',
      device: 'CM001',
      action: 'High temperature detected',
      type: 'alert',
      severity: 'warning',
      details: 'Cold storage temperature exceeded threshold (4.2°C)',
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:00',
      user: 'system',
      device: 'CM003',
      action: 'Defrost cycle completed',
      type: 'system',
      severity: 'info',
      details: 'Automatic defrost cycle completed successfully',
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:00',
      user: 'admin',
      device: 'CM002',
      action: 'Maintenance mode disabled',
      type: 'user',
      severity: 'success',
      details: 'Device returned to normal operation mode',
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:00',
      user: 'system',
      device: 'CM004',
      action: 'Communication error',
      type: 'error',
      severity: 'error',
      details: 'Failed to establish connection with device',
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:00:00',
      user: 'tech2',
      device: 'CM001',
      action: 'Parameter updated',
      type: 'user',
      severity: 'info',
      details: 'Target temperature changed from 2.0°C to 2.5°C',
    },
    {
      id: 8,
      timestamp: '2024-01-15 13:55:00',
      user: 'system',
      device: 'CM003',
      action: 'Backup completed',
      type: 'system',
      severity: 'success',
      details: 'Device configuration backup completed',
    },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <Person color="primary" />;
      case 'system': return <Memory color="secondary" />;
      case 'alert': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Timeline color="action" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || activity.severity === severityFilter;
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1} gutterBottom>
          Activity Log
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="user">User Action</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="alert">Alert</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <Tooltip title="Refresh">
                  <IconButton>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Activities ({filteredActivities.length})
              </Typography>
            </Box>

            <List>
              {paginatedActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 1 }}>
                      {getSeverityIcon(activity.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {getTypeIcon(activity.type)}
                          <Typography variant="subtitle1">
                            {activity.action}
                          </Typography>
                          <Chip
                            label={activity.severity}
                            color={getSeverityColor(activity.severity) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.details}
                          </Typography>
                          <Box display="flex" gap={2} mt={1}>
                            <Typography variant="caption">
                              Device: {activity.device}
                            </Typography>
                            <Typography variant="caption">
                              User: {activity.user}
                            </Typography>
                            <Typography variant="caption">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < paginatedActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default ActivitiesPage;
