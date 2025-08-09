import React from 'react';
import { Grid, Skeleton, Card, CardContent, Box } from '@mui/material';
import KPICardSkeleton from './KPICardSkeleton';

const DashboardSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}><KPICardSkeleton /></Grid>
      <Grid item xs={12} sm={6} md={3}><KPICardSkeleton /></Grid>
      <Grid item xs={12} sm={6} md={3}><KPICardSkeleton /></Grid>
      <Grid item xs={12} sm={6} md={3}><KPICardSkeleton /></Grid>

      <Grid item xs={12} md={8}>
        <Card variant="outlined">
          <CardContent>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton height={20} sx={{ mt: 1 }} />
            <Skeleton height={20} />
            <Skeleton height={20} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Skeleton variant="text" width={160} height={28} />
            <Skeleton height={20} sx={{ mt: 1 }} />
            <Skeleton height={20} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Skeleton variant="text" width={160} height={28} />
            <Skeleton height={20} sx={{ mt: 1 }} />
            <Skeleton height={20} />
            <Skeleton height={20} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default DashboardSkeleton;
