// ...existing code...
// src/pages/Barra.tsx
import React, { useEffect, useState } from "react";
import { Select, MenuItem, FormControl } from "@mui/material";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Collapse,
  TextField,
  Paper,
  Grow,
  Snackbar
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { styled } from "@mui/material/styles";
const CustomToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "49px !important",
  height: "49px",
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
import SearchIcon from "@mui/icons-material/Search";
import "@fontsource/roboto-slab";

import { collection, getDocs, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from "firebase/firestore";
import type { OrderItem } from "../domain/types";
import { db } from "../firebase/Config";
import { fromFirestoreOrder } from "../services/adapters";
import { getPizzasNormalized, getDrinksNormalized } from "../services/select";
import { USE_MOCKS } from "../config";

import OrderCard from "./components/OrderCard";
import { Order } from "../domain/types";
import OrderSummary from "./components/OrderSummary";
import { TransitionGroup } from "react-transition-group";
import UnsavedOrderModal from "./components/UnsavedOrderModal";


import PizzaDrinkSection from "./components/PizzaDrinkSection";

export default function Barra() {
  // Estado para el menú de navegación
  const [navOption, setNavOption] = useState("Barra");
  // Handler para navegación
  const handleNavChange = (event) => {
    const value = event.target.value;
    setNavOption(value);
    if (value === "Barra") {
      window.location.href = "/barra";
    } else if (value === "Cocina") {
      window.location.href = "/cocina";
    } else if (value === "Dashboard") {
      window.location.href = "/dashboard";
    }
  };
  // Estado para animación de cambio de estado en la orden seleccionada
  const [estadoAnim, setEstadoAnim] = useState<string | null>(null);
  // Estado para la orden seleccionada
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Estado para guardar el estado anterior de la orden seleccionada
  const [prevEstado, setPrevEstado] = useState<string | null>(null);
  // Cambiar estado a 'Entregado' si todos los ítems están finalizados
  // Optimización: reflejar el cambio de estado de la orden localmente y en Firebase
  useEffect(() => {
    // Para cada orden, si todos los ítems están finalizados y el estado es 'Preparando', pasar a 'Entregado'
    setOrders(prev => prev.map(o => {
      const pizzasArr = Array.isArray(o.pizzas) ? o.pizzas : [];
      const drinksArr = Array.isArray(o.drinks) ? o.drinks : [];
      const allFinalizados = [...pizzasArr, ...drinksArr].every(item => item.finalizado);
      if (allFinalizados && o.estado === "Preparando") {
        // Actualizar en Firebase solo si cambia
        if (o.id) {
          import("firebase/firestore").then(({ doc, updateDoc }) => {
            const ref = doc(db, "orders", o.id);
            updateDoc(ref, { estado: "Entregado" });
          });
        }
        return { ...o, estado: "Entregado" };
      }
      // Si NO todos están finalizados y el estado es 'Entregado', volver a 'Preparando'
      if (![...pizzasArr, ...drinksArr].every(item => item.finalizado) && o.estado === "Entregado") {
        if (o.id) {
          import("firebase/firestore").then(({ doc, updateDoc }) => {
            const ref = doc(db, "orders", o.id);
            updateDoc(ref, { estado: "Preparando" });
          });
        }
        return { ...o, estado: "Preparando" };
      }
      return o;
    }));
    // Mantén la lógica de la seleccionada
    if (!selectedOrder || !selectedOrder.orderId) return;
    const pizzasArr = Array.isArray(selectedOrder.pizzas) ? selectedOrder.pizzas : [];
    const drinksArr = Array.isArray(selectedOrder.drinks) ? selectedOrder.drinks : [];
    const allFinalizados = [...pizzasArr, ...drinksArr].every(item => item.finalizado);
    if (allFinalizados && selectedOrder.estado === "Preparando" && selectedOrder.id) {
      setSelectedOrder(prev => prev ? { ...prev, estado: "Entregado" } : prev);
    }
    if (!allFinalizados && selectedOrder.estado === "Entregado" && selectedOrder.id) {
      setSelectedOrder(prev => prev ? { ...prev, estado: "Preparando" } : prev);
    }
    // Si NO todos están finalizados y el estado es 'Entregado', volver a 'Preparando'
    if (!allFinalizados && selectedOrder.estado === "Entregado" && selectedOrder.id) {
      setOrders(prev => prev.map(o =>
        o.orderId === selectedOrder.orderId ? { ...o, estado: "Preparando" } : o
      ));
      setSelectedOrder(prev => prev ? { ...prev, estado: "Preparando" } : prev);
      import("firebase/firestore").then(({ doc, updateDoc }) => {
        const ref = doc(db, "orders", selectedOrder.id!);
        updateDoc(ref, { estado: "Preparando" });
      });
    }
    // Si el estado pasa a 'Finalizado', reflejarlo solo localmente (Firestore se actualiza desde OrderSummary)
    if (selectedOrder.estado === "Finalizado" && selectedOrder.id) {
      setOrders(prev => {
        // Elimina la orden finalizada del array
        const filtered = prev.filter(o => o.orderId !== selectedOrder.orderId);
        return [...filtered];
      });
      setSelectedOrder(null); // Quita la selección para forzar re-render
      // No actualizar en Firestore aquí, solo local
    }
  }, [selectedOrder]);

  // Animación SOLO cuando el estado de la orden seleccionada cambie
  useEffect(() => {
    if (!selectedOrder) {
      setPrevEstado(null);
      return;
    }
    if (prevEstado && selectedOrder.estado !== prevEstado) {
      setEstadoAnim(selectedOrder.orderId + '-' + selectedOrder.estado);
      setTimeout(() => setEstadoAnim(null), 800);
    }
    setPrevEstado(selectedOrder.estado);
  }, [selectedOrder?.estado]);
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSelection, setPendingSelection] = useState<Order | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"pizzas" | "drinks">("pizzas");
  // Modo edición para nueva orden (bloquear cartas)
  const [newOrderEditing, setNewOrderEditing] = useState(false);

  // Estado para ítems finalizados en órdenes nuevas
  const [localFinalizados, setLocalFinalizados] = useState<Record<string, boolean>>({});

  // Cargar pizzas
  useEffect(() => {
    getPizzasNormalized().then(arr => setPizzas(arr.filter(p => p.type === 'pizza').map(p => ({ ...p, price: p.price }))));
  }, []);

  // Suscribirse a cambios en órdenes SOLO al montar el componente
  useEffect(() => {
    if (USE_MOCKS) { setOrders([]); return; }
    const unsub = onSnapshot(collection(db, "orders"), snap => {
      const newOrders = snap.docs.map(d => fromFirestoreOrder(d.id, d.data()));
      const today = new Date(); today.setHours(0,0,0,0);
      const toDate = (v: any): Date => v instanceof Date ? v : (v?.toDate ? v.toDate() : new Date(v));
      const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
      setOrders(newOrders.filter(o => o.estado !== "Finalizado" && o.createdAt && isSameDay(toDate(o.createdAt), today)));
      if (selectedOrder) {
        const updated = newOrders.find(o => o.orderId === selectedOrder.orderId);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(null);
      }
    });
    return () => unsub();
  }, []); // <-- Solo al montar

  useEffect(() => {
    getDrinksNormalized().then(arr => setDrinks(arr.filter(d => d.type === 'drink').map(d => ({ ...d, price: d.price }))));
  }, []);

  const handleIncrement = (id: string) => {
    setQuantities(q => ({ ...q, [id]: (q[id] || 0) + 1 }));
  };

  const handleDecrement = (id: string) => {
    setQuantities(q => ({ ...q, [id]: Math.max((q[id] || 0) - 1, 0) }));
  };

  const selectedPizzas = pizzas.filter(p => quantities[p.id] > 0);
  const selectedDrinks = drinks.filter(d => quantities[d.id] > 0);
  const totalSlices = selectedPizzas.reduce((sum, p) => sum + quantities[p.id], 0);
  const totalAmount = [...selectedPizzas, ...selectedDrinks].reduce(
    (sum, item) => sum + (quantities[item.id] || 0) * parseFloat(item.price),
    0
  );

  const generateOrderId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  const handleConfirmOrder = async () => {
    const selectedDrinks = drinks.filter(d => quantities[d.id] > 0);
    if (!selectedPizzas.length && !selectedDrinks.length) return;
    const orderId = generateOrderId();
    const exp = new Date(Date.now() + 30 * 60 * 1000);
    const pizzasItems: OrderItem[] = selectedPizzas.map(p => ({
      id: p.id,
      name: p.name,
      type: 'pizza',
      finalizado: false,
      quantity: quantities[p.id],
      pricePerUnit: typeof p.price === "string" ? parseFloat(p.price) : (p.price ?? 0)
    }));
    const drinkItems: OrderItem[] = selectedDrinks.map(d => ({
      id: d.id,
      name: d.name,
      type: 'drink',
      finalizado: false,
      quantity: quantities[d.id],
      pricePerUnit: typeof d.price === "string" ? parseFloat(d.price) : (d.price ?? 0)
    }));
    const orderDoc = {
      orderId,
      totalSlices,
      totalAmount,
      pizzas: pizzasItems,
      drinks: drinkItems,
      estado: "Preparando",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(exp)
    };
    let newDocId: string | null = null;
    if (!USE_MOCKS) {
      const ref = await addDoc(collection(db, "orders"), orderDoc);
      newDocId = ref.id;
    } else {
      newDocId = `MOCK-${orderId}`;
    }
    // Feedback snackbar: orden creada
    setEstadoSnack({ open: true, message: 'Orden creada', kind: 'creada' });
    // Seleccionar automáticamente la nueva orden
    try {
      setSelectedOrder({
        id: newDocId as any,
        orderId,
        pizzas: pizzasItems as any,
        drinks: drinkItems as any,
        totalSlices,
        totalAmount,
        estado: "Preparando",
        createdAt: new Date() as any,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) as any,
      } as any);
    } catch {}
    setQuantities({});
  };

  // Crear orden rápida: igual que confirmar, pero con estado Finalizado
  const handleFastOrder = async () => {
    const selectedDrinks = drinks.filter(d => quantities[d.id] > 0);
    if (!selectedPizzas.length && !selectedDrinks.length) return;
    const orderId = generateOrderId();
    const exp = new Date(Date.now() + 30 * 60 * 1000);
    const pizzasItems: OrderItem[] = selectedPizzas.map(p => ({
      id: p.id,
      name: p.name,
      type: 'pizza',
      finalizado: true,
      quantity: quantities[p.id],
      pricePerUnit: typeof p.price === "string" ? parseFloat(p.price) : (p.price ?? 0)
    }));
    const drinkItems: OrderItem[] = selectedDrinks.map(d => ({
      id: d.id,
      name: d.name,
      type: 'drink',
      finalizado: true,
      quantity: quantities[d.id],
      pricePerUnit: typeof d.price === "string" ? parseFloat(d.price) : (d.price ?? 0)
    }));
    const orderDoc = {
      orderId,
      totalSlices,
      totalAmount,
      pizzas: pizzasItems,
      drinks: drinkItems,
      estado: "Finalizado",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(exp)
    };
    if (!USE_MOCKS) {
      await addDoc(collection(db, "orders"), orderDoc);
    }
    // eliminado alert visual al crear orden rápida; feedback se gestiona con UI
    setQuantities({});
    // Reiniciar checks locales
    try { setLocalFinalizados({}); } catch {}
  };

  const handleRepeatOrder = async (order: Order) => {
    const newId = generateOrderId();
    const exp = new Date(Date.now() + 30 * 60 * 1000);
    // Map existing items to unified shape defensively
    const pizzasItems: OrderItem[] = Array.isArray(order.pizzas) ? order.pizzas.map((p: any) => ({
      id: p.id ?? '',
      name: p.name ?? '',
      type: 'pizza',
      quantity: typeof p.quantity === 'number' ? p.quantity : 0,
      pricePerUnit: typeof p.pricePerUnit === 'number' ? p.pricePerUnit : (typeof p.price === 'string' ? parseFloat(p.price) : (p.price ?? 0)),
      finalizado: !!p.finalizado,
    })) : [];
    const drinkItems: OrderItem[] = Array.isArray(order.drinks) ? order.drinks.map((d: any) => ({
      id: d.id ?? '',
      name: d.name ?? '',
      type: 'drink',
      quantity: typeof d.quantity === 'number' ? d.quantity : 0,
      pricePerUnit: typeof d.pricePerUnit === 'number' ? d.pricePerUnit : (typeof d.price === 'string' ? parseFloat(d.price) : (d.price ?? 0)),
      finalizado: !!d.finalizado,
    })) : [];
    const newOrder = {
      orderId: newId,
      totalSlices: order.totalSlices ?? 0,
      totalAmount: order.totalAmount ?? 0,
      pizzas: pizzasItems,
      drinks: drinkItems,
      estado: order.estado ?? 'Preparando',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(exp)
    };
    if (!USE_MOCKS) {
      await addDoc(collection(db, "orders"), newOrder);
    }
    // eliminado alert visual al repetir orden; feedback se gestiona con UI
  };

  // Generar quantities simuladas si hay orden seleccionada
  const simulatedQuantities: Record<string, number> = {};
  if (selectedOrder) {
    // Pizzas
    if (selectedOrder.pizzas?.length) {
      selectedOrder.pizzas.forEach((p: any) => {
        // Buscar por id, no por name, para evitar ambigüedad
        simulatedQuantities[p.id] = p.quantity;
      });
    }
    // Bebidas
    if (selectedOrder.drinks?.length) {
      selectedOrder.drinks.forEach((d: any) => {
        simulatedQuantities[d.id] = d.quantity;
      });
    }
  }

