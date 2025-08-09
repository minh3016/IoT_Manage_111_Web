import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated, selectCurrentUser, setCredentials } from '@/store/slices/authSlice';
import { useValidateTokenQuery } from '@/store/api/authApi';
import type { UserRole } from '@/types';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Skip token validation in development mode with mock data
  const isDevelopment = import.meta.env.DEV;

  const {
    data: validationData,
    isLoading: isValidating,
    error: validationError,
  } = useValidateTokenQuery(undefined, {
    skip: !isAuthenticated || isDevelopment,
  });

  useEffect(() => {
    if (validationData?.valid && validationData.user) {
      dispatch(setCredentials({
        user: validationData.user,
        token: localStorage.getItem('token') || '',
      }));
    }
  }, [validationData, dispatch]);

  // Show loading spinner while validating token (only in production)
  if (isAuthenticated && isValidating && !isDevelopment) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // In development mode, only check if user is authenticated
  if (isDevelopment) {
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else {
    // In production, check token validation
    if (!isAuthenticated || validationError || !validationData?.valid) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // Check role-based access
  if (requiredRole && currentUser) {
    const hasRequiredRole = (() => {
      switch (requiredRole) {
        case 'admin':
          return currentUser.role === 'admin';
        case 'technician':
          return ['admin', 'technician'].includes(currentUser.role);
        case 'user':
          return ['admin', 'technician', 'user'].includes(currentUser.role);
        default:
          return false;
      }
    })();

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
