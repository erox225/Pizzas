import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  BottomNavigation,
  SwipeableDrawer,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import BlockIcon from "@mui/icons-material/Block";
import { db } from "../../firebase/Config";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { USE_MOCKS } from "../../config";
import type { OrderItem } from "../../domain/types";

export default function BottomBar({
  bottomOpen,
  setBottomOpen,
  totalSlices,
  totalAmount,
  pizzas,
  drinks,
  quantities
}) {
  const navigate = useNavigate();
  const [animateTotal, setAnimateTotal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const selectedPizzas = pizzas.filter(p => quantities[p.id] > 0);
  const selectedDrinks = drinks.filter(d => quantities[d.id] > 0);
  const totalDrinks = selectedDrinks.reduce((sum, d) => sum + quantities[d.id], 0);
  const drinkTotal = selectedDrinks.reduce((sum, d) => sum + (quantities[d.id] * parseFloat(d.price)), 0);
  const fullTotal = totalAmount + drinkTotal;

  const initialLoad = React.useRef(true);

  useEffect(() => {
    setAnimateTotal(true);
    const timeout = setTimeout(() => setAnimateTotal(false), 300);
    return () => clearTimeout(timeout);
  }, [fullTotal]);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (bottomOpen && selectedPizzas.length + selectedDrinks.length === 0) {
      setBottomOpen(false);
    }
  }, [selectedPizzas, selectedDrinks]);

  const generateOrderId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 10 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const handleConfirmOrder = async () => {
    const orderId = generateOrderId();
    const exp = new Date(Date.now() + 30 * 60 * 1000);
    const pizzasItems: OrderItem[] = selectedPizzas.map(p => ({
      id: p.id,
      name: p.name,
      type: 'pizza',
      quantity: quantities[p.id],
      pricePerUnit: parseFloat(p.price),
      finalizado: false
    }));
    const drinkItems: OrderItem[] = selectedDrinks.map(d => ({
      id: d.id,
      name: d.name,
      type: 'drink',
      quantity: quantities[d.id],
      pricePerUnit: parseFloat(d.price),
      finalizado: false
    }));
    const orderData = {
      orderId,
      pizzas: pizzasItems,
      drinks: drinkItems,
      totalSlices,
      totalAmount: fullTotal,
      paymentMethod,
      estado: "Preparando",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(exp),
      status: 1
    };

    try {
      if (!USE_MOCKS) {
        await addDoc(collection(db, "orders"), orderData);
      }
      setBottomOpen(false);
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error("❌ Error al confirmar pedido:", err);
      alert("❌ Hubo un error al confirmar el pedido.");
    }
  };

  return (
    <>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
        elevation={5}
      >
        <BottomNavigation
          showLabels
          onClick={() => setBottomOpen(true)}
          sx={{
            backgroundColor: "#bf1e2d",
            color: "white",
            height: 64,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer"
          }}
        >
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>


  {/* Bebidas - SIEMPRE visible */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      backgroundColor: "#ffecb3",
      color: "black",
      borderRadius: 14,
      px: 1.2,
      py: 0
    }}
  >
    <Typography sx={{ fontWeight: "bold", fontSize: 16 }}>{totalDrinks}</Typography>
    <Typography sx={{ fontSize: 20 }}>🥤</Typography>
  </Box>

    {/* Pizzas */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Typography sx={{ fontWeight: "bold", fontSize: 16 }}>{totalSlices}</Typography>
    <Typography sx={{ fontSize: 20 }}>🍕</Typography>
  </Box>
</Box>

          <Button
            onClick={() => {
              if (selectedPizzas.length + selectedDrinks.length > 0) {
                setBottomOpen(true);
              } else {
                setSnackbarOpen(true);
              }
            }}
            variant="contained"
            size="small"
            startIcon={
              selectedPizzas.length + selectedDrinks.length > 0 ? <PaymentIcon /> : <BlockIcon sx={{color:"red"}}/>
            }
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: (selectedPizzas.length + selectedDrinks.length > 0) ? "#fceced" : "#eeeeee",
              color: (selectedPizzas.length + selectedDrinks.length > 0) ? "#a01825" : "#aaa",
              fontWeight: "bold",
              fontFamily: "'Roboto Slab', serif",
              fontSize: 12,
              textTransform: "uppercase",
              px: 2,
              py: 0.5,
              boxShadow: (selectedPizzas.length + selectedDrinks.length > 0) ? "0 2px 8px rgba(0,0,0,0.1)" : "inset 0 0 0 1px #ccc",
              border: (selectedPizzas.length + selectedDrinks.length > 0) ? "2px solid #a01825" : "none",
              animation: (selectedPizzas.length + selectedDrinks.length > 0) ? "pulse 1.8s ease-in-out infinite" : "none",
              "&:hover": {
                backgroundColor: (selectedPizzas.length + selectedDrinks.length > 0) ? "#f8d6d6" : "#eeeeee"
              }
            }}
            disabled={selectedPizzas.length + selectedDrinks.length === 0}
          >
            Pagar
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: 16,
                animation: animateTotal ? "bounce 0.3s ease" : "none",
                transformOrigin: "center"
              }}
            >
              {fullTotal.toFixed(2)}€
            </Typography>
          </Box>
        </BottomNavigation>
      </Paper>

      <SwipeableDrawer
        anchor="bottom"
        open={bottomOpen && (selectedPizzas.length + selectedDrinks.length > 0)}
        onClose={() => setBottomOpen(false)}
        onOpen={() => {}}
        sx={{
          ".MuiDrawer-paper": {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 2
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontFamily: "'Roboto Slab', serif",
            fontWeight: "bold"
          }}
        >
          Resumen del pedido
        </Typography>

        {selectedPizzas.length === 0 && selectedDrinks.length === 0 ? (
          <Typography textAlign="center" color="#999">
            No has seleccionado ninguna pizza ni bebida todavía 🍕🥤
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 2 }}>
            <List>
              {selectedPizzas.filter(pizza => pizza.slices <= 4).map((pizza, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemText
                    primary={`${quantities[pizza.id]} x ${pizza.name}`}
                    secondary={`Total: €${(quantities[pizza.id] * parseFloat(pizza.price)).toFixed(2)}`}
                  />
                </ListItem>
              ))}
              {selectedDrinks.map((drink, i) => (
                <ListItem key={`d-${i}`} disablePadding>
                  <ListItemText
                    primary={`${quantities[drink.id]} x ${drink.name}`}
                    secondary={`Total: €${(quantities[drink.id] * parseFloat(drink.price)).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography sx={{ mt: 2, fontWeight: "bold" }}>
          Total a pagar: €{fullTotal.toFixed(2)}
        </Typography>

        <Typography
          sx={{
            mt: 3,
            mb: 1,
            fontWeight: "bold",
            fontFamily: "'Roboto Slab', serif"
          }}
        >
          Método de pago
        </Typography>

        <ToggleButtonGroup
          value={paymentMethod}
          exclusive
          onChange={(e, newMethod) => {
            if (newMethod !== null) setPaymentMethod(newMethod);
          }}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="tarjeta" sx={{ textTransform: 'none' }}>Tarjeta</ToggleButton>
          <ToggleButton value="apple" sx={{ textTransform: 'none' }}>Apple Pay</ToggleButton>
          <ToggleButton value="google" sx={{ textTransform: 'none' }}>Google Pay</ToggleButton>
          <ToggleButton value="bizum" sx={{ textTransform: 'none' }}>Bizum</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: "#bf1e2d",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#a81a26" }
          }}
          onClick={handleConfirmOrder}
          disabled={selectedPizzas.length + selectedDrinks.length === 0}
        >
          Confirmar pedido
        </Button>
      </SwipeableDrawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Selecciona al menos una pizza o bebida para continuar"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <style>{`
        @keyframes bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.035); opacity: 0.95; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