99999999999.99

  // Añade justo antes del return principal
  const allItems = [...pizzas, ...drinks];
  // Eliminado: selectedItems no se usa
  const summaryQuantities = selectedOrder ? simulatedQuantities : quantities;
  const summaryTotalSlices = pizzas.reduce((sum, p) => sum + (summaryQuantities[p.id] || 0), 0);
  const summaryTotalAmount = allItems.reduce((sum, item) => {
    const qty = summaryQuantities[item.id] || 0;
    let price = 0;
    if (item.pricePerUnit !== undefined && item.pricePerUnit !== null) {
      price = typeof item.pricePerUnit === "string" ? parseFloat(item.pricePerUnit) : item.pricePerUnit;
    } else if (item.price !== undefined && item.price !== null) {
      price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    } else {
      price = 0;
    }
    if (isNaN(price)) price = 0;
    return sum + qty * price;
  }, 0);

  // Calcular el total de pizzas vendidas en el día (todas las órdenes del día)
  const today = new Date();
  const toDate = (v: any): Date => v instanceof Date ? v : (v?.toDate ? v.toDate() : new Date(v));
  const isSameDay = (dateA, dateB) =>
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear();
  const totalPizzasVendidasHoy = orders
    .filter(o => o.createdAt && isSameDay(toDate(o.createdAt), today))
    .reduce((acc, o) => {
      if (Array.isArray(o.pizzas)) {
        return acc + o.pizzas.reduce((sum, p) => sum + (p.quantity || 0), 0);
      }
      return acc;
    }, 0);

  // State for floating button block visibility (swipe gesture)
  // Eliminado: visible, touchStartY, handleTouchStart, handleTouchEnd no se usan

  // Colores por estado de orden
  const estadoColors: Record<string, string> = {
    Preparando: '#f7b32b', // amarillo
    Entregado: '#2bbf5b',  // verde
    Finalizado: '#888',    // gris
  };
  // Handler para sincronizar el estado de la orden seleccionada y actualizar colores
  const handleEstadoChange = (nuevoEstado: string) => {
    if (!selectedOrder) return;
    setSelectedOrder(prev => prev ? { ...prev, estado: nuevoEstado } : prev);
    setOrders(prev => prev.map(o =>
      o.orderId === selectedOrder.orderId ? { ...o, estado: nuevoEstado } : o
    ));
    // Notificación cuando pasa a Entregado
    if (nuevoEstado === 'Entregado') {
      setEstadoSnack({ open: true, message: 'Orden marcada como Entregada', kind: 'entregado' });
    } else if (nuevoEstado === 'Preparando') {
      setEstadoSnack({ open: true, message: 'Orden devuelta a Preparando', kind: 'preparando' });
    }
  };
  // Snackbar feedback de estado
  const [estadoSnack, setEstadoSnack] = useState<{ open: boolean; message: string; kind: 'entregado' | 'preparando' | 'finalizado' | 'creada' | null }>({ open: false, message: '', kind: null });
  return (
    <Box sx={{ backgroundColor: "#fdf6e3", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "#bf1e2d" }}>
        <CustomToolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "49px !important", height: "49px", px: 2 }}>
          {/* Fratelli alineado a la izquierda */}
          <Typography variant="h6" sx={{ fontFamily: "'Roboto Slab', serif", color: "#fff", fontWeight: "bold", letterSpacing: 1 }}>
            Fratelli
          </Typography>
          {/* Elementos con diseño tipo chips, borde blanco y padding, sobre fondo rojo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Fecha y día */}
            <Box sx={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              borderRadius: "16px",
              px: 1.2,
              py: 0.3,
              color: "#fff",
              fontFamily: "'Roboto Slab', serif",
              fontWeight: "bold",
              fontSize: 13,
              gap: 0.7,
              minWidth: "auto"
            }}>
              <span style={{ fontSize: 16, marginRight: 5, color: '#fff' }}>🏆</span>
              <span style={{ letterSpacing: 1 }}>{today.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}, {today.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </Box>
            {/* Cantidad de pizzas */}
            <Box sx={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              borderRadius: "16px",
              px: 1.2,
              py: 0.3,
              color: "#fff",
              fontFamily: "'Roboto Slab', serif",
              fontWeight: "bold",
              fontSize: 13,
              gap: 0.7,
              minWidth: "auto"
            }}>
              <span style={{ fontSize: 16, marginRight: 5, color: '#fff' }}>🍕</span>
              <span style={{ fontWeight: "bold", fontSize: 15 }}>{totalPizzasVendidasHoy}</span>
            </Box>
            {/* Menú de navegación */}
            <FormControl size="small" sx={{ minWidth: 120, ml: 2 }}>
              <Select
                value={navOption}
                onChange={handleNavChange}
                sx={{
                  fontFamily: "'Roboto Slab', serif",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 13,
                  background: "linear-gradient(90deg, #bf1e2d 0%, #d43a4a 100%)",
                  borderRadius: "16px",
                  px: 1.2,
                  py: 0.3,
                  minWidth: 90,
                  minHeight: "26px",
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'background 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '1.1px',
                }}
                renderValue={value => {
                  if (value === "Barra") return "🍹 Barra";
                  if (value === "Cocina") return "🍕 Cocina";
                  if (value === "Dashboard") return "📊 Dashboard";
                  return value;
                }}
              >
                <MenuItem value="Barra">🍹 Barra</MenuItem>
                <MenuItem value="Cocina">🍕 Cocina</MenuItem>
                <MenuItem value="Dashboard">📊 Dashboard</MenuItem>
                {/* <MenuItem value="Cerrar Sesión">Cerrar Sesión</MenuItem> */}
              </Select>
            </FormControl>
          </Box>
        </CustomToolbar>
      </AppBar>

