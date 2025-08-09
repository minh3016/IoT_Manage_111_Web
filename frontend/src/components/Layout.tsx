import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSidebarOpen,
  toggleSidebar,
  setSidebarOpen,
} from '@/store/slices/uiSlice';
import { selectTheme, setTheme } from '@/store/slices/settingsSlice';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { getSignalRClient } from '@/services/signalrClient';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';
import Breadcrumbs from './Breadcrumbs';

const DRAWER_WIDTH = 280;

const Layout: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const currentTheme = useAppSelector(selectTheme);
  const currentUser = useAppSelector(selectCurrentUser);

  // Initialize SignalR connection
  useEffect(() => {
    const signalRClient = getSignalRClient(() => {
      return localStorage.getItem('token');
    });

    if (currentUser) {
      signalRClient.connect().catch(console.error);
    }

    return () => {
      signalRClient.disconnect();
    };
  }, [currentUser]);

  // Handle responsive sidebar
  useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    } else {
      dispatch(setSidebarOpen(true));
    }
  }, [isMobile, dispatch]);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleThemeToggle = () => {
    dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen &&
            !isMobile && {
              marginLeft: DRAWER_WIDTH,
              width: `calc(100% - ${DRAWER_WIDTH}px)`,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }} id="main-heading" tabIndex={-1}>
            Cooling Manager
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            aria-label="toggle theme"
          >
            {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <UserMenu />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        id="main-content"
        role="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: isMobile ? 0 : sidebarOpen ? 0 : `-${DRAWER_WIDTH}px`,
        }}
      >
        <Toolbar />
        <Breadcrumbs />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
