import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DevelopmentBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => sessionStorage.getItem('devBannerDismissed') === '1');

  useEffect(() => {
    if (dismissed) sessionStorage.setItem('devBannerDismissed', '1');
  }, [dismissed]);

  if (import.meta.env.PROD || dismissed) return null;

  return (
    <Box sx={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.appBar + 1 }} role="status" aria-live="polite">
      <Alert severity="warning" sx={{ borderRadius: 0, py: 0.5 }} icon={false}
        action={
          <IconButton aria-label="Dismiss development banner" color="inherit" size="small" onClick={() => setDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ m: 0, fontSize: 14, fontWeight: 600 }}>Development Mode</AlertTitle>
        Backend API chưa khởi động - Đang sử dụng mock data
      </Alert>
    </Box>
  );
};

export default DevelopmentBanner;
