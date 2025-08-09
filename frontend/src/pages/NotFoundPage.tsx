import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Container, Card, CardContent, Breadcrumbs, Link } from '@mui/material';
import { Home, ArrowBack, Search } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
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
            <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The page you are looking for at <code>{location.pathname}</code> doesn't exist or has been moved.
            </Typography>

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" mt={3}>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={() => navigate('/dashboard')}
                size="large"
              >
                Go Home
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                size="large"
              >
                Go Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={() => navigate('/devices')}
                size="large"
              >
                Browse Devices
              </Button>
            </Box>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Breadcrumbs separator="•" sx={{ justifyContent: 'center' }}>
                <Link color="inherit" href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                  Dashboard
                </Link>
                <Link color="inherit" href="/devices" onClick={(e) => { e.preventDefault(); navigate('/devices'); }}>
                  Devices
                </Link>
                <Link color="inherit" href="/reports" onClick={(e) => { e.preventDefault(); navigate('/reports'); }}>
                  Reports
                </Link>
                <Link color="inherit" href="/activities" onClick={(e) => { e.preventDefault(); navigate('/activities'); }}>
                  Activities
                </Link>
              </Breadcrumbs>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
