import React from "react";
import { Grid, Card, Typography, Box, TextField, Switch, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Add, Edit, Delete, LocalPizza, LocalDrink, ExpandMore } from "@mui/icons-material";
import type { Product, Order } from "../domain/types";

const estadoColor = {
  Preparando: '#bdbdbd',
  Entregado: '#4caf50',
  Finalizado: '#2196f3',
};

type Filter = { fecha?: string; producto?: string; estado?: string; fechaDesde?: string; fechaHasta?: string };

interface Props {
  pizzas: Product[];
  drinks: Product[];
  filteredOrders: Order[];
  handleEditPrecio: (tipo: 'pizzas' | 'drinks', id: string, precio: number) => void | Promise<void>;
  handleToggleProducto: (tipo: 'pizzas' | 'drinks', id: string, activo: boolean) => void | Promise<void>;
  handleDeleteProducto: (tipo: 'pizzas' | 'drinks', id: string) => void | Promise<void>;
  handleAddProducto: (tipo: 'pizzas' | 'drinks', producto: any) => void | Promise<void>;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const HistorialPedidos: React.FC<Props> = ({ pizzas, drinks, filteredOrders, handleEditPrecio, handleToggleProducto, handleDeleteProducto, handleAddProducto, filter, setFilter, search, setSearch }) => {
  // Estado para productos seleccionados en el filtro
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);

