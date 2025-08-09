import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Devices,
  AdminPanelSettings,
  Assessment,
  Settings,
  History,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    text: 'Devices',
    icon: <Devices />,
    path: '/devices',
  },
  {
    text: 'Reports',
    icon: <Assessment />,
    path: '/reports',
  },
  {
    text: 'Activities',
    icon: <History />,
    path: '/activities',
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: '/settings',
  },
  {
    text: 'Admin',
    icon: <AdminPanelSettings />,
    path: '/admin',
    roles: ['admin'],
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    if (!currentUser) return false;
    
    return item.roles.includes(currentUser.role);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <List>
        {menuItems
          .filter(hasAccess)
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Additional sections can be added here */}
    </Box>
  );
};

export default Sidebar;
