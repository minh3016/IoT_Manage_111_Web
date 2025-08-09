import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from '@mui/material';
import {
  AccountCircle,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { addToast, clearToasts } from '@/store/slices/uiSlice';
import { apiSlice } from '@/store/api/apiSlice';

const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false);

    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all application state
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear Redux state
      dispatch(logout());
      dispatch(clearToasts());

      // Clear all API cache
      dispatch(apiSlice.util.resetApiState());

      // Show success message and redirect
      dispatch(addToast({
        type: 'success',
        message: 'Logged out successfully',
        duration: 3000,
      }));

      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const getUserInitials = (user: typeof currentUser) => {
    if (!user) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'technician':
        return 'Technician';
      case 'user':
        return 'User';
      default:
        return role;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        color="inherit"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          {getUserInitials(currentUser)}
        </Avatar>
      </IconButton>
      
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {/* User Info */}
        <MenuItem disabled>
          <div>
            <Typography variant="subtitle2" noWrap>
              {currentUser.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {getRoleDisplayName(currentUser.role)}
            </Typography>
          </div>
        </MenuItem>
        
        <Divider />
        
        {/* Menu Items */}
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText',
            }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'inherit' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to login again to access the application.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserMenu;
