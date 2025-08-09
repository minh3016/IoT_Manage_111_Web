import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  Assessment,
  CompareArrows,
  PictureAsPdf,
  GetApp,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ChartsPlaceholder from '@/components/placeholders/ChartsPlaceholder';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['all']);
  const [reportType, setReportType] = useState('temperature');

  const mockDevices = [
    { id: 'all', name: 'All Devices' },
    { id: '1', name: 'Cooling Unit Alpha' },
    { id: '2', name: 'Cooling Unit Beta' },
    { id: '3', name: 'Cooling Unit Gamma' },
  ];

  const mockReportData = [
    { device: 'CM001', avgTemp: 2.3, minTemp: 1.8, maxTemp: 3.1, uptime: '98.5%', alerts: 2 },
    { device: 'CM002', avgTemp: 2.1, minTemp: 1.9, maxTemp: 2.8, uptime: '95.2%', alerts: 5 },
    { device: 'CM003', avgTemp: 2.7, minTemp: 2.0, maxTemp: 4.2, uptime: '87.3%', alerts: 12 },
    { device: 'CM004', avgTemp: 2.2, minTemp: 1.7, maxTemp: 2.9, uptime: '99.1%', alerts: 1 },
  ];

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting report as ${format}`);
  };

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log('Refreshing report data');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1}>
            Reports & Analytics
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Export as CSV">
              <IconButton onClick={() => handleExport('csv')}>
                <GetApp />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PDF">
              <IconButton onClick={() => handleExport('pdf')}>
                <PictureAsPdf />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Report Filters</Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Devices</InputLabel>
                  <Select
                    multiple
                    value={selectedDevices}
                    onChange={(e) => setSelectedDevices(e.target.value as string[])}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={mockDevices.find(d => d.id === value)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {mockDevices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="temperature">Temperature</MenuItem>
                    <MenuItem value="performance">Performance</MenuItem>
                    <MenuItem value="energy">Energy Usage</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<TrendingUp />} label="Trends" />
            <Tab icon={<Assessment />} label="Summary" />
            <Tab icon={<CompareArrows />} label="Comparison" />
          </Tabs>
        </Box>

        {/* Trends Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Temperature Trends</Typography>
                  <ChartsPlaceholder />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Key Metrics</Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Average Temperature</Typography>
                      <Typography variant="h4">2.3°C</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">System Uptime</Typography>
                      <Typography variant="h4">97.8%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Alerts</Typography>
                      <Typography variant="h4">20</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Performance Overview</Typography>
                  <ChartsPlaceholder />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Summary Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Device Performance Summary</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device</TableCell>
                      <TableCell align="right">Avg Temp (°C)</TableCell>
                      <TableCell align="right">Min Temp (°C)</TableCell>
                      <TableCell align="right">Max Temp (°C)</TableCell>
                      <TableCell align="right">Uptime</TableCell>
                      <TableCell align="right">Alerts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockReportData.map((row) => (
                      <TableRow key={row.device}>
                        <TableCell component="th" scope="row">
                          {row.device}
                        </TableCell>
                        <TableCell align="right">{row.avgTemp}</TableCell>
                        <TableCell align="right">{row.minTemp}</TableCell>
                        <TableCell align="right">{row.maxTemp}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={row.uptime}
                            color={parseFloat(row.uptime) > 95 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={row.alerts}
                            color={row.alerts > 5 ? 'error' : row.alerts > 2 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Comparison Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Device Comparison</Typography>
                  <ChartsPlaceholder />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Efficiency Metrics</Typography>
                  <ChartsPlaceholder />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Comparative Analysis</Typography>
                  <ChartsPlaceholder />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </LocalizationProvider>
  );
};

export default ReportsPage;