{/* Órdenes Entrantes */}
<Box sx={{ px: 1, py: 1, backgroundColor: "#f7e4c3", borderRadius: 2 }}>
  <Box sx={{ textAlign: "center"}}>
    <Typography
      variant="h5"
      sx={{
        fontWeight: "bold",
        fontFamily: "'Roboto Slab', serif",
        color: "#111",
        letterSpacing: 0.5
      }}
    >
      🧾 Órdenes Entrantes
    </Typography>

  </Box>

  {/* Contenedor de tarjetas */}
  <Box sx={{ display: "flex", gap: 2, overflowX: "auto", py: 1 }}>
  <TransitionGroup style={{ display: "flex", gap: 16 }}>
    <Grow
      in
      timeout={400}
    >
      <div className="order-card bounce-in">
        <Paper
          onClick={() => setSelectedOrder(null)}
          elevation={selectedOrder === null ? 6 : 4}
          sx={{
            minWidth: 180,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: selectedOrder === null ? "#fff8f6" : "#fdf6e3",
            border: "3px solid #bf1e2d",
            borderRadius: 2,
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            animation: "bounceIn 0.5s ease",
            "&:hover": {
              backgroundColor: "#fcebe9",
              transform: "translateY(-2px)"
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#bf1e2d",
              fontFamily: "'Roboto Slab', serif",
              fontSize: 18
            }}
          >
            ➕ Nueva Orden
          </Typography>
          <Typography variant="caption" sx={{ color: "#666", mt: 0.5 }}>
            Crear desde cero
          </Typography>
        </Paper>
      </div>
    </Grow>

    {[...orders]
      .sort((a, b) => {
        const aDate = (a as any)?.createdAt ? (toDate((a as any).createdAt).getTime()) : 0;
        const bDate = (b as any)?.createdAt ? (toDate((b as any).createdAt).getTime()) : 0;
        return bDate - aDate; // Más reciente primero
      })
      .map((order) => {
        const isSelected = order.orderId === selectedOrder?.orderId;
        const animClass = isSelected && estadoAnim ? 'estado-blink estado-shake' : '';
        // Colores según estado de la orden
        const colorEstado = estadoColors[order.estado ?? 'Preparando'];
        return (
          <Grow
            key={order.orderId}
            in
            timeout={400}
          >
            <div className={`order-card bounce-in ${animClass}`}>
              <OrderCard
                order={order}
                selected={isSelected}
                onSelect={() => {
                  const hasPizzas = Object.values(quantities).some(q => q > 0);
                  if (selectedOrder === null && hasPizzas) {
                    setPendingSelection(order);
                    setShowUnsavedModal(true);
                  } else {
                    setSelectedOrder(order);
                  }
                }}
                onRepeat={() => handleRepeatOrder(order)}
                borderColor={colorEstado}
                headerColor={colorEstado}
                // className eliminado, OrderCard no acepta esta prop
              />
            </div>
          </Grow>
        );
      })}
  </TransitionGroup>
  <UnsavedOrderModal
  open={showUnsavedModal}
  onClose={() => {
    setPendingSelection(null);
    setShowUnsavedModal(false);
  }}
  onConfirm={() => {
    if (pendingSelection) {
      setQuantities({});
      setSelectedOrder(pendingSelection);
    }
    setShowUnsavedModal(false);
    setPendingSelection(null);
  }}
/>
</Box>
      </Box>

      {/* Pizzas y resumen */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ width: "75%" }}>
          <PizzaDrinkSection
            pizzas={pizzas}
            drinks={drinks}
            quantities={quantities}
            selectedOrder={selectedOrder}
            viewMode={viewMode}
            onToggleView={() => setViewMode(viewMode === "pizzas" ? "drinks" : "pizzas")}
            summaryQuantities={summaryQuantities}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
            editMode={newOrderEditing}
          />
        </Box>
        <Box sx={{ width: "25%",py: 1.2 }}>
          <OrderSummary
            totalSlices={summaryTotalSlices}
            totalAmount={summaryTotalAmount}
            onConfirm={handleConfirmOrder}
            onFinalize={async () => {
              if (!selectedOrder) return;
              try {
                if (selectedOrder.id && !USE_MOCKS) {
                  const ref = doc(db, 'orders', selectedOrder.id);
                  await updateDoc(ref, { estado: 'Finalizado' });
                }
              } catch {}
              // Aviso de orden finalizada
              setEstadoSnack({ open: true, message: 'Orden finalizada', kind: 'finalizado' });
              const sorted = [...orders].sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
              const idx = sorted.findIndex(o => o.orderId === selectedOrder.orderId);
              const next = sorted.find((_, i) => i !== idx);
              setSelectedOrder(next ?? null);
            }}
            selectedOrderId={selectedOrder?.orderId ?? null}
            orders={orders}
            currentOrder={selectedOrder ?? {
              pizzas: pizzas.filter(p => quantities[p.id] > 0).map(p => ({
                ...p,
                quantity: quantities[p.id],
                finalizado: localFinalizados[p.name] || false,
                price: p.price ?? p.pricePerSlice ?? 0,
                pricePerUnit: p.price ?? p.pricePerSlice ?? 0
              })),
              drinks: drinks.filter(d => quantities[d.id] > 0).map(d => ({
                ...d,
                quantity: quantities[d.id],
                finalizado: localFinalizados[d.name] || false,
                price: d.price ?? d.pricePerUnit ?? 0,
                pricePerUnit: d.price ?? d.pricePerUnit ?? 0
              })),
              id: null,
              orderId: null
            }}
            localFinalizados={localFinalizados}
            setLocalFinalizados={setLocalFinalizados}
            headerColor={selectedOrder ? estadoColors[selectedOrder.estado ?? 'Preparando'] : '#bf1e2d'}
            borderColor={selectedOrder ? estadoColors[selectedOrder.estado ?? 'Preparando'] : '#bf1e2d'}
            onEstadoChange={handleEstadoChange}
            onEditModeChange={(editing: boolean) => setNewOrderEditing(editing)}
            onFastOrder={handleFastOrder}
            onRemoveItem={(id: string, name: string) => {
              // Solo aplica en nueva orden: poner cantidad a 0 y limpiar finalizado local
              setQuantities(prev => ({ ...prev, [id]: 0 }));
              setLocalFinalizados(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
              });
            }}
          />
        </Box>
    </Box>

      <Snackbar
        open={estadoSnack.open}
        autoHideDuration={2500}
        onClose={() => setEstadoSnack({ open: false, message: '', kind: null })}
        message={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            {estadoSnack.kind === 'entregado' && <CheckCircleOutlineIcon sx={{ color: '#2bbf5b' }} />}
            {estadoSnack.kind === 'preparando' && <AccessTimeIcon sx={{ color: '#f7b32b' }} />}
            {estadoSnack.kind === 'finalizado' && <FlagOutlinedIcon sx={{ color: '#888' }} />}
            {estadoSnack.kind === 'creada' && <AddCircleOutlineIcon sx={{ color: '#1976d2' }} />}
            <span>{estadoSnack.message}</span>
          </Box>
        )}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Box component="style">{`
        @keyframes pulseBorder {
          0% { opacity: 0.7; transform: scaleX(0.95); }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0.7; transform: scaleX(0.95); }
        }
        @keyframes estadoBlink {
          0% { border-color: #fff; }
          30% { border-color: #f7b32b; }
          60% { border-color: #2bbf5b; }
          100% { border-color: #fff; }
        }
        @keyframes estadoShake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
        .estado-blink {
          animation: estadoBlink 0.8s;
        }
        .estado-shake {
          animation: estadoShake 0.8s;
        }
      `}</Box>
    </Box>
  );
}
