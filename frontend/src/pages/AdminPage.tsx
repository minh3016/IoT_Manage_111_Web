import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  Security,
  Backup,
  Restore,
  Settings,
  HealthAndSafety,
  Timeline,
  Warning,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';

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

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@coolingmanager.com', role: 'admin', isActive: true, lastLogin: '2024-01-15 10:30:00' },
    { id: 2, username: 'tech1', email: 'tech1@coolingmanager.com', role: 'technician', isActive: true, lastLogin: '2024-01-15 09:15:00' },
    { id: 3, username: 'user1', email: 'user1@coolingmanager.com', role: 'user', isActive: true, lastLogin: '2024-01-14 16:45:00' },
    { id: 4, username: 'user2', email: 'user2@coolingmanager.com', role: 'user', isActive: false, lastLogin: '2024-01-10 14:20:00' },
  ];

  const mockAuditLogs = [
    { id: 1, timestamp: '2024-01-15 14:30:00', user: 'admin', action: 'User created', details: 'Created user: tech2', severity: 'info' },
    { id: 2, timestamp: '2024-01-15 14:25:00', user: 'tech1', action: 'Device updated', details: 'Updated device CM001 parameters', severity: 'info' },
    { id: 3, timestamp: '2024-01-15 14:20:00', user: 'system', action: 'Backup completed', details: 'Daily backup completed successfully', severity: 'success' },
    { id: 4, timestamp: '2024-01-15 14:15:00', user: 'admin', action: 'System settings changed', details: 'Updated notification settings', severity: 'warning' },
  ];

  const mockSystemHealth = {
    status: 'healthy',
    uptime: '15 days, 8 hours',
    version: '1.0.0',
    lastBackup: '2024-01-15 02:00:00',
    diskUsage: 45,
    memoryUsage: 68,
    cpuUsage: 23,
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      console.log('Delete user:', user.id);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'technician': return 'warning';
      case 'user': return 'info';
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
      <Typography variant="h4" component="h1" id="main-heading" tabIndex={-1} gutterBottom>
        System Administration
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<PersonAdd />} label="Users" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Settings />} label="System" />
          <Tab icon={<Timeline />} label="Audit Logs" />
          <Tab icon={<HealthAndSafety />} label="Health" />
        </Tabs>
      </Box>

      {/* Users Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">User Management</Typography>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={handleAddUser}>
            Add User
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user)} size="small">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Password Policy</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require strong passwords"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable two-factor authentication"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Force password change every 90 days"
                  />
                  <TextField
                    label="Minimum password length"
                    type="number"
                    defaultValue={8}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Session Management</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Session timeout (minutes)"
                    type="number"
                    defaultValue={30}
                    size="small"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-logout on inactivity"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Allow concurrent sessions"
                  />
                  <Button variant="outlined" size="small">
                    Revoke All Sessions
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* System Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Backup & Restore</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button variant="contained" startIcon={<Backup />}>
                    Create Backup
                  </Button>
                  <Button variant="outlined" startIcon={<Restore />}>
                    Restore from Backup
                  </Button>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable automatic daily backups"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Last backup: {mockSystemHealth.lastBackup}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Configuration</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="System Name"
                    defaultValue="Cooling Manager"
                    size="small"
                  />
                  <TextField
                    label="Admin Email"
                    defaultValue="admin@coolingmanager.com"
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Default Language</InputLabel>
                    <Select defaultValue="en">
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="vi">Vietnamese</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="outlined" size="small">
                    Save Configuration
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Audit Logs Tab */}
      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Audit Log</Typography>
            <List>
              {mockAuditLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getSeverityIcon(log.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${log.action} by ${log.user}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">{log.details}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockAuditLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Health Tab */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>System Status</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Status:</Typography>
                    <Chip
                      label={mockSystemHealth.status}
                      color="success"
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Uptime:</Typography>
                    <Typography>{mockSystemHealth.uptime}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Version:</Typography>
                    <Typography>{mockSystemHealth.version}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resource Usage</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">CPU Usage</Typography>
                      <Typography variant="body2">{mockSystemHealth.cpuUsage}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1 }}>
                      <Box
                        sx={{
                          width: `${mockSystemHealth.cpuUsage}%`,
                          height: 8,
                          bgcolor: 'primary.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Memory Usage</Typography>
                      <Typography variant="body2">{mockSystemHealth.memoryUsage}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1 }}>
                      <Box
                        sx={{
                          width: `${mockSystemHealth.memoryUsage}%`,
                          height: 8,
                          bgcolor: 'warning.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Disk Usage</Typography>
                      <Typography variant="body2">{mockSystemHealth.diskUsage}%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1 }}>
                      <Box
                        sx={{
                          width: `${mockSystemHealth.diskUsage}%`,
                          height: 8,
                          bgcolor: 'success.main',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* User Dialog */}
      <UserDialog
        open={userDialogOpen}
        onClose={() => {
          setUserDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
};

// User Dialog Component
interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user?: any;
}

const UserDialog: React.FC<UserDialogProps> = ({ open, onClose, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    isActive: true,
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        role: 'user',
        isActive: true,
      });
    }
  }, [user, open]);

  const handleSubmit = () => {
    console.log('Save user:', formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="technician">Technician</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {user ? 'Update' : 'Create'} User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminPage;
