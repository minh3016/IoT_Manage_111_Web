import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Devices,
  CheckCircle,
  Error,
  Build,
} from '@mui/icons-material';
import { useGetDeviceStatisticsQuery } from '@/store/api/devicesApi';
import KPICard from '@/components/KPICard';
import AlertsGrid from '@/components/grids/AlertsGrid';
import ActivitiesGrid from '@/components/grids/ActivitiesGrid';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <KPICard title={title} value={value} icon={<Box sx={{ color, fontSize: 40 }}>{icon}</Box>} trend="neutral" />
);

const DashboardPage: React.FC = () => {
  const {
    data: statistics,
    isLoading,
    error,
  } = useGetDeviceStatisticsQuery();

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">
          Failed to load dashboard data
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Devices"
            value={statistics?.totalDevices || 0}
            icon={<Devices />}
            color="#1976d2"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active"
            value={statistics?.active || 0}
            icon={<CheckCircle />}
            color="#4caf50"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Maintenance"
            value={statistics?.maintenance || 0}
            icon={<Build />}
            color="#ff9800"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Error"
            value={statistics?.error || 0}
            icon={<Error />}
            color="#f44336"
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <ActivitiesGrid />
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Typography color="textSecondary">
              System status information will be displayed here
            </Typography>
          </Paper>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <AlertsGrid />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
