// src/pages/DashboardAdmin.tsx
// Dashboard administrativo centralizado
// Todas las secciones en una sola vista, con lógica y UI clara
import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, FormControl, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, InputLabel } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from "@mui/material/styles";
import DashboardBadge from "./components/DashboardBadge";
import ResumenDia from "./ResumenDia";
import GestionProductos from "./GestionProductos";
import HistorialPedidos from "./HistorialPedidos";
// ...existing code...
import { Download, Edit, Delete, Add, LocalPizza, LocalDrink, BarChart } from "@mui/icons-material";
import { db } from "../firebase/Config";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { getPizzasNormalized, getDrinksNormalized, getOrdersNormalized } from "../services/select";
import type { Order, Product } from "../domain/types";

// --- Funciones auxiliares ---
// Leer pizzas de Firebase
const fetchPizzas = async () => {
  const snapshot = await getDocs(collection(db, "pizzas"));
  return snapshot.docs.map(doc => ({ id: doc.id, type: 'pizza', ...doc.data() }));
};

// Leer bebidas de Firebase
const fetchDrinks = async () => {
  const snapshot = await getDocs(collection(db, "drinks"));
  return snapshot.docs.map(doc => ({ id: doc.id, type: 'drink', ...doc.data() }));
};

// Leer pedidos de Firebase
const fetchOrders = async () => {
  const snapshot = await getDocs(collection(db, "orders"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const DashboardAdmin: React.FC = () => {
  // --- Estados principales ---
  const [pizzas, setPizzas] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState({ fecha: "", producto: "", estado: "" });
  const [search, setSearch] = useState("");
  // --- Navbar ---
  const [navOption, setNavOption] = useState("Dashboard");
  const handleNavChange = (event: any) => {
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
  // Modal de reporte
  const [openReporte, setOpenReporte] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<'todas' | 'pizzas' | 'bebidas'>('todas');
  const handleOpenReporte = () => setOpenReporte(true);
  const handleCloseReporte = () => setOpenReporte(false);
  const [reporteGenerado, setReporteGenerado] = useState<string | null>(null);
  // Simulación de datos de reporte
  const infoReporte = {
    todas: 'Resumen de todas las ventas: ...',
    pizzas: 'Ventas de pizzas: ...',
    bebidas: 'Ventas de bebidas: ...',
  };
  const handleGenerar = () => {
    setReporteGenerado(infoReporte[tipoReporte]);
  };
  const handleCancelar = () => {
    setReporteGenerado(null);
    handleCloseReporte();
  };
  // Calcular pizzas vendidas hoy
  const today = new Date();
  const isSameDay = (dateA: Date, dateB: Date) =>
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear();
  const toDate = (v: any): Date => v instanceof Date ? v : (v?.toDate ? v.toDate() : new Date(v));
  const totalPizzasVendidasHoy = orders
    .filter(o => o.createdAt && isSameDay(toDate(o.createdAt), today))
    .reduce((acc, o) => {
      if (Array.isArray(o.pizzas)) {
        return acc + o.pizzas.reduce((sum, p) => sum + (p.quantity || 0), 0);
      }
      return acc;
    }, 0);
  const CustomToolbar = styled(Toolbar)(({ theme }) => ({
    minHeight: "49px !important",
    height: "49px",
    paddingLeft: theme.spacing(0),
    paddingRight: theme.spacing(0),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  }));

  // Cargar datos al montar
  useEffect(() => {
    getPizzasNormalized().then(arr => setPizzas(arr.filter(p => p.type === 'pizza')));
    getDrinksNormalized().then(arr => setDrinks(arr.filter(d => d.type === 'drink')));
    getOrdersNormalized().then(setOrders);
  }, []);

  // --- 1. Resumen del día ---
  // Calcular ventas por tipo, más vendida, más rápida, últimos 30 min, horas pico

  // Ventas por tipo y desglose horario
  const ventasPorTipo = pizzas.map(pizza => {
    // Filtrar pedidos del día
    const pedidosHoy = orders.filter(o => isSameDay(toDate(o.createdAt), today));
    // Total vendidas
    const total = pedidosHoy.reduce((acc, o) => {
      if (Array.isArray(o.pizzas)) {
        return acc + o.pizzas.filter((p: any) => p.name === pizza.name).reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
      }
      return acc;
    }, 0);
    // Desglose por hora
    const breakdown: Record<string, number> = {};
    pedidosHoy.forEach(o => {
      if (Array.isArray(o.pizzas)) {
        const hora = o.createdAt ? toDate(o.createdAt).getHours().toString().padStart(2, '0') + ':00' : '';
        o.pizzas.forEach((p: any) => {
          if (p.name === pizza.name) {
            breakdown[hora] = (breakdown[hora] || 0) + (p.quantity || 0);
          }
        });
      }
    });
    return {
      name: pizza.name,
      total,
      breakdown
    } as PizzaSale;
  });

  // Pizza más vendida
  const pizzaMasVendida = ventasPorTipo.reduce((max, curr) => curr.vendidas > max.vendidas ? curr : max, ventasPorTipo[0] || { vendidas: 0 });

  // Pizza más vendida últimos 30 min
  const hace30Min = new Date(Date.now() - 30 * 60 * 1000);
  const ventasUlt30 = pizzas.map(pizza => ({
    ...pizza,
    vendidas: orders.filter(o => toDate(o.createdAt) > hace30Min).reduce((acc, o) => {
      if (Array.isArray(o.pizzas)) {
        return acc + o.pizzas.filter((p: any) => p.name === pizza.name).reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
      }
      return acc;
    }, 0)
  }));
  const pizzaUlt30 = ventasUlt30.reduce((max, curr) => curr.vendidas > max.vendidas ? curr : max, ventasUlt30[0] || { vendidas: 0 });

  // Pizza vendida más rápido
  let pizzaRapida = null;
  let minInterval = Infinity;
  orders.forEach(o => {
    if (Array.isArray(o.pizzas)) {
      o.pizzas.forEach((p: any) => {
        const prevOrder = orders.find(prev => toDate(prev.createdAt) < toDate(o.createdAt) && Array.isArray(prev.pizzas) && prev.pizzas.some((pp: any) => pp.name === p.name));
        if (prevOrder) {
          const interval = toDate(o.createdAt).getTime() - toDate(prevOrder.createdAt).getTime();
          if (interval < minInterval) {
            minInterval = interval;
            pizzaRapida = p.name;
          }
        }
      });
    }
  });

  // Horas pico (conteo por hora)
  const horasPico = Array(24).fill(0);
  orders.forEach(o => {
    const h = toDate(o.createdAt).getHours();
    horasPico[h]++;
  });

  // --- 2. Gestión de productos ---
  // Activar/desactivar producto
  const handleToggleProducto = async (tipo: string, id: string, activo: boolean) => {
    const ref = doc(db, tipo, id);
    await updateDoc(ref, { activo: !activo });
    if (tipo === "pizzas") setPizzas(pizzas.map(p => p.id === id ? { ...p, activo: !activo } : p));
    if (tipo === "drinks") setDrinks(drinks.map(d => d.id === id ? { ...d, activo: !activo } : d));
  };

  // Editar precio
  const handleEditPrecio = async (tipo: string, id: string, precio: number) => {
    const ref = doc(db, tipo, id);
    await updateDoc(ref, { price: precio });
    if (tipo === "pizzas") setPizzas(pizzas.map(p => p.id === id ? { ...p, price: precio } : p));
    if (tipo === "drinks") setDrinks(drinks.map(d => d.id === id ? { ...d, price: precio } : d));
  };

  // Eliminar producto
  const handleDeleteProducto = async (tipo: string, id: string) => {
    await deleteDoc(doc(db, tipo, id));
    if (tipo === "pizzas") setPizzas(pizzas.filter(p => p.id !== id));
    if (tipo === "drinks") setDrinks(drinks.filter(d => d.id !== id));
  };

  // Añadir producto
  const handleAddProducto = async (tipo: string, producto: any) => {
    const ref = collection(db, tipo);
    await addDoc(ref, producto);
    if (tipo === "pizzas") getPizzasNormalized().then(arr => setPizzas(arr.filter(p => p.type === 'pizza')));
    if (tipo === "drinks") getDrinksNormalized().then(arr => setDrinks(arr.filter(d => d.type === 'drink')));
  };

  // --- 3. Historial de pedidos ---
  // Filtrar pedidos por fecha, producto, estado y búsqueda
  const filteredOrders = orders.filter(o => {
    const fechaOk = !filter.fecha || (o.createdAt && toDate(o.createdAt).toLocaleDateString() === filter.fecha);
    const prodOk = !filter.producto || (Array.isArray(o.pizzas) && o.pizzas.some((p: any) => p.name === filter.producto)) || (Array.isArray(o.drinks) && o.drinks.some((d: any) => d.name === filter.producto));
    const estadoOk = !filter.estado || o.estado === filter.estado;
    const searchOk = !search || (o.orderId && o.orderId.toLowerCase().includes(search.toLowerCase()));
    return fechaOk && prodOk && estadoOk && searchOk;
  });

  // --- Refs para navegación ---
  const resumenRef = React.useRef<HTMLDivElement>(null);
  const productosRef = React.useRef<HTMLDivElement>(null);
  const pedidosRef = React.useRef<HTMLDivElement>(null);

  // Estado para sección activa
  const [activeSection, setActiveSection] = useState(0);

  // Handler para navegación
  const handleNavigate = (section: number) => {
    setActiveSection(section);
    const refs = [resumenRef, productosRef, pedidosRef];
    const ref = refs[section];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Renderizado UI ---
return (
  <>
    <AppBar position="static" sx={{ backgroundColor: "#bf1e2d" }}>
      <CustomToolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "49px !important", height: "49px", px: 2 }}>
        {/* Fratelli alineado a la izquierda */}
        <Typography variant="h6" sx={{ fontFamily: "'Roboto Slab', serif", color: "#fff", fontWeight: "bold", letterSpacing: 1 }}>
          Fratelli
        </Typography>
        {/* Chips y menú a la derecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            </Select>
          </FormControl>
          {/* Icono para abrir modal de reporte */}
        </Box>
      </CustomToolbar>
    </AppBar>
    <Box sx={{
      p: { xs: 0, sm: 2, md: 3 },
      background: "#f5f5f5",
      minHeight: "100vh",
      maxWidth: "1200px",
      mx: "auto",
      position: 'relative',
      pb: 8 /* espacio para el badge inferior */
    }}>
      {/* --- 1. Resumen del día --- */}
      {activeSection === 0 && (
        <Box ref={resumenRef} sx={{ mb: 3, transition: 'opacity 0.4s', opacity: 1 }}>
          <ResumenDia ventasPorTipo={ventasPorTipo} />
        </Box>
      )}
      {/* --- 2. Gestión de productos --- */}
      {activeSection === 1 && (
        <Box ref={productosRef} sx={{ transition: 'opacity 0.4s', opacity: 1,padding: 0 }}>
          <GestionProductos
            productos={[...pizzas, ...drinks]}
            handleEditPrecio={handleEditPrecio}
            handleToggleProducto={handleToggleProducto}
            handleDeleteProducto={handleDeleteProducto}
            handleAddProducto={handleAddProducto}
          />
        </Box>
      )}
      {/* --- 3. Historial de pedidos --- */}
      {activeSection === 2 && (
        <Box ref={pedidosRef} sx={{ transition: 'opacity 0.4s', opacity: 1 }}>
          <HistorialPedidos
            pizzas={pizzas}
            drinks={drinks}
            filteredOrders={filteredOrders}
            handleEditPrecio={handleEditPrecio}
            handleToggleProducto={handleToggleProducto}
            handleDeleteProducto={handleDeleteProducto}
            handleAddProducto={handleAddProducto}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
          />
        </Box>
      )}
      <DashboardBadge onNavigate={handleNavigate} active={activeSection} />
    </Box>
  </>
  );
};

export default DashboardAdmin;
