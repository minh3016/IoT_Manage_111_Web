import React from 'react';
import { Box, Button, Typography } from '@mui/material';

type ErrorBoundaryState = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" textAlign="center" p={2}>
          <Typography variant="h5" gutterBottom>Something went wrong</Typography>
          <Typography color="text.secondary" paragraph>
            {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
          </Typography>
          <Button variant="contained" color="primary" onClick={this.handleReload}>Reload</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
