import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  TextField,
  Breadcrumbs,
  Link,
  Alert,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  CalendarToday,
  ThermostatAuto,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { useGetDeviceQuery } from '@/store/api/devicesApi';
import ChartsPlaceholder from '@/components/placeholders/ChartsPlaceholder';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`device-tabpanel-${index}`}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: device, isLoading, error } = useGetDeviceQuery({
    id: parseInt(id || '0'),
    fields: 'all'
  });

  // Mock real-time data
  const [sensorData] = useState({
    tempColdStorage: 2.5,
    tempEnvironment: 28.3,
    tempSolution: 15.2,
    pressureSuction: 2.1,
    pressureDischarge: 8.7,
    superheatCurrent: 5.2,
    voltageA: 220.5,
    currentA: 12.3,
  });

  const [gpioStates, setGpioStates] = useState({
    relay1: true,
    relay2: false,
    relay3: true,
    relay4: false,
    fan1: true,
    fan2: true,
    fan3: false,
    fan4: false,
    valve1: true,
    valve2: false,
    valve3: true,
    valve4: false,
  });

  const [parameters] = useState([
    { name: 'Target Temperature', value: '2.0', unit: '°C', description: 'Cold storage target temperature' },
    { name: 'Compressor Delay', value: '300', unit: 'seconds', description: 'Delay before compressor restart' },
    { name: 'Defrost Interval', value: '6', unit: 'hours', description: 'Time between defrost cycles' },
    { name: 'Alarm Threshold', value: '5.0', unit: '°C', description: 'Temperature alarm threshold' },
  ]);

  const [activities] = useState([
    { id: 1, timestamp: '2024-01-15 14:30:00', action: 'Temperature alarm cleared', severity: 'info' },
    { id: 2, timestamp: '2024-01-15 14:25:00', action: 'Compressor started', severity: 'success' },
    { id: 3, timestamp: '2024-01-15 14:20:00', action: 'High temperature detected', severity: 'warning' },
    { id: 4, timestamp: '2024-01-15 14:15:00', action: 'Defrost cycle completed', severity: 'info' },
    { id: 5, timestamp: '2024-01-15 14:10:00', action: 'System maintenance mode disabled', severity: 'success' },
  ]);

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading device details...</Typography>
      </Box>
    );
  }

  if (error || !device) {
    return (
      <Box>
        <Alert severity="error">
          Device not found or failed to load device details.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/devices')} sx={{ mt: 2 }}>
          Back to Devices
        </Button>
      </Box>
    );
  }

  const handleGpioToggle = (component: string, number: number) => {
    const key = `${component}${number}` as keyof typeof gpioStates;
    setGpioStates(prev => ({ ...prev, [key]: !prev[key] }));
    // TODO: Send GPIO control command via API
    console.log(`Toggle ${component}${number}:`, !gpioStates[key]);
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" href="/devices" onClick={(e) => { e.preventDefault(); navigate('/devices'); }}>
          Devices
        </Link>
        <Typography color="text.primary">{device.deviceName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/devices')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1}>
              {device.deviceName}
            </Typography>
            <Typography color="text.secondary">
              ID: {device.deviceId} • Type: {device.deviceType}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={device.status}
          color={getStatusColor(device.status) as any}
          variant="outlined"
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Sensor Data" />
          <Tab label="GPIO Control" />
          <Tab label="Parameters" />
          <Tab label="Activity Log" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Device Information</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn color="action" />
                    <Typography variant="body2">{device.installationAddress}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone color="action" />
                    <Typography variant="body2">{device.phoneNumber}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday color="action" />
                    <Typography variant="body2">
                      Installed: {new Date(device.installationDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Owner: {device.ownerName}
                  </Typography>
                  <Typography variant="body2">
                    Warranty: {device.warrantyMonths} months
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Status</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <ThermostatAuto sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Typography variant="h4">{sensorData.tempColdStorage}°C</Typography>
                      <Typography color="text.secondary">Cold Storage</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Speed sx={{ fontSize: 40, color: 'secondary.main' }} />
                      <Typography variant="h4">{sensorData.pressureSuction}</Typography>
                      <Typography color="text.secondary">Pressure (bar)</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Temperature Trends</Typography>
                <ChartsPlaceholder />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sensor Data Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Temperature Sensors</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Cold Storage:</Typography>
                    <Typography fontWeight="bold">{sensorData.tempColdStorage}°C</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Environment:</Typography>
                    <Typography fontWeight="bold">{sensorData.tempEnvironment}°C</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Solution:</Typography>
                    <Typography fontWeight="bold">{sensorData.tempSolution}°C</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Superheat Current:</Typography>
                    <Typography fontWeight="bold">{sensorData.superheatCurrent}°C</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pressure & Electrical</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Suction Pressure:</Typography>
                    <Typography fontWeight="bold">{sensorData.pressureSuction} bar</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Discharge Pressure:</Typography>
                    <Typography fontWeight="bold">{sensorData.pressureDischarge} bar</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Voltage A:</Typography>
                    <Typography fontWeight="bold">{sensorData.voltageA}V</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Current A:</Typography>
                    <Typography fontWeight="bold">{sensorData.currentA}A</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sensor Data Visualization</Typography>
                <ChartsPlaceholder />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* GPIO Control Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Relays</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {[1, 2, 3, 4].map(num => (
                    <FormControlLabel
                      key={`relay${num}`}
                      control={
                        <Switch
                          checked={gpioStates[`relay${num}` as keyof typeof gpioStates]}
                          onChange={() => handleGpioToggle('relay', num)}
                        />
                      }
                      label={`Relay ${num}`}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fans</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {[1, 2, 3, 4].map(num => (
                    <FormControlLabel
                      key={`fan${num}`}
                      control={
                        <Switch
                          checked={gpioStates[`fan${num}` as keyof typeof gpioStates]}
                          onChange={() => handleGpioToggle('fan', num)}
                        />
                      }
                      label={`Fan ${num}`}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Valves</Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {[1, 2, 3, 4].map(num => (
                    <FormControlLabel
                      key={`valve${num}`}
                      control={
                        <Switch
                          checked={gpioStates[`valve${num}` as keyof typeof gpioStates]}
                          onChange={() => handleGpioToggle('valve', num)}
                        />
                      }
                      label={`Valve ${num}`}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info">
              GPIO controls are applied in real-time. Changes may take a few seconds to reflect in the system.
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Parameters Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {parameters.map((param, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{param.name}</Typography>
                  <TextField
                    fullWidth
                    value={param.value}
                    InputProps={{
                      endAdornment: param.unit,
                    }}
                    helperText={param.description}
                    margin="normal"
                  />
                  <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                    Update
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Activity Log Tab */}
      <TabPanel value={activeTab} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Activities</Typography>
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getSeverityIcon(activity.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default DeviceDetailPage;