  // Filtrado de órdenes por productos seleccionados y por rango de fechas
  const toDate = (v: any): Date => v instanceof Date ? v : (v?.toDate ? v.toDate() : new Date(v));
  const filteredOrdersWithProducts = React.useMemo(() => {
    let orders = filteredOrders;
    // Filtrar por rango de fechas si hay valores
    if (filter.fechaDesde || filter.fechaHasta) {
      orders = orders.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = toDate(order.createdAt);
        let ok = true;
        if (filter.fechaDesde) {
          ok = ok && orderDate >= new Date(filter.fechaDesde);
        }
        if (filter.fechaHasta) {
          // Para incluir el día completo de la fechaHasta
          const hastaDate = new Date(filter.fechaHasta);
          hastaDate.setHours(23,59,59,999);
          ok = ok && orderDate <= hastaDate;
        }
        return ok;
      });
    }
    // Filtrado por productos seleccionados
    if (selectedProducts.length === 0) return orders;
    return orders.filter((order: any) => {
      const allProducts = [...(order.pizzas || []), ...(order.drinks || [])];
      // Si hay más de un producto seleccionado, solo mostrar órdenes que contengan TODOS los seleccionados
      if (selectedProducts.length > 1) {
        const productNames = allProducts.map((p: any) => p.name);
        return selectedProducts.every(sel => productNames.includes(sel));
      }
      // Si solo hay uno seleccionado, mostrar órdenes que lo contengan
      return allProducts.some((p: any) => selectedProducts.includes(p.name));
    });
  }, [filteredOrders, selectedProducts, filter.fechaDesde, filter.fechaHasta]);
  const [activeFilter, setActiveFilter] = React.useState<'id' | 'fecha' | 'producto' | 'estado'>('id');
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', bgcolor: '#f7f7f7' }}>
      <Card sx={{ width: { xs: '100%', md: 420 }, p: 0, mb: 4, boxShadow: 6, bgcolor: '#fff', color: '#222', position: 'relative', overflow: 'visible' }}>
        {/* Filtros interactivos UX/UI + Título sticky */}
        <Card sx={{ p: '6px', bgcolor: '#f9fafb', boxShadow: 2, borderRadius: 3, position: 'sticky', top: 0, zIndex: 10 }}>
          {/* Título */}
          <Box sx={{ width: '100%', pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: '#222', letterSpacing: 1, pt: 1, textAlign: 'center' }}>📦 Historial de Órdenes</Typography>
          </Box>
          {/* Fila de iconos */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
            {/* Cada icono ocupa ~23% del ancho, cuadrado, con espacio entre ellos */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '23%', minWidth: 70, maxWidth: '23%' }}>
              <IconButton
                aria-label="Buscar por ID"
                onClick={() => setActiveFilter('id')}
                sx={{
                  bgcolor: activeFilter === 'id' ? '#ffd600' : '#fff',
                  color: activeFilter === 'id' ? '#222' : '#888',
                  boxShadow: activeFilter === 'id' ? 2 : 0,
                  border: activeFilter === 'id' ? '2px solid #ffd600' : '2px solid #eee',
                  transition: 'all 0.2s',
                  outline: activeFilter === 'id' ? '1.5px solid #ffd600' : 'none',
                  outlineOffset: '2px',
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  minHeight: 64,
                  maxWidth: 64,
                  maxHeight: 64,
                  borderRadius: '50%',
                  m: 'auto',
                }}
              >
                <span style={{ fontSize: 22 }}>🔎</span>
              </IconButton>
              <Typography sx={{ fontSize: 13, color: activeFilter === 'id' ? '#222' : '#888', mt: 0.5, textAlign: 'center', fontWeight: activeFilter === 'id' ? 700 : 400 }}>ID</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '23%', minWidth: 70, maxWidth: '23%' }}>
              <IconButton
                aria-label="Filtrar por fecha"
                onClick={() => setActiveFilter('fecha')}
                sx={{
                  bgcolor: activeFilter === 'fecha' ? '#1976d2' : '#fff',
                  color: activeFilter === 'fecha' ? '#fff' : '#888',
                  boxShadow: activeFilter === 'fecha' ? 2 : 0,
                  border: activeFilter === 'fecha' ? '2px solid #1976d2' : '2px solid #eee',
                  transition: 'all 0.2s',
                  outline: activeFilter === 'fecha' ? '1.5px solid #ffd600' : 'none',
                  outlineOffset: '2px',
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  minHeight: 64,
                  maxWidth: 64,
                  maxHeight: 64,
                  borderRadius: '50%',
                  m: 'auto',
                }}
              >
                <span style={{ fontSize: 22 }}>📅</span>
              </IconButton>
              <Typography sx={{ fontSize: 13, color: activeFilter === 'fecha' ? '#222' : '#888', mt: 0.5, textAlign: 'center', fontWeight: activeFilter === 'fecha' ? 700 : 400 }}>Fecha</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '23%', minWidth: 70, maxWidth: '23%' }}>
              <IconButton
                aria-label="Filtrar por producto"
                onClick={() => setActiveFilter('producto')}
                sx={{
                  bgcolor: activeFilter === 'producto' ? '#d32f2f' : '#fff',
                  color: activeFilter === 'producto' ? '#fff' : '#888',
                  boxShadow: activeFilter === 'producto' ? 2 : 0,
                  border: activeFilter === 'producto' ? '2px solid #d32f2f' : '2px solid #eee',
                  transition: 'all 0.2s',
                  outline: activeFilter === 'producto' ? '1.5px solid #ffd600' : 'none',
                  outlineOffset: '2px',
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  minHeight: 64,
                  maxWidth: 64,
                  maxHeight: 64,
                  borderRadius: '50%',
                  m: 'auto',
                }}
              >
                <span style={{ fontSize: 22 }}>🍕🥤</span>
              </IconButton>
              <Typography sx={{ fontSize: 13, color: activeFilter === 'producto' ? '#222' : '#888', mt: 0.5, textAlign: 'center', fontWeight: activeFilter === 'producto' ? 700 : 400 }}>Producto</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '23%', minWidth: 70, maxWidth: '23%' }}>
              <IconButton
                aria-label="Filtrar por estado"
                onClick={() => setActiveFilter('estado')}
                sx={{
                  bgcolor: activeFilter === 'estado' ? '#4caf50' : '#fff',
                  color: activeFilter === 'estado' ? '#fff' : '#888',
                  boxShadow: activeFilter === 'estado' ? 2 : 0,
                  border: activeFilter === 'estado' ? '2px solid #4caf50' : '2px solid #eee',
                  transition: 'all 0.2s',
                  outline: activeFilter === 'estado' ? '1.5px solid #ffd600' : 'none',
                  outlineOffset: '2px',
                  width: 64,
                  height: 64,
                  minWidth: 64,
                  minHeight: 64,
                  maxWidth: 64,
                  maxHeight: 64,
                  borderRadius: '50%',
                  m: 'auto',
                }}
              >
                <span style={{ fontSize: 22 }}>�</span>
              </IconButton>
              <Typography sx={{ fontSize: 13, color: activeFilter === 'estado' ? '#222' : '#888', mt: 0.5, textAlign: 'center', fontWeight: activeFilter === 'estado' ? 700 : 400 }}>Estado</Typography>
            </Box>
          </Box>
          {/* Fila de input dinámico */}
          <Box sx={{ mt: 1 }}>
            {activeFilter === 'id' && (
              <TextField
                label="Buscar por ID"
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                fullWidth
                autoFocus
                sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, '& .MuiInputBase-root': { fontWeight: 500 } }}
              />
            )}
            {activeFilter === 'fecha' && (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  label="Desde"
                  size="small"
                  type="date"
                  value={filter.fechaDesde || ''}
                  onChange={e => setFilter((f: any) => ({ ...f, fechaDesde: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  autoFocus
                  sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, '& .MuiInputBase-root': { fontWeight: 500 } }}
                />
                <TextField
                  label="Hasta"
                  size="small"
                  type="date"
                  value={filter.fechaHasta || ''}
                  onChange={e => setFilter((f: any) => ({ ...f, fechaHasta: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, '& .MuiInputBase-root': { fontWeight: 500 } }}
                />
              </Box>
            )}
            {activeFilter === 'producto' && (
              <Box sx={{ width: '100%', bgcolor: '#ededed', borderRadius: 2, boxShadow: 0, p: 0, mb: 0, position: 'relative' }}>
                {/* Guía visual de scroll horizontal */}
                <>
                  <Box sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.45 }}>
                      <path d="M12 4.5L7.5 9L12 13.5" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                  <Box sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.45 }}>
                      <path d="M6 4.5L10.5 9L6 13.5" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Box>
                </>
                <Box sx={{ width: '100%', overflowX: 'auto', display: 'flex', gap: 2, py: 1, justifyContent: 'flex-start', position: 'relative', zIndex: 1 }}>
                  {[...pizzas, ...drinks].filter((prod: any, idx: number, arr: any[]) => arr.findIndex(p => p.name === prod.name) === idx).map((prod: any) => {
                    const selected = selectedProducts.includes(prod.name);
                    return (
                      <Box
                        key={prod.name + (selected ? '-selected' : '-unselected')}
                        onClick={() => {
                          setSelectedProducts(selected
                            ? selectedProducts.filter(n => n !== prod.name)
                            : [...selectedProducts, prod.name]
                          );
                        }}
                        sx={{
                          px: 2.5,
                          py: 0.8,
                          borderRadius: 2.5,
                          bgcolor: selected ? '#1976d2' : '#d3d3d3',
                          color: selected ? '#fff' : '#222',
                          fontWeight: 700,
                          fontSize: 15,
                          boxShadow: selected ? '0 8px 24px 0 rgba(25,118,210,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: selected ? '2.5px solid #1976d2' : '2px solid #ededed',
                          transition: 'background 0.35s cubic-bezier(0.4,0,0.2,1), color 0.35s cubic-bezier(0.4,0,0.2,1), border 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                          position: 'relative',
                          width: 'auto',
                          maxWidth: 'none',
                          overflow: 'visible',
                          transform: selected ? 'scale(1.07)' : 'scale(1)',
                          '&:hover': {
                            boxShadow: selected ? '0 10px 32px 0 rgba(25,118,210,0.22)' : '0 6px 20px 0 rgba(0,0,0,0.12)',
                            border: selected ? '2.5px solid #1976d2' : '2px solid #1976d2',
                            bgcolor: '#1976d2',
                            color: '#fff',
                            transform: 'scale(1.09)',
                          },
                          '&:active': {
                            transform: 'scale(0.96)',
                          },
                        }}
                      >
                        {prod.name}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            {activeFilter === 'estado' && (
              <FormControl size="small" fullWidth sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select value={filter.estado} label="Estado" onChange={e => setFilter((f: any) => ({ ...f, estado: e.target.value }))} autoFocus>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Preparando">Preparando</MenuItem>
                  <MenuItem value="Entregado">Entregado</MenuItem>
                  <MenuItem value="Finalizado">Finalizado</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Card>
        {/* Timeline vertical */}
        <Box sx={{ position: 'relative', px: 2, py: 2, minHeight: 400 }}>
          {/* Línea vertical */}
          <Box sx={{ position: 'absolute', left: 38, top: 0, bottom: 0, width: 4, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, zIndex: 0 }} />
          {/* Pedidos */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
          {filteredOrdersWithProducts.slice(0, 8).map((o: any, idx: number) => (
            <Box key={o.orderId} sx={{ display: 'flex', alignItems: 'center', minHeight: 110 }}>
              {/* Círculo numerado con fondo blanco y borde según estado */}
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: '#fff',
                color: '#222',
                fontWeight: 'bold',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                position: 'relative',
                zIndex: 2,
                mr: 2,
                border: `5.5px solid ${o.estado === 'Entregado' ? '#4caf50' : o.estado === 'Preparando' ? '#ff9800' : o.estado === 'Finalizado' ? '#2196f3' : '#bdbdbd'}`,
                transition: 'border 0.2s',
              }}>{idx + 1}</Box>
              {/* Tarjeta de pedido */}
              <Box
                sx={{
                  flex: 1,
                  ml: 1,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: '#f7f7f7',
                  boxShadow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  minHeight: 90,
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                {/* Fila 1: ID de la orden + flecha */}
                <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 18, color: '#222' }}>Orden #{o.orderId}</Typography>
                  <ExpandMore
                    sx={{
                      transition: 'transform 0.3s',
                      transform: openIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: '#888',
                    }}
                  />
                </Box>
                {/* Fila 2: Estado de la orden y precio */}
                <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: estadoColor[o.estado] || '#bdbdbd', color: '#fff', fontWeight: 600, fontSize: 13, letterSpacing: 1, minWidth: 90, textAlign: 'center', display: 'inline-block' }}>{o.estado}</Box>
                  <Box sx={{
                    bgcolor: '#f2f2f2',
                    color: '#555',
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: 14,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}>
                    <span style={{ color: '#888', fontSize: 15, fontWeight: 500, marginRight: 2 }}>€</span>
                    <span style={{ color: '#222', fontWeight: 600 }}>{o.totalAmount?.toFixed(2) ?? '-'}</span>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 14, color: '#ffd600', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span style={{ fontSize: 16 }}>🕒</span> {o.createdAt ? toDate(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#222', ml: 1 }}>{o.createdAt ? toDate(o.createdAt).toLocaleDateString() : '-'}</Typography>
                </Box>
                {/* Productos desplegable con animación */}
                <Box
                  sx={{
                    maxHeight: openIdx === idx ? 500 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
                    opacity: openIdx === idx ? 1 : 0,
                  }}
                >
                  {openIdx === idx && (
                    <Box sx={{ fontSize: 14, color: '#222', mb: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[...(o.pizzas || []), ...(o.drinks || [])].map((p: any, i: number) => {
                        const isPizza = (o.pizzas || []).some((pz: any) => pz === p);
                        const color = isPizza ? '#d32f2f' : '#1976d2';
                        return (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <Typography sx={{ color: '#222', fontWeight: 500, fontSize: 16 }}>{p.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isPizza && Array.from({ length: p.quantity || 1 }).map((_, idx) => (
                                <span key={idx} style={{ fontSize: 22 }}>🍕</span>
                              ))}
                              {!isPizza && Array.from({ length: p.quantity || 1 }).map((_, idx) => (
                                <span key={idx} style={{ fontSize: 22, color: '#1976d2' }}>🥤</span>
                              ))}
                              <Box sx={{ ml: 1, bgcolor: '#444', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{p.quantity || 1}</Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {filteredOrders.length === 0 && <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', mt: 2 }}>Sin pedidos</Typography>}
        </Box>
      </Box>
    </Card>
  </Box>
  );
};

export default HistorialPedidos;
