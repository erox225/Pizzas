import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export default function OrderConfirmation() {
  const { id } = useParams();

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printable, #printable * {
          visibility: visible;
        }
        #printable {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        button, [role="button"], a, .MuiButton-root {
          display: none !important;
        }
      }
      .confirmation-screen {
        color: black;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Box
      className="confirmation-screen"
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2
      }}
    >
    <Box
      id="printable"
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #ccc",
        width: "100%",
        maxWidth: 400,
        p: 3,
        fontFamily: "'Roboto Slab', serif",
        boxShadow: 2
      }}
    >
        <Typography variant="h6" sx={{ color: "#a01825", fontWeight: "bold", textAlign: "center" }}>
          FRATELLI PIZZA
        </Typography>
        <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
          Av. del Sabor, 123<br />
          08001 Barcelona<br />
          CIF: B12345678
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center", mb: 1 }}>
          TICKET: <span style={{ fontSize: 18 }}>{id}</span>
        </Typography>

        <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
          TPV: MOSTRADOR <br />
          Fecha: {new Date().toLocaleDateString()} &nbsp;
          Hora: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </Typography>

        <Box sx={{ borderTop: "1px solid #000", borderBottom: "1px solid #000", py: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            CONCEPTO <span>TOTAL</span>
          </Typography>
          <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between" }}>
            Pedido código <span>--</span>
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "right", mb: 2 }}>
          TOTAL: <span style={{ color: "#d32f2f" }}>Pendiente</span>
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          IVA incluido. Precio final en mostrador.
        </Typography>

        <Typography variant="body2" sx={{ borderTop: "1px dashed #999", borderBottom: "1px dashed #999", py: 1, my: 2 }}>
          Entrega Tarjeta: 0,00€<br />
          Entrega Vale: 0,00€<br />
          Entrega Efectivo: 0,00€ &nbsp;&nbsp;&nbsp;&nbsp; Cambio: 0,00€
        </Typography>

        <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
          Gracias por su visita. <br />
          Tiene 15 minutos para pagar su pedido.<br />
          Pedido no válido sin confirmación en caja.
        </Typography>

        <Typography variant="body2" sx={{ textAlign: "center", fontWeight: "bold" }}>
          Le ha atendido <span style={{ fontStyle: "italic" }}>Equipo Fratelli</span>
        </Typography>

        <Button
          variant="contained"
          fullWidth
          component={Link}
          to="/"
          sx={{
            mt: 3,
            backgroundColor: "#bf1e2d",
            color: "#fff",
            "&:hover": { backgroundColor: "#a81a26" }
          }}
        >
          Volver al inicio
        </Button>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            mt: 1,
            borderColor: "#a81a26",
            color: "#a81a26",
            "&:hover": {
              backgroundColor: "#f8d6d6",
              borderColor: "#a81a26"
            }
          }}
          onClick={() => window.print()}
        >
          Imprimir ticket
        </Button>
      </Box>
    </Box>
  );
}