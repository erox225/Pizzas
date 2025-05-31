// components/CartDrawer.tsx
import React from "react";
import { Drawer, Box, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function CartDrawer({ open, onClose, pizzas, quantities }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: "#fffaf0", color: "#111", fontFamily: "'Roboto Slab', serif" } }}
    >
      <Box p={2}>
        <Typography variant="h6">Resumen del Pedido</Typography>
        <List>
          {Object.entries(quantities).map(([id, qty]) => {
            const pizza = pizzas.find(p => p.id === id);
            if (!pizza || qty === 0) return null;
            return (
              <ListItem key={id}>
                <ListItemText primary={pizza.name} secondary={`${qty} porciones`} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
