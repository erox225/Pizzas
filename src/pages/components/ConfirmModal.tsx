import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  icon?: React.ReactNode;
  message: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  icon,
  message,
  onCancel,
  onConfirm,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  children
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{
      sx: {
        borderRadius: 3,
        boxShadow: 8,
        p: 0,
      }
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#1976d2',
        color: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        px: 2.5,
        py: 2.2,
        gap: 1.5
      }}>
        {icon && <Box sx={{ fontSize: 28 }}>{icon}</Box>}
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </Box>
      <DialogContent sx={{ pt: 2.5, pb: 1.5, px: 3 }}>
        <Typography variant="body1" sx={{ mb: 1.5 }}>{message}</Typography>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2.2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="primary" sx={{ borderRadius: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;

