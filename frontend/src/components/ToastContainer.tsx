import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectToasts, removeToast } from '@/store/slices/uiSlice';

const ToastContainer: React.FC = () => {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  const handleClose = (toastId: string) => {
    dispatch(removeToast(toastId));
  };

  // Auto-remove toasts after their duration
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  return (
    <>
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 6000}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            top: `${80 + index * 70}px !important`, // Stack toasts vertically
          }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.type as AlertColor}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastContainer;
