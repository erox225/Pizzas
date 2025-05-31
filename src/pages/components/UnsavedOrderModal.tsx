import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface UnsavedOrderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UnsavedOrderModal({
  open,
  onClose,
  onConfirm
}: UnsavedOrderModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          width: 440,
          height: 320,
          borderRadius: 3,
          border: "2px solid #bf1e2d",
          overflow: "hidden",
          fontFamily: "'Roboto Slab', serif",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)"
        }
      }}
    >
      {/* Cabecera */}
      <Box
        sx={{
          backgroundColor: "#bf1e2d",
          color: "white",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        <WarningAmberIcon />
        <Typography variant="h6" fontWeight="bold">
          Aviso
        </Typography>
      </Box>

      {/* Contenido */}
      <DialogContent
        sx={{
          px: 3,
          py: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            lineHeight: 1.6,
            fontSize: "1.2rem"
          }}
        >
          Estás creando una nueva orden.
          <br />
          Si seleccionas otra, <strong>se perderá el contenido actual.</strong>
        </Typography>

        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
            color: "#555",
            fontStyle: "italic",
            fontSize: "1.1rem"
          }}
        >
          ¿Deseas continuar?
        </Typography>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          backgroundColor: "#bf1e2d",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 1.5
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: "white",
            color: "white",
            fontWeight: "bold",
            width: 110
          }}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            backgroundColor: "white",
            color: "#bf1e2d",
            fontWeight: "bold",
            width: 110,
            "&:hover": { backgroundColor: "#f5f5f5" }
          }}
        >
          Sí
        </Button>
      </DialogActions>
    </Dialog>
  );
}