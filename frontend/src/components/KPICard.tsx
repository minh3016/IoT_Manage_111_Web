import React from 'react';
import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  delta?: number; // percentage
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend = 'neutral', delta }) => {
  const TrendIcon = trend === 'up' ? ArrowDropUp : trend === 'down' ? ArrowDropDown : null;
  const trendColor = trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary';

  return (
    <Card elevation={0} variant="outlined" sx={{ transition: 'transform 120ms ease', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom variant="h6">
          {title}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" component="div">{value}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            {TrendIcon && (
              <Tooltip title={delta !== undefined ? `${delta > 0 ? '+' : ''}${delta}%` : ''}>
                <Box display="flex" alignItems="center" sx={{ color: trendColor }} aria-label={`trend ${trend}${delta !== undefined ? ` ${delta}%` : ''}`}>
                  <TrendIcon />
                  {delta !== undefined && (
                    <Typography variant="body2" sx={{ ml: -0.5 }}>{delta > 0 ? `+${delta}%` : `${delta}%`}</Typography>
                  )}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
