import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { selectTheme } from './store/slices/settingsSlice';
import { setCredentials } from './store/slices/authSlice';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import DevelopmentBanner from './components/DevelopmentBanner';
import SkipToContent from './components/SkipToContent';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardSkeleton from './components/skeletons/DashboardSkeleton';

// Pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const DeviceDetailPage = lazy(() => import('./pages/DeviceDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectTheme);

  // Restore authentication state from localStorage on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch(setCredentials({ user, token }));
      } catch (error) {
        // If parsing fails, clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: themeMode === 'dark' ? '#2b2b2b' : '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: themeMode === 'dark' ? '#6b6b6b' : '#c1c1c1',
              borderRadius: '4px',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DevelopmentBanner />
      <Router>
        <SkipToContent />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                <Suspense fallback={<DashboardSkeleton />}>
                  <DashboardPage />
                </Suspense>
              } />
              <Route path="devices" element={
                <Suspense fallback={<div id="main-content" />}>
                  <DevicesPage />
                </Suspense>
              } />
              <Route path="devices/:id/*" element={
                <Suspense fallback={<div id="main-content" />}>
                  <DeviceDetailPage />
                </Suspense>
              } />
              <Route path="reports" element={
                <Suspense fallback={<div id="main-content" />}>
                  <ReportsPage />
                </Suspense>
              } />
              <Route path="activities" element={
                <Suspense fallback={<div id="main-content" />}>
                  <ActivitiesPage />
                </Suspense>
              } />
              <Route path="settings" element={
                <Suspense fallback={<div id="main-content" />}>
                  <SettingsPage />
                </Suspense>
              } />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Suspense fallback={<div id="main-content" />}>
                      <AdminPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="error" element={
                <Suspense fallback={<div id="main-content" />}>
                  <ErrorPage />
                </Suspense>
              } />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
