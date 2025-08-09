import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const KPICardSkeleton: React.FC = () => (
  <Card elevation={0} variant="outlined">
    <CardContent>
      <Skeleton width={120} height={20} sx={{ mb: 1 }} />
      <Box display="flex" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton width={40} height={36} />
      </Box>
    </CardContent>
  </Card>
);

export default KPICardSkeleton;
