import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Slider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Palette,
  Save,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTheme, setTheme } from '@/store/slices/settingsSlice';

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

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const [activeTab, setActiveTab] = useState(0);
  
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@coolingmanager.com',
    phone: '+84 901 234 567',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'en',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    temperatureAlerts: true,
    systemAlerts: true,
    maintenanceReminders: true,
    alertThreshold: 5,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordChangeRequired: false,
    loginNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    dataRetention: 90,
    backupFrequency: 'daily',
  });

  const handleSaveProfile = () => {
    console.log('Saving profile settings:', profileSettings);
    // TODO: Implement save functionality
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
    // TODO: Implement save functionality
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings);
    // TODO: Implement save functionality
  };

  const handleSaveSystem = () => {
    console.log('Saving system settings:', systemSettings);
    // TODO: Implement save functionality
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1} gutterBottom>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Palette />} label="Appearance" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={activeTab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileSettings.firstName}
                  onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileSettings.lastName}
                  onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileSettings.phone}
                  onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={profileSettings.timezone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, timezone: e.target.value })}
                  >
                    <MenuItem value="Asia/Ho_Chi_Minh">Ho Chi Minh (UTC+7)</MenuItem>
                    <MenuItem value="Asia/Bangkok">Bangkok (UTC+7)</MenuItem>
                    <MenuItem value="UTC">UTC (UTC+0)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={profileSettings.language}
                    onChange={(e) => setProfileSettings({ ...profileSettings, language: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="vi">Vietnamese</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notification Channels</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          emailNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          smsNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          pushNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="Push Notifications"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alert Types</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.temperatureAlerts}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          temperatureAlerts: e.target.checked 
                        })}
                      />
                    }
                    label="Temperature Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          systemAlerts: e.target.checked 
                        })}
                      />
                    }
                    label="System Alerts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.maintenanceReminders}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          maintenanceReminders: e.target.checked 
                        })}
                      />
                    }
                    label="Maintenance Reminders"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alert Settings</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography gutterBottom>Alert Threshold (°C)</Typography>
                    <Slider
                      value={notificationSettings.alertThreshold}
                      onChange={(_, value) => setNotificationSettings({ 
                        ...notificationSettings, 
                        alertThreshold: value as number 
                      })}
                      min={1}
                      max={10}
                      step={0.5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Quiet Hours Start"
                      type="time"
                      value={notificationSettings.quietHoursStart}
                      onChange={(e) => setNotificationSettings({ 
                        ...notificationSettings, 
                        quietHoursStart: e.target.value 
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Quiet Hours End"
                      type="time"
                      value={notificationSettings.quietHoursEnd}
                      onChange={(e) => setNotificationSettings({ 
                        ...notificationSettings, 
                        quietHoursEnd: e.target.value 
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box mt={3}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveNotifications}>
                    Save Notifications
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ 
                        ...securitySettings, 
                        twoFactorAuth: e.target.checked 
                      })}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => setSecuritySettings({ 
                        ...securitySettings, 
                        loginNotifications: e.target.checked 
                      })}
                    />
                  }
                  label="Login Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    sessionTimeout: parseInt(e.target.value) || 30 
                  })}
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveSecurity}>
                Save Security Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Appearance Settings</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={currentTheme}
                    onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark'))}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoRefresh}
                      onChange={(e) => setSystemSettings({ 
                        ...systemSettings, 
                        autoRefresh: e.target.checked 
                      })}
                    />
                  }
                  label="Auto-refresh Data"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Refresh Interval (seconds)"
                  type="number"
                  value={systemSettings.refreshInterval}
                  onChange={(e) => setSystemSettings({ 
                    ...systemSettings, 
                    refreshInterval: parseInt(e.target.value) || 30 
                  })}
                  disabled={!systemSettings.autoRefresh}
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveSystem}>
                Save Appearance Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default SettingsPage;
