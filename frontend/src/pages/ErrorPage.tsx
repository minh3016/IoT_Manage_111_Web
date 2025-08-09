import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Box, Typography, Button, Container, Card, CardContent, Alert } from '@mui/material';
import { Home, Refresh, BugReport } from '@mui/icons-material';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const error = useRouteError() as any;

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    // TODO: Implement error reporting
    console.log('Report error:', error);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2, color: 'error.main' }}>
              500
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Internal Server Error
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Something went wrong on our end. We're working to fix this issue.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Error Details:</strong><br />
                  {error.statusText || error.message || 'Unknown error occurred'}
                </Typography>
              </Alert>
            )}
            
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" mt={3}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleReload}
                size="large"
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate('/dashboard')}
                size="large"
              >
                Go Home
              </Button>
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={handleReportError}
                size="large"
              >
                Report Issue
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ErrorPage;
