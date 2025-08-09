import React from 'react';
import { Box, Typography } from '@mui/material';

const ChartsPlaceholder: React.FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={240}>
    <Typography variant="body1" color="text.secondary">
      Charts will appear here (real-time ready)
    </Typography>
  </Box>
);

export default ChartsPlaceholder;
