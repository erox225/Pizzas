// src/pages/components/OrderCard.tsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Order } from "../../domain/types";

interface OrderCardProps {
  order: Order;
  selected: boolean;
  onSelect: (order: Order) => void;
  onRepeat?: () => void;
  borderColor?: string;
  headerColor?: string;
}

export default function OrderCard({ order, selected, onSelect, onRepeat, borderColor, headerColor }: OrderCardProps) {
  let dateObj: Date;
  if (order.createdAt instanceof Date) {
    dateObj = order.createdAt;
  } else if (
    order.createdAt &&
    typeof (order.createdAt as any).toDate === "function"
  ) {
    dateObj = (order.createdAt as any).toDate();
  } else if (
    typeof order.createdAt === "string" ||
    typeof order.createdAt === "number"
  ) {
    dateObj = new Date(order.createdAt);
  } else {
    dateObj = new Date();
  }

  const dateStr = dateObj.toLocaleString();

  const handleClick = () => onSelect(order);

  // Detectar si es la carta de "Nueva Orden" (no tiene orderId)
  const isNuevaOrden = !order.orderId;
  // Color de borde mucho más oscuro si está seleccionada y no es la carta de nueva orden
  const selectedBorder = selected && !isNuevaOrden ? "#222" : (borderColor ?? (selected ? "#bf1e2d" : "#1976d2"));
  return (
    <Paper
      onClick={handleClick}
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 180,
        maxWidth: 200,
        height: 100,
        borderRadius: 2,
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: selected
          ? "0 6px 12px rgba(0,0,0,0.25)"
          : "0 2px 5px rgba(0,0,0,0.1)",
        border: `2px solid ${selectedBorder}`,
        "&:hover": {
          transform: "translateY(-2px)"
        }
      }}
    >
      {/* Barra superior con ID */}
      <Box
        sx={{
          backgroundColor: headerColor ?? (selected ? "#bf1e2d" : "#1976d2"),
          color: "#fff",
          textAlign: "center",
          py: 0.5,
          fontWeight: "bold",
          fontSize: 14
        }}
      >
        {order.orderId}
      </Box>

      {/* Cuerpo con detalles */}
      <Box sx={{ px: 1.5, pt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2" fontSize={13}>
          📅 {dateStr}
        </Typography>
        <Typography variant="body2" fontSize={13}>
          🍕 Trozos: {order.totalSlices}
        </Typography>
        <Typography variant="body2" fontSize={13}>
          💰 Total: €{(order.totalAmount ?? 0).toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
}
