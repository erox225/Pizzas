import React, { useEffect, useRef } from "react";
import {
  Paper,
  Typography,
  Divider,
  Button,
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { TransitionGroup } from "react-transition-group";
import { useOrderSummary, OrderLike, SummaryItem } from "../../hooks/useOrderSummary";

// Animación para la modal
const modalAnim = {
  animation: 'modalFadeIn 0.45s cubic-bezier(.23,1.01,.32,1)'
};

export interface OrderSummaryProps {
  totalSlices: number;
  totalAmount: number;
  onConfirm: () => void; // crear orden
  onFinalize?: () => void; // finalizar orden existente
  selectedOrderId: string | null;
  orders: any[];
  currentOrder: OrderLike;
  localFinalizados: Record<string, boolean>;
  setLocalFinalizados: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  headerColor?: string;
  borderColor?: string;
  onFastOrder?: () => void;
  onEstadoChange?: (estado: string) => void;
  onEditModeChange?: (editing: boolean) => void;
  // callbacks para órdenes nuevas (sin id)
  onRemoveItem?: (id: string, name: string) => void;
}

export default function OrderSummary({
  totalSlices,
  // totalAmount ya no se recibe como prop, se calcula abajo
  onConfirm,
  onFinalize,
  selectedOrderId,
  orders,
  currentOrder,
  localFinalizados,
  setLocalFinalizados,
  headerColor = "#002f6c",
  borderColor = "#002f6c",
  onFastOrder,
  onEstadoChange,
  onEditModeChange,
  onRemoveItem,
  
}: OrderSummaryProps) {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showCloseModal, setShowCloseModal] = React.useState(false);
  const [showFastModal, setShowFastModal] = React.useState(false);

  // Hook que calcula los productos seleccionados, control de finalizados y bebidas a partir de la orden actual
  const { selected, toggleItemClick, totalDrinks, badgeRef } = useOrderSummary({
    currentOrder,
    localFinalizados,
    setLocalFinalizados,
  });
  // Modo edición y menú de opciones (solo órdenes existentes)
  const [editMode, setEditMode] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedToDelete, setSelectedToDelete] = React.useState<Set<string>>(new Set());
  const openMenu = Boolean(menuAnchor);
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);
  const handleStartEdit = () => { setEditMode(true); setSelectedToDelete(new Set()); try { onEditModeChange && onEditModeChange(true); } catch {} handleCloseMenu(); };
  // Animación de zumbido al intentar seleccionar para borrar un producto no permitido
  const [shakeSet, setShakeSet] = React.useState<Set<string>>(new Set());
  // Efecto sutil para ítems recién añadidos
  const [justAddedKeys, setJustAddedKeys] = React.useState<Set<string>>(new Set());
  const prevKeysRef = React.useRef<string[]>([]);
  // Efecto sutil al cambiar la cantidad (incremento)
  const [qtyPulseKeys, setQtyPulseKeys] = React.useState<Set<string>>(new Set());
  const prevQtyRef = React.useRef<Record<string, number>>({});
  // Pulso en el total al cambiar
  const [totalPulse, setTotalPulse] = React.useState(false);
  // Refs por ítem para hacer scroll al agregar/cambiar
  const itemRefs = React.useRef<Map<string, HTMLDivElement | null>>(new Map());
  // Animación suave al mostrar/cambiar la orden seleccionada
  const [createdAnim, setCreatedAnim] = React.useState(false);
  // Animación de salida al cerrar/finalizar
  const [exiting, setExiting] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const prevSelectedIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const prev = prevSelectedIdRef.current;
    if (selectedOrderId && selectedOrderId !== prev) {
      setCreatedAnim(true);
      const t = setTimeout(() => setCreatedAnim(false), 240);
      prevSelectedIdRef.current = selectedOrderId;
      return () => clearTimeout(t);
    }
    prevSelectedIdRef.current = selectedOrderId ?? null;
  }, [selectedOrderId]);

  // Calcular el total sumando pizzas y bebidas (colocado arriba para usar en efectos)
  const allItems = [
    ...(currentOrder?.pizzas ?? []),
    ...(currentOrder?.drinks ?? [])
  ];
  const totalAmount = allItems.reduce((acc, item) => {
    let price = 0;
    if (typeof item.pricePerUnit === "number") price = item.pricePerUnit;
    else if (item.pricePerUnit) price = parseFloat(item.pricePerUnit);
    else if (typeof item.price === "number") price = item.price;
    else if (item.price) price = parseFloat(item.price);
    return acc + (item.quantity * price);
  }, 0);
  React.useEffect(() => {
    const keys = selected.map((p: any) => p?.id || p?.name).filter(Boolean);
    const prev = prevKeysRef.current;
    const added = keys.filter(k => !prev.includes(k));
    if (added.length) {
      setJustAddedKeys(prevSet => {
        const next = new Set(prevSet);
        added.forEach(k => {
          next.add(k);
          setTimeout(() => {
            setJustAddedKeys(curr => { const c = new Set(curr); c.delete(k); return c; });
          }, 450);
        });
        return next;
      });
      // Hacer scroll al último ítem agregado
      const targetKey = added[added.length - 1];
      setTimeout(() => {
        const el = itemRefs.current.get(targetKey);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
    prevKeysRef.current = keys;
  }, [selected]);

  // Detectar incrementos de cantidad y aplicar un pulso corto
  React.useEffect(() => {
    const curr: Record<string, number> = {};
    selected.forEach((p: any) => {
      const k = p?.id || p?.name;
      if (!k) return;
      curr[k] = p?.quantity ?? 0;
    });
    const prev = prevQtyRef.current;
    const incKeys: string[] = [];
    Object.keys(curr).forEach(k => {
      const prevQty = prev[k] ?? 0;
      const nowQty = curr[k] ?? 0;
      if (nowQty > prevQty) incKeys.push(k);
    });
    if (incKeys.length) {
      setQtyPulseKeys(prevSet => {
        const next = new Set(prevSet);
        incKeys.forEach(k => {
          next.add(k);
          setTimeout(() => {
            setQtyPulseKeys(currSet => { const copy = new Set(currSet); copy.delete(k); return copy; });
          }, 320);
        });
        return next;
      });
      // Hacer scroll al último ítem incrementado
      const targetKey = incKeys[incKeys.length - 1];
      setTimeout(() => {
        const el = itemRefs.current.get(targetKey);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
    prevQtyRef.current = curr;
  }, [selected]);

  // Mantener el orden estable; el scroll apunta al último agregado/cambiado

  // Pulso suave en el total cuando cambia el importe
  React.useEffect(() => {
    setTotalPulse(true);
    const t = setTimeout(() => setTotalPulse(false), 240);
    return () => clearTimeout(t);
  }, [totalAmount]);

  // Color de borde y cabecera según estado de la orden o si es nueva orden
  let customBorderColor = borderColor;
  let customHeaderColor = headerColor;
  if (!selectedOrderId) {
    customBorderColor = "#1976d2";
    customHeaderColor = "#1976d2";
  } else if (currentOrder?.estado === "Preparando") {
    customBorderColor = "#ba7c00";
  } else if (currentOrder?.estado === "Entregado") {
    customBorderColor = "#078430";
  }

  // useEffect para forzar el cambio de color cuando el estado cambie
  React.useEffect(() => {
    if (!selectedOrderId) {
      customBorderColor = "#1976d2";
      customHeaderColor = "#1976d2";
    } else if (currentOrder?.estado === "Preparando") {
      customBorderColor = "#ba7c00";
      customHeaderColor = "#ba7c00";
    } else if (currentOrder?.estado === "Entregado") {
      customBorderColor = "#078430";
      customHeaderColor = "#078430";
    } else if (currentOrder?.estado === "Finalizado") {
      customBorderColor = "#888";
      customHeaderColor = "#888";
    }
  }, [currentOrder?.estado, selectedOrderId]);

  // Color del botón y texto según estado y tipo de orden
  let buttonBg = "#388e3c"; // verde por defecto
  let buttonText = "#fff";
  if (!selectedOrderId) {
    buttonBg = "#2196f3"; // azul claro
    buttonText = "#fff";
  } else if (currentOrder?.estado === "Preparando") {
    buttonBg = "#8a2323"; // rojo
    buttonText = "#fff";
  } else if (currentOrder?.estado === "Entregado") {
    buttonBg = "#1976d2"; // azul
    buttonText = "#fff";
  }

  // DEBUG opcional
  // if (selectedOrderId) console.log('DEBUG allItems:', allItems);

  // Filtrar ítems no finalizados (pizzas y bebidas)
  const pendientes = allItems.filter((item: any) => !item.finalizado);
  const allFinal = selected.length > 0 && pendientes.length === 0;
  const allCheckedNew = !selectedOrderId && selected.length > 0 && pendientes.length === 0;

  // Handler para el click del botón
  // Estado para ocultar el resumen tras finalizar
  const [ocultarResumen, setOcultarResumen] = React.useState(false);

  // Ocultar el resumen si la orden pasa a Finalizado en local
  React.useEffect(() => {
    if (selectedOrderId && currentOrder?.estado === "Finalizado") {
      setOcultarResumen(true);
    }
  }, [selectedOrderId, currentOrder?.estado]);

  // Transición de salida cuando se solicita ocultar
  React.useEffect(() => {
    if (ocultarResumen && !exiting) {
      setExiting(true);
      const t = setTimeout(() => setHidden(true), 220);
      return () => clearTimeout(t);
    }
  }, [ocultarResumen, exiting]);

  const handleButtonClick = async () => {
    if (selectedOrderId && currentOrder?.estado === "Preparando") {
      setShowConfirmModal(true);
    } else if (selectedOrderId && ["Preparando", "Entregado"].includes(currentOrder?.estado)) {
      onFinalize && onFinalize();
    } else {
      onConfirm();
    }
  };

  // Renderizado del resumen de la orden (ocultar si se finalizó)
  if (hidden) return null;
  return (
    <>
    {/* Estilos globales del componente */}
    <style>{`
      @keyframes rowShake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-2px); }
        40% { transform: translateX(2px); }
        60% { transform: translateX(-2px); }
        80% { transform: translateX(2px); }
        100% { transform: translateX(0); }
      }
      @keyframes orderCreated {
        0% { opacity: .0; transform: translateY(-6px) scale(0.98); }
        60% { opacity: 1; transform: translateY(0) scale(1.01); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes orderExit {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-4px) scale(0.98); }
      }
    `}</style>
    <Paper
      sx={{
        margin: "0 auto",
        overflow: "hidden",
        borderRadius: 2,
        backgroundColor: "#fff",
        border: `2px solid ${customBorderColor}`,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        width: "90%",
        animation: exiting ? 'orderExit 240ms cubic-bezier(.22,.8,.36,1) forwards' : (createdAnim ? 'orderCreated 240ms cubic-bezier(.22,.8,.36,1)' : 'none')
      }}
      elevation={0}
    >
      <Box
        sx={{
          backgroundColor: customHeaderColor,
          color: "white",
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold"
        }}
        ref={badgeRef}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {selectedOrderId ? `ORDEN #${selectedOrderId}` : "NUEVA ORDEN"}
        </Typography>
        {selectedOrderId && (
          <>
            <IconButton size="small" onClick={handleOpenMenu} sx={{ color: '#fff' }} aria-label="Opciones" title="Opciones">
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={openMenu} onClose={handleCloseMenu}>
              <MenuItem onClick={handleStartEdit}>Editar</MenuItem>
              <MenuItem onClick={() => { handleCloseMenu(); setShowCloseModal(true); }}>Eliminar</MenuItem>
            </Menu>
          </>
        )}
        {!selectedOrderId && selected.length > 0 && (
          <Box sx={{ position: 'relative', ml: 1, display: 'inline-block' }}>
            {/* Editar */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => { setEditMode(true); setSelectedToDelete(new Set()); try { onEditModeChange && onEditModeChange(true); } catch {} }}
              sx={{
                color: '#fff', borderColor: '#fff',
                opacity: editMode ? 0 : 1,
                transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1)',
                pointerEvents: editMode ? 'none' : 'auto'
              }}
              startIcon={<EditOutlinedIcon sx={{ color: '#fff' }} />}
            >
              Editar
            </Button>
            {/* Salir */}
            <Button
              size="small"
              variant="outlined"
              onClick={() => { setEditMode(false); setSelectedToDelete(new Set()); try { onEditModeChange && onEditModeChange(false); } catch {} }}
              sx={{
                position: 'absolute', top: 0, left: 0,
                color: '#fff', borderColor: '#fff',
                opacity: editMode ? 1 : 0,
                transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1)',
                pointerEvents: editMode ? 'auto' : 'none'
              }}
              startIcon={<ArrowBackIosNewOutlinedIcon sx={{ color: '#fff' }} />}
            >
              Salir
            </Button>
          </Box>
        )}
      </Box>

      <Collapse in={selected.length > 0} timeout="auto" unmountOnExit>
        <Box
          sx={{
            p: 1.4
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
          borderBottom: `2px solid ${customHeaderColor}`,
              pb: .2,
              mb: 1
            }}
          >
            <Typography sx={{ flex: 4 ,fontWeight: "bold"}}>PRODUCTO</Typography>
            <Typography sx={{ flex: 1, textAlign: "right",fontWeight: "bold" }}>IMPORTE</Typography>
          </Box>

          <Box sx={{ maxHeight: "250px", overflowY: "auto" }}>
            <TransitionGroup>
              {/* Mostramos cada producto seleccionado de la orden (pizzas o bebidas), con cantidad y total */}
              {/* Al hacer click se alterna su estado `finalizado` visualmente y en la base de datos */}
              {selected.map((p, idx) => (
                <Collapse key={`${p.name}-${idx}`}> 
                  <Box
                    ref={(el) => {
                      const key = (p as any)?.id || (p as any)?.name;
                      if (!key) return;
                      // Guardar/eliminar ref para scroll programático
                      if (el) {
                        // Asegurar estructura
                        (itemRefs as any).current = (itemRefs as any).current || new Map();
                        (itemRefs as any).current.set(key, el);
                      } else {
                        (itemRefs as any).current?.delete?.(key);
                      }
                    }}
                    onClick={async () => {
                      if (editMode) {
                        const key = (p as any).id || p.name;
                        // Si está finalizado, no permitir seleccionar para borrar, hacer zumbido
                        if (p.finalizado) {
                          setShakeSet(prev => {
                            const next = new Set(prev); next.add(key); return next;
                          });
                          setTimeout(() => {
                            setShakeSet(prev => { const next = new Set(prev); next.delete(key); return next; });
                          }, 350);
                          return;
                        }
                        setSelectedToDelete(prev => {
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key); else next.add(key);
                          return next;
                        });
                        return;
                      }
                      await toggleItemClick(`${selectedOrderId}-${p.name}`);
                      // Comprobar si todos los ítems están finalizados usando los arrays actualizados
                      const allFinalizadosNow = [
                        ...((currentOrder?.pizzas || []) as any[]),
                        ...((currentOrder?.drinks || []) as any[]),
                      ].every((it: any) => it.finalizado);
                      let nuevoEstado = allFinalizadosNow ? "Entregado" : "Preparando";
                      // Actualizar el estado en Firestore si cambia
                      if (selectedOrderId && currentOrder?.estado !== nuevoEstado) {
                        try {
                          let db = window.db;
                          if (!db) {
                            const { getFirestore } = await import("firebase/firestore");
                            const { initializeApp } = await import("firebase/app");
                            const firebaseConfig = window.firebaseConfig || {};
                            const app = initializeApp(firebaseConfig);
                            db = getFirestore(app);
                          }
                          const { doc, updateDoc } = await import("firebase/firestore");
                          const ref = doc(db, "orders", currentOrder.id);
                          await updateDoc(ref, { estado: nuevoEstado });
                        } catch (e) {}
                        // Feedback inmediato: actualizar estado en UI
                        try { onEstadoChange && onEstadoChange(nuevoEstado); } catch {}
                      }
                    }}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                      mb: 0.7,
                      cursor: "pointer",
                      transition: "background-color 0.2s, border-left-color 0.2s",
                      backgroundColor: (editMode && selectedToDelete.has(((p as any).id || p.name))) ? '#fde7e9' : (p.finalizado ? "#f5f5f5" : (justAddedKeys.has(((p as any).id || p.name)) ? '#fff3e0' : (qtyPulseKeys.has(((p as any).id || p.name)) ? '#eef9f1' : "transparent"))),
                      borderRadius: 1,
                      p: 1,
                      position: 'relative',
                      borderLeft: (editMode && selectedToDelete.has(((p as any).id || p.name))) ? '4px solid #bf1e2d' : (p.finalizado ? '4px solid #4caf50' : '4px solid transparent'),
                      animation: shakeSet.has(((p as any).id || p.name)) ? 'rowShake 0.3s' : (justAddedKeys.has(((p as any).id || p.name)) ? 'rowNew 0.38s cubic-bezier(.22,.8,.36,1)' : (qtyPulseKeys.has(((p as any).id || p.name)) ? 'rowPulse 0.24s cubic-bezier(.22,.8,.36,1)' : 'none'))
                    }}
                  >
                    {p.finalizado && (
                      <Box
                        component="span"
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: "1.2rem"
                        }}
                      >
                        ✅
                      </Box>
                    )}
                    <Typography sx={{ flex: 4, pl: 3 }}>
                      {p.quantity} x {p.name}
                    </Typography>
                    <Typography sx={{ flex: 1, textAlign: "right" }}>
                      €{(p.quantity * (typeof p.pricePerUnit === "number" ? p.pricePerUnit : parseFloat(p.pricePerUnit || "0"))).toFixed(2)}
                    </Typography>
                    {/* sin botón individual de eliminar en modo normal */}
                  </Box>
                </Collapse>
              ))}
            </TransitionGroup>
          </Box>

          {/* Toggle seleccionar/deseleccionar todo (finalizados). Oculto si es nueva orden en modo edición */}
          {(() => { const show = selected.length > 0 && !editMode; return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1, opacity: show ? 1 : 0, maxHeight: show ? 48 : 0, overflow: 'hidden', transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), max-height 240ms cubic-bezier(.22,.8,.36,1)' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  const mark = (it: any) => ({ ...it, finalizado: !allFinal });
                  const updatedP = (currentOrder.pizzas || []).map(mark);
                  const updatedD = (currentOrder.drinks || []).map(mark);
                  (currentOrder as any).pizzas = updatedP; (currentOrder as any).drinks = updatedD;
                  try {
                    if (currentOrder.id) {
                      const { updateOrderItems } = await import('../../services/update');
                      await updateOrderItems(currentOrder.id as string, updatedP as any[], updatedD as any[]);
                      // Si tras la operación todos quedan finalizados, marcar estado Entregado; si no, Preparando
                      const nowAllFinal = [...updatedP, ...updatedD].every((it: any) => it.finalizado);
                      try {
                        const { doc, updateDoc } = await import('firebase/firestore');
                        const { db } = await import('../../firebase/Config');
                        const ref = doc(db as any, 'orders', currentOrder.id as string);
                        await updateDoc(ref, { estado: nowAllFinal ? 'Entregado' : 'Preparando' });
                      } catch {}
                      // Feedback inmediato: actualizar estado en UI
                      try { onEstadoChange && onEstadoChange(nowAllFinal ? 'Entregado' : 'Preparando'); } catch {}
                    } else {
                      const map: Record<string, boolean> = {};
                      selected.forEach((s: any) => { map[s.name] = !allFinal; });
                      setLocalFinalizados(map);
                    }
                  } catch {}
                }}
              >
                {allFinal && <span style={{ marginRight: 6 }}>✅</span>}
                {allFinal ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </Button>
            </Box>
          ); })()}

          {(() => { const show = editMode; return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, opacity: show ? 1 : 0, maxHeight: show ? 56 : 0, overflow: 'hidden', transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), max-height 240ms cubic-bezier(.22,.8,.36,1)' }}>
              {selectedOrderId && (
                <Button size="small" variant="outlined" onClick={() => { setEditMode(false); setSelectedToDelete(new Set()); try { onEditModeChange && onEditModeChange(false); } catch {} }} startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 16 }} />} sx={{ fontSize: '0.8rem', py: 0.3 }}>
                  Salir de edición
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                color="error"
                disabled={selectedToDelete.size === 0}
                startIcon={<DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ fontSize: '0.8rem', py: 0.35 }}
                onClick={async () => {
                  const ids = new Set(Array.from(selectedToDelete));
                  if (currentOrder?.id) {
                    try {
                      const updatedP = (currentOrder.pizzas || []).filter((it: any) => !ids.has(it.id || it.name));
                      const updatedD = (currentOrder.drinks || []).filter((it: any) => !ids.has(it.id || it.name));
                      (currentOrder as any).pizzas = updatedP;
                      (currentOrder as any).drinks = updatedD;
                      const { updateOrderItems } = await import('../../services/update');
                      await updateOrderItems(currentOrder.id as string, updatedP as any[], updatedD as any[]);
                    } catch {}
                  } else if (onRemoveItem) {
                    selected.forEach((s: any) => {
                      const key = (s as any).id || s.name;
                      if (ids.has(key)) onRemoveItem((s as any).id as string, s.name);
                    });
                  }
                  setSelectedToDelete(new Set());
                }}
              >
                Eliminar productos
              </Button>
            </Box>
          ); })()}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box>
              <span role="img" aria-label="pizza" style={{ marginRight: 8, fontSize: '1.5rem' }}>🍕</span>
              {totalSlices}
              <span role="img" aria-label="drink" style={{ margin: "0 8px", fontSize: '1.5rem' }}>🥤</span>
              {totalDrinks}
            </Box>
            <Typography fontWeight="bold" sx={{ fontSize: '1.15rem', color: '#222', ml: 1, animation: totalPulse ? 'rowPulse 0.24s cubic-bezier(.22,.8,.36,1)' : 'none' }}>
              €{totalAmount.toFixed(2)}
            </Typography>
          </Box>
          <Typography fontWeight="bold" sx={{ textAlign: "right", mb: 2 }}>
           
          </Typography>

          {(() => { const showMain = !(selectedOrderId && editMode); return (
            <Box sx={{ opacity: showMain ? 1 : 0, maxHeight: showMain ? 48 : 0, overflow: 'hidden', transform: showMain ? 'translateY(0)' : 'translateY(-4px)', transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), max-height 240ms cubic-bezier(.22,.8,.36,1), transform 240ms cubic-bezier(.22,.8,.36,1)' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: buttonBg,
                  color: buttonText,
                  "&:hover": { backgroundColor: buttonBg },
                  borderRadius: "6px",
                  fontWeight: "bold",
                  opacity: showMain ? 1 : 0,
                  transform: showMain ? 'scale(1)' : 'scale(0.98)',
                  transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), transform 240ms cubic-bezier(.22,.8,.36,1)',
                  pointerEvents: showMain ? 'auto' : 'none'
                }}
                aria-hidden={!showMain}
                onClick={handleButtonClick}
              >
                {selectedOrderId ? "Finalizar Orden" : "Crear Orden"}
              </Button>
            </Box>
          ); })()}
          {(() => { const show = allCheckedNew; return (
            <Box sx={{ mt: show ? 1 : 0, opacity: show ? 1 : 0, maxHeight: show ? 48 : 0, overflow: 'hidden', transform: show ? 'translateY(0)' : 'translateY(-4px)', transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), max-height 240ms cubic-bezier(.22,.8,.36,1), transform 240ms cubic-bezier(.22,.8,.36,1)' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: "#2bbf5b",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "6px",
                  '&:hover': { backgroundColor: '#239a4b' },
                  opacity: show ? 1 : 0,
                  transform: show ? 'scale(1)' : 'scale(0.98)',
                  transition: 'opacity 240ms cubic-bezier(.22,.8,.36,1), transform 240ms cubic-bezier(.22,.8,.36,1)',
                  pointerEvents: show ? 'auto' : 'none'
                }}
                aria-hidden={!show}
                onClick={() => setShowFastModal(true)}
              >
                Orden rápida
              </Button>
            </Box>
          ); })()}
      {/* Modal de confirmación para finalizar orden en estado 'Preparando' */}
      {showConfirmModal && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              minWidth: 340,
              maxWidth: 400,
              p: 0,
              overflow: "hidden",
              ...modalAnim
            }}
          >
      {/* Animación CSS para la modal */}
      <style>{`
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          60% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
            <Box sx={{ backgroundColor: "#a32020", color: "#fff", px: 2, py: 1.5, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Aviso</Typography>
            </Box>
            <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Vas a finalizar una Orden sin entregar todo el pedido<br />¿Estás de acuerdo?
              </Typography>
              {pendientes.length > 0 && (
                <Box sx={{ mb: 2, textAlign: 'left', background: '#f8f8f8', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#a32020' }}>
                    Ítems pendientes:
                  </Typography>
                  {pendientes.map((item, idx) => (
                    <Typography key={item.id ?? item.name ?? idx} variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                      • {item.quantity} x {item.name} <span style={{ fontStyle: 'italic', color: '#888' }}>({item.type === 'pizza' ? 'Pizza' : 'Bebida'})</span>
                    </Typography>
                  ))}
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  variant="outlined"
                  sx={{ color: "#a32020", borderColor: "#a32020", fontWeight: "bold", flex: 1, mr: 1.5 }}
                  onClick={() => setShowConfirmModal(false)}
                >
                  NO
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#a32020", color: "#fff", fontWeight: "bold", flex: 1, ml: 1.5, '&:hover': { backgroundColor: '#7a1818' } }}
                  onClick={() => { setShowConfirmModal(false); onFinalize && onFinalize(); }}
                >
                  SÍ
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
        </Box>
      </Collapse>

      {/* Texto mostrado cuando no hay productos seleccionados */}
      {!selected.length && (
        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ opacity: 0.6, fontStyle: "italic", p: 2 }}
        >
          Aún no has añadido productos
        </Typography>
      )}
      {/* Botón eliminar orden retirado: se usa la X de cancelar arriba */}
    </Paper>

    {/* Animaciones de entrada y pulso en cambios */}
    <style>{`
      @keyframes rowNew { 0% { transform: scale(0.98); opacity: .85; } 60% { transform: scale(1.01); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes rowPulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
    `}</style>

    {/* Modal de confirmación para eliminar orden (desde menú) */}
    {showCloseModal && (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.25)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            minWidth: 340,
            maxWidth: 400,
            p: 0,
            overflow: "hidden",
            ...modalAnim
          }}
        >
          <Box sx={{ backgroundColor: "#6b7280", color: "#fff", px: 2, py: 1.5, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Eliminar orden</Typography>
          </Box>
          <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ¿Deseas eliminar esta orden?
              </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="outlined"
                sx={{ color: "#6b7280", borderColor: "#6b7280", fontWeight: "bold", flex: 1, mr: 1.5 }}
                onClick={() => setShowCloseModal(false)}
              >
                NO
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#ff1744', color: '#fff', fontWeight: 'bold', flex: 1, ml: 1.5, '&:hover': { backgroundColor: '#d50000' } }}
                onClick={async () => {
                  setShowCloseModal(false);
                  try {
                    if (currentOrder?.id) {
                      const { doc, updateDoc } = await import('firebase/firestore');
                      const { db } = await import('../../firebase/Config');
                      const ref = doc(db as any, 'orders', currentOrder.id as string);
                      await updateDoc(ref, { estado: 'Cancelado' });
                    }
                  } catch {}
                  setOcultarResumen(true);
                }}
              >
                Sí, eliminar
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    )}

    {/* Modal de confirmación para orden rápida */}
    {showFastModal && (
      <Box
        sx={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Box sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: 340, maxWidth: 400, overflow: 'hidden', ...modalAnim }}>
          <Box sx={{ backgroundColor: '#2bbf5b', color: '#fff', px: 2, py: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Crear orden rápida</Typography>
          </Box>
          <Box sx={{ px: 3, py: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Vas a crear una orden rápida y se marcará como <b>Finalizada</b> automáticamente. ¿Deseas continuar?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" sx={{ color: '#2bbf5b', borderColor: '#2bbf5b', fontWeight: 'bold', flex: 1, mr: 1.5 }} onClick={() => setShowFastModal(false)}>
                NO
              </Button>
              <Button variant="contained" sx={{ backgroundColor: '#2bbf5b', color: '#fff', fontWeight: 'bold', flex: 1, ml: 1.5, '&:hover': { backgroundColor: '#239a4b' } }} onClick={() => { setShowFastModal(false); (onFastOrder ? onFastOrder() : onConfirm()); }}>
                SÍ
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    )}
    </>
  );
}
