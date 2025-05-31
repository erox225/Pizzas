import React from "react";
import { Box, Card, Typography, Drawer, IconButton, Divider, TextField, InputAdornment, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, InputLabel } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import PizzaSalesChart from "./components/PizzaSalesChart";
import PizzaSalesMobileList from "./components/PizzaSalesMobileList";
import WeeklySalesChart from "./components/WeeklySalesChart";
import CategoryBarChart from "./components/CategoryBarChart";
import HourlySalesChart from "./components/HourlySalesChart";
import DashCard from "./components/DashCard";
import { format, addWeeks, parse, addDays, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, Tab } from "@mui/material";
// Reemplazamos iconos MUI por emojis estilo cartoon en los tabs
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useState, useRef } from "react";
import VentasTotalesSheet from './components/sheets/VentasTotalesSheet';
import BebidasVendidasSheet from './components/sheets/BebidasVendidasSheet';
import PizzasVendidasSheet from './components/sheets/PizzasVendidasSheet';
import MomentosPicosSheet from './components/sheets/MomentosPicosSheet';
import ProductBreakdownSheet from './components/sheets/ProductBreakdownSheet';
import ProductGrid from './components/ProductGrid';
import ProductCard from './components/ProductCard';
import StickyProductListHeader from './components/StickyProductListHeader';
// Fuentes de datos: mocks vs Firestore (según USE_MOCKS en src/config.ts)
import {
  finanzas as mFinanzas,
  operaciones as mOperaciones,
  canales as mCanales,
  diasHoras as mDiasHoras,
  pizzasVendidas as mPizzasVendidas,
  ventasSemanaActual as mVentasSemanaActual,
  weeklyData as mWeeklyData,
  bebidasPorSemana as mBebidasPorSemana,
  pizzasPorSemana as mPizzasPorSemana,
  ventasPorHora as mVentasPorHora,
  pizzasPorDiaSemana as mPizzasPorDiaSemana,
  currentWeekKey as mCurrentWeekKey,
  pizzaPriceMap,
  drinkPriceMap
} from '../data/mocks';
import { USE_MOCKS } from '../config';
// Servicios para derivar datasets a partir de órdenes reales
import { getOrdersNormalized } from '../services/select';
import { buildDashboardData } from '../services/analytics';

// Mocks movidos a src/data/mocks.ts

interface VentaPorTipo {
  total: number;
  // otros campos si los hay
}

interface ResumenDiaProps {
  ventasPorTipo: VentaPorTipo[];
  horasPico: number[];
  pizzaRapida: string | null;
}

function ResumenDia({ ventasPorTipo, horasPico, pizzaRapida }: ResumenDiaProps) {
  // Estado para el modal de reporte
  const [openReporte, setOpenReporte] = useState(false);
  const [tipoReporte, setTipoReporte] = useState<'todas' | 'pizzas' | 'bebidas'>('todas');
  const [reporteGenerado, setReporteGenerado] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState(() => {
    // Por defecto, inicio de la semana
    const hoy = new Date();
    const primerDia = new Date(hoy);
    primerDia.setDate(hoy.getDate() - hoy.getDay());
    return primerDia.toISOString().slice(0, 10);
  });
  const [fechaFin, setFechaFin] = useState(() => {
    // Por defecto, la fecha actual
    const hoy = new Date();
    return hoy.toISOString().slice(0, 10);
  });
  const infoReporte = {
    todas: 'Resumen de todas las ventas: ...',
    pizzas: 'Ventas de pizzas: ...',
    bebidas: 'Ventas de bebidas: ...',
  };
  const handleOpenReporte = () => setOpenReporte(true);
  const handleCloseReporte = () => { setReporteGenerado(null); setOpenReporte(false); };
  const handleGenerar = () => setReporteGenerado(infoReporte[tipoReporte]);
  const [sheet, setSheet] = useState<{ open: boolean; title: string; content: React.ReactNode }>({
    open: false,
    title: "",
    content: null,
  });
  const [productFilter, setProductFilter] = useState<string>('Todos');
  const [filterType, setFilterType] = useState<'Pizzas' | 'Bebidas'>('Pizzas');

  const openSheet = (title: string, content: React.ReactNode) => {
    setSheet({ open: true, title, content });
  };
  const closeSheet = () => setSheet(s => ({ ...s, open: false }));
  const sheetHeader = { bg: '#ffe5e9', text: 'black' };

  // ds = "data sets" para el dashboard. Por defecto, carga los mocks.
  // Si USE_MOCKS=false, en el efecto de montaje se reemplaza con agregados
  // calculados a partir de Firestore (manteniendo la misma forma de datos
  // esperada por los componentes de presentación).
  const [ds, setDs] = useState(() => ({
    currentWeekKey: mCurrentWeekKey,
    weeklyData: mWeeklyData,
    bebidasPorSemana: mBebidasPorSemana,
    pizzasPorSemana: mPizzasPorSemana,
    ventasPorHora: mVentasPorHora,
    pizzasPorDiaSemana: mPizzasPorDiaSemana,
    ventasSemanaActual: mVentasSemanaActual,
  }));
  const [finanzas] = useState(mFinanzas);
  const [operaciones] = useState(mOperaciones);
  const [canales] = useState(mCanales);
  const [diasHoras] = useState(mDiasHoras);
  const [pizzasVendidas] = useState(mPizzasVendidas);

  // Si no usamos mocks, obtener órdenes normalizadas y construir agregados
  React.useEffect(() => {
    if (USE_MOCKS) return;
    getOrdersNormalized().then(orders => {
      const built = buildDashboardData(orders);
      setDs(built);
    });
  }, []);
  return (
    <Box sx={{ mb: 1, minHeight: '100vh', width: '100vw', position: 'relative' }}>
      {/* Caja sticky que contiene tabs y contenido, oculta el nav rojo al hacer scroll */}
      <Box sx={{ top: 0, zIndex: 1200, background: '#fdf6e3'}}>
        {/* Layout unificado: grid de dos columnas en todas las secciones */}
        <Box sx={{ mb: 0.5, px: '12px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, pt: '10px' }}>
            <Typography
              variant="h6"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'black',
                mb: 0,
                pr: 1
              }}
            >
              FINANZAS DEL DÍA
            </Typography>
            <IconButton
              onClick={handleOpenReporte}
              sx={{
                background: '#ededed',
                borderRadius: 2,
                ml: 1,
                boxShadow: 1,
                transition: 'background 0.2s',
                '&:hover': { background: '#d1d1d1' },
                p: 1.1
              }}
              aria-label="Generar reporte"
            >
              <DescriptionIcon sx={{ color: '#333', fontSize: 26 }} />
            </IconButton>
          </Box>
          {/* Modal de reporte con estilo personalizado */}
          <Dialog open={openReporte} onClose={handleCloseReporte} maxWidth="xs" fullWidth PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 8,
              p: 0,
            }
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              bgcolor: '#1976d2',
              color: '#fff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              px: 2.5,
              py: 2.2,
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 44 }}>
                <DescriptionIcon sx={{ fontSize: 36 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 0.5, lineHeight: 1.1 }}>
                  Generar Reporte
                </Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 400, mt: 0.5, opacity: 0.95, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '100%' }}>
                  {reporteGenerado
                    ? `Último reporte generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                    : 'No se ha generado ningún reporte aún.'}
                </Typography>
              </Box>
            </Box>
            <DialogContent sx={{ pt: 2.5, pb: 1.5, px: 3 }}>
              <Box sx={{ mt: 1, mb: 2 }}>
                <InputLabel id="tipo-reporte-label" sx={{ fontWeight: 700, mb: 1 }}>Tipo de reporte</InputLabel>
                <Select
                  labelId="tipo-reporte-label"
                  value={tipoReporte}
                  onChange={e => setTipoReporte(e.target.value as 'todas' | 'pizzas' | 'bebidas')}
                  fullWidth
                  sx={{ mb: 2, fontWeight: 600, fontSize: 16 }}
                >
                  <MenuItem value="todas">Todas las ventas</MenuItem>
                  <MenuItem value="pizzas">Pizzas</MenuItem>
                  <MenuItem value="bebidas">Bebidas</MenuItem>
                </Select>
                {/* Fila de fechas */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center', width: '100%' }}>
                  <Box sx={{ minWidth: 0, width: '48%', maxWidth: 140 }}>
                    <InputLabel shrink sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>Fecha inicio</InputLabel>
                    <Paper
                      elevation={1}
                      sx={{
                        borderRadius: 3,
                        background: '#1E1E1E',
                        color: '#fff',
                        margin: '16px 0 0 0',
                        paddingTop: '24px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingBottom: '4px', // <--- padding inferior ajustado
                      }}
                    >
                      {/* ...contenido del Paper... */}
                    </Paper>
                  </Box>
                  <Box sx={{ minWidth: 0, width: '48%', maxWidth: 140 }}>
                    <InputLabel shrink sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>Fecha fin</InputLabel>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={e => setFechaFin(e.target.value)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: '7px 8px',
                        borderRadius: 6,
                        border: '1px solid #bbb',
                        fontSize: 15,
                        fontFamily: 'inherit',
                        outline: 'none',
                        marginTop: 2,
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ p: 0, background: '#f5f5f5', borderRadius: 2, minHeight: 160, maxHeight: 300, overflowY: 'auto', mt: 1 }}>
                  {(() => {
                    const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
                    // Datos mock para demo
                    const pedidosTodas = [
                      { fecha: '2025-09-10', unidades: 12, venta: 240, productos: [{ nombre: 'Margarita', cantidad: 4 }, { nombre: 'Coca-Cola', cantidad: 2 }] },
                      { fecha: '2025-09-11', unidades: 15, venta: 300, productos: [{ nombre: 'Diavola', cantidad: 5 }, { nombre: 'Sprite', cantidad: 3 }] },
                      { fecha: '2025-09-12', unidades: 10, venta: 200, productos: [{ nombre: 'Cuatro Quesos', cantidad: 3 }, { nombre: 'Agua', cantidad: 2 }] },
                      { fecha: '2025-09-13', unidades: 18, venta: 360, productos: [{ nombre: 'Prosciutto', cantidad: 6 }, { nombre: 'Fanta', cantidad: 2 }] },
                      { fecha: '2025-09-14', unidades: 9, venta: 180, productos: [{ nombre: 'Margarita', cantidad: 2 }, { nombre: 'Cerveza', cantidad: 1 }] },
                    ];
                    const pedidosPizzas = [
                      { fecha: '2025-09-10', unidades: 8, venta: 160, productos: [{ nombre: 'Margarita', cantidad: 4 }, { nombre: 'Diavola', cantidad: 4 }] },
                      { fecha: '2025-09-11', unidades: 10, venta: 200, productos: [{ nombre: 'Cuatro Quesos', cantidad: 5 }, { nombre: 'Prosciutto', cantidad: 5 }] },
                      { fecha: '2025-09-12', unidades: 7, venta: 140, productos: [{ nombre: 'Margarita', cantidad: 3 }, { nombre: 'Diavola', cantidad: 4 }] },
                      { fecha: '2025-09-13', unidades: 12, venta: 240, productos: [{ nombre: 'Cuatro Quesos', cantidad: 6 }, { nombre: 'Prosciutto', cantidad: 6 }] },
                      { fecha: '2025-09-14', unidades: 5, venta: 100, productos: [{ nombre: 'Margarita', cantidad: 2 }, { nombre: 'Diavola', cantidad: 3 }] },
                    ];
                    const pedidosBebidas = [
                      { fecha: '2025-09-10', unidades: 4, venta: 80, productos: [{ nombre: 'Coca-Cola', cantidad: 2 }, { nombre: 'Sprite', cantidad: 2 }] },
                      { fecha: '2025-09-11', unidades: 5, venta: 100, productos: [{ nombre: 'Agua', cantidad: 3 }, { nombre: 'Fanta', cantidad: 2 }] },
                      { fecha: '2025-09-12', unidades: 3, venta: 60, productos: [{ nombre: 'Cerveza', cantidad: 2 }, { nombre: 'Vino', cantidad: 1 }] },
                      { fecha: '2025-09-13', unidades: 6, venta: 120, productos: [{ nombre: 'Coca-Cola', cantidad: 3 }, { nombre: 'Agua', cantidad: 3 }] },
                      { fecha: '2025-09-14', unidades: 4, venta: 80, productos: [{ nombre: 'Sprite', cantidad: 2 }, { nombre: 'Fanta', cantidad: 2 }] },
                    ];

                    let rows = pedidosTodas;
                    if (tipoReporte === 'pizzas') rows = pedidosPizzas;
                    if (tipoReporte === 'bebidas') rows = pedidosBebidas;

                    // Filtrar por rango de fechas
                    const start = fechaInicio;
                    const end = fechaFin;
                    rows = rows.filter(row => row.fecha >= start && row.fecha <= end);

                    // Componente tabla con expand/collapse
                    const [expanded, setExpanded] = React.useState<number | null>(null);
                    return (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                        <thead>
                          <tr style={{ background: '#e3eafc', position: 'sticky', top: 0 }}>
                            <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'right' }}>Unidades</th>
                            <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'right' }}>Venta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => (
                            <React.Fragment key={idx}>
                              <tr
                                style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', cursor: 'pointer' }}
                                onClick={() => setExpanded(expanded === idx ? null : idx)}
                              >
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee' }}>{row.fecha}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{row.unidades}</td>
                                <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right', color: '#1db954', fontWeight: 700 }}>{row.venta} €</td>
                              </tr>
                              <tr style={{ height: 0, padding: 0 }}>
                                <td colSpan={3} style={{ border: 0, padding: 0, background: 'transparent' }}>
                                  <div
                                    style={{
                                      maxHeight: expanded === idx ? 120 : 0,
                                      opacity: expanded === idx ? 1 : 0,
                                      overflow: 'hidden',
                                      transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1)',
                                      background: '#eaf6e8',
                                      borderBottom: expanded === idx ? '1px solid #d0e6d5' : 'none',
                                      padding: expanded === idx ? '8px 12px' : '0 12px',
                                    }}
                                  >
                                    {expanded === idx && (
                                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 0, background: 'transparent' }}>
                                        <thead>
                                          <tr>
                                            <th style={{ textAlign: 'left', fontWeight: 600, fontSize: 14, padding: '4px 6px', background: 'transparent', borderBottom: '1px solid #d0e6d5' }}>Cantidad x Producto</th>
                                            <th style={{ textAlign: 'right', fontWeight: 600, fontSize: 14, padding: '4px 6px', background: 'transparent', borderBottom: '1px solid #d0e6d5' }}>Venta</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {row.productos.map((prod, i) => {
                                            // Asumimos un precio unitario mock para demo
                                            let precioUnitario = 20;
                                            if (prod.nombre.toLowerCase().includes('coca') || prod.nombre.toLowerCase().includes('fanta') || prod.nombre.toLowerCase().includes('sprite') || prod.nombre.toLowerCase().includes('agua') || prod.nombre.toLowerCase().includes('cerveza') || prod.nombre.toLowerCase().includes('vino')) {
                                              precioUnitario = 5;
                                            }
                                            const totalVenta = prod.cantidad * precioUnitario;
                                            return (
                                              <tr key={i}>
                                                <td style={{ fontSize: 15, padding: '4px 6px', borderBottom: '1px solid #e0e0e0' }}>
                                                  <b>{prod.cantidad}</b> x {prod.nombre}
                                                </td>
                                                  <td style={{ fontSize: 15, padding: '4px 6px', borderBottom: '1px solid #e0e0e0', textAlign: 'right', color: '#1db954', fontWeight: 700 }}>
                                                    {totalVenta} €
                                                  </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2.5, pt: 1 }}>
              <Button onClick={handleCloseReporte} sx={{ color: '#1976d2', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', px: 2.5 }}>
                Cancelar
              </Button>
              <Button onClick={handleGenerar} variant="contained" sx={{ bgcolor: '#388e3c', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', px: 2.5, '&:hover': { bgcolor: '#2e7d32' } }}>
                Generar
              </Button>
            </DialogActions>
          </Dialog>
          {/* Definir color por tab */}
          {(() => {
            return (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <>
                  <DashCard
                    solid
                    solidBg="#2e7d32"
                    solidColor="#fff"
                    title="Ventas totales"
                    icon={<span>💰</span>}
                    mainValue={finanzas.ingresos - finanzas.costes}
                    mainUnit="€"
                    caption="Informes del día actual"
                    onClick={() => openSheet('Ventas totales', (
                      <VentasTotalesSheet
                        currentWeekKey={ds.currentWeekKey}
                        weeklyData={ds.weeklyMockData}
                        finanzas={finanzas}
                        sheetHeader={sheetHeader}
                      />
                    ))}
                  />

                  <DashCard
                    solid
                    solidBg="#ef5350"
                    solidColor="#fff"
                    title="Pizzas vendidas"
                    icon={<span>🍕</span>}
                    mainValue={finanzas.puntoEquilibrio}
                    mainUnit={<span style={{ fontSize: 16, marginLeft: 6, color: '#fff' }}>uds</span>}
                    caption="Informes del día actual"
                    onClick={() => openSheet('Pizzas vendidas', (
                      <PizzasVendidasSheet
                        currentWeekKey={ds.currentWeekKey}
                        pizzasPorSemana={ds.mockPizzasPorSemana}
                        pizzasPorDiaSemana={ds.mockPizzasPorDiaSemana}
                        sheetHeader={sheetHeader}
                      />
                    ))}
                  />

                  <DashCard
                    solid
                    solidBg="#1976d2"
                    solidColor="#fff"
                    title="Bebidas vendidas"
                    icon={<span style={{ background: '#1976d2', borderRadius: '50%', padding: '4px' }}>🥤</span>}
                    mainValue={canales.reduce((acc, c) => acc + (c.pedidos ?? 0), 0)}
                    mainUnit={<span style={{ fontSize: 16, marginLeft: 6, color: '#fff' }}>uds</span>}
                    caption="Informes del día actual"
                    onClick={() => openSheet('Bebidas vendidas', (
                      <BebidasVendidasSheet
                        currentWeekKey={ds.currentWeekKey}
                        bebidasPorSemana={ds.bebidasPorSemana}
                        sheetHeader={sheetHeader}
                      />
                    ))}
                  />

                  <DashCard
                    solid
                    solidBg="#f59e0b"
                    solidColor="#fff"
                    title="Momentos picos"
                    icon={<span>⏱️</span>}
                    mainValue={operaciones.horaSaturacion}
                    caption="Informes del día actual"
                    onClick={() => openSheet('Momentos picos', (
                      <MomentosPicosSheet
                        ventasPorHora={ds.ventasPorHora}
                      />
                    ))}
                  />
                </>
              </Box>
            );
          })()}
        </Box>
      </Box>



      {/* Bottom sheet */}
      <Drawer
        anchor="bottom"
        open={sheet.open}
        onClose={closeSheet}
        PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, pb: 2, backgroundColor: '#fffcf7' } }}
      >
        {(() => {
          // Detectar si es un bottom sheet de producto o ventas totales
          let isVentasTotales = false;
          let isBebidasVendidas = false;
          let isPizzasVendidas = false;
          let isMomentosPicos = false;
          let isProductBreakdown = false;
          let productName = '';
          let productType: 'Pizzas' | 'Bebidas' | null = null;
          let icon = '';
          let bg = sheetHeader.bg;
          let text = sheetHeader.text;
          if (sheet.title && typeof sheet.title === 'string') {
            if (sheet.title.toLowerCase().includes('ventas totales')) {
              isVentasTotales = true;
              icon = '💸';
              text = '#237a3b';
              bg = '#e6f9ed';
            }
            if (sheet.title.toLowerCase().includes('bebidas vendidas')) {
              isBebidasVendidas = true;
              icon = '🍹';
              text = '#1976d2';
              bg = '#e3f0ff';
            }
            if (sheet.title.toLowerCase().includes('pizzas vendidas')) {
              isPizzasVendidas = true;
              icon = '🍕';
              text = '#bf1e2d';
              bg = '#ffe5e9';
            }
            if (sheet.title.toLowerCase().includes('momentos picos')) {
              isMomentosPicos = true;
              icon = '⏱️';
              text = '#222';
              bg = '#f5f5f5';
            }
            // Detectar breakdown de producto
            const pizzaNames = ['MARGHERITA', 'Diavola', 'GOLOSA', 'Prosciutto'];
            const bebidaNames = ['Refresco', 'Cerveza', 'Agua', 'Vino'];
            for (const n of pizzaNames) {
              if (sheet.title.toLowerCase().includes(n.toLowerCase())) {
                isProductBreakdown = true;
                productType = 'Pizzas';
                productName = n;
                icon = '🍕';
                text = '#bf1e2d';
                bg = '#ffe5e9';
                break;
              }
            }
            for (const n of bebidaNames) {
              if (sheet.title.toLowerCase().includes(n.toLowerCase())) {
                isProductBreakdown = true;
                productType = 'Bebidas';
                productName = n;
                icon = '🍹';
                text = '#1976d2';
                bg = '#e3f0ff';
                break;
              }
            }
          }
          let content = null;
          if (isVentasTotales) content = <VentasTotalesSheet currentWeekKey={ds.currentWeekKey} weeklyData={ds.weeklyData} finanzas={finanzas} sheetHeader={sheetHeader} />;
          else if (isBebidasVendidas) content = <BebidasVendidasSheet currentWeekKey={ds.currentWeekKey} bebidasPorSemana={ds.bebidasPorSemana} sheetHeader={sheetHeader} />;
          else if (isPizzasVendidas) content = <PizzasVendidasSheet currentWeekKey={ds.currentWeekKey} pizzasPorSemana={ds.pizzasPorSemana} pizzasPorDiaSemana={ds.pizzasPorDiaSemana} sheetHeader={sheetHeader} />;
          else if (isMomentosPicos) content = <MomentosPicosSheet ventasPorHora={ds.ventasPorHora} />;
          else if (isProductBreakdown && productType && productName) content = <ProductBreakdownSheet currentWeekKey={ds.currentWeekKey} productName={productName} type={productType} pizzasPorSemana={ds.pizzasPorSemana} bebidasPorSemana={ds.bebidasPorSemana} pizzasPorDiaSemana={ds.pizzasPorDiaSemana} weeklyData={ds.weeklyData} ventasSemanaActual={ds.ventasSemanaActual} sheetHeader={sheetHeader} />;
          return (
            <>
              <Box sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: bg,
                borderRadius: '16px 16px 0 0',
                borderBottom: '1px solid #eee',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isVentasTotales ? 0.5 : 1 }}>
                  <Box component="span" sx={{ fontSize: 22, mr: isVentasTotales ? 0.5 : 1 }}>{icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: text, textTransform: (isVentasTotales || isBebidasVendidas) ? 'uppercase' : undefined, letterSpacing: (isVentasTotales || isBebidasVendidas) ? 1 : undefined }}>
                    {(isVentasTotales || isBebidasVendidas) && typeof sheet.title === 'string' ? sheet.title.toUpperCase() : sheet.title}
                  </Typography>
                </Box>
                <IconButton onClick={closeSheet} aria-label="Cerrar" sx={{ color: text }}>
                  <span style={{ fontSize: 18, lineHeight: 1, color: 'inherit' }}>✕</span>
                </IconButton>
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                {content}
              </Box>
            </>
          );
        })()}
      </Drawer>

      {/* Gráfica y lista de ventas */}
      {(() => {
        const ventasChart: any = ventasPorTipo.map((v: any) => ({
          name: v.name ?? '',
          breakdown: v.breakdown ?? [],
          total: v.total ?? 0
        }));
        const bebidasChart: any = [
          { name: 'Refresco', breakdown: [], total: 120 },
          { name: 'Cerveza', breakdown: [], total: 95 },
          { name: 'Agua', breakdown: [], total: 80 },
          { name: 'Vino', breakdown: [], total: 30 },
        ];
        // price maps importados desde mocks
        const ventasChartAug = ventasChart.map((p: any) => ({
          ...p,
          price: pizzaPriceMap[p.name] ?? 10,
          baked: (p.baked ?? p.horneadas ?? (p.total + Math.max(5, Math.round(p.total * 0.2))))
        }));
        const bebidasChartAug = bebidasChart.map((b: any) => ({
          ...b,
          price: drinkPriceMap[b.name] ?? 2
        }));
        const namesByType = {
          Pizzas: Array.from(new Set(ventasChartAug.map((v: any) => v.name))).filter(Boolean),
          Bebidas: bebidasChartAug.map((b:any) => b.name),
        } as const;
        const baseChart = filterType === 'Pizzas' ? ventasChartAug : bebidasChartAug;
        const filteredChart = baseChart;
        return <>
          <StickyProductListHeader
            isSheetOpen={sheet.open}
            filterType={filterType}
            setFilterType={setFilterType}
            setProductFilter={setProductFilter}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {filterType === 'Pizzas' ? '🍕 Ventas por pizzas (hoy)' : '🥤 Ventas por bebidas (hoy)'}
              </Typography>
              <ProductGrid>
                {filteredChart.map((item: any) => (
                  <ProductCard
                    key={item.name}
                    name={item.name}
                    total={item.total}
                    price={item.price}
                    color={filterType === 'Pizzas' ? '#bf1e2d' : '#1976d2'}
                    onClick={() => openSheet(
                      `${item.name} — detalle semanal`,
                      (<ProductBreakdownSheet
                        productName={item.name}
                        type={filterType === 'Pizzas' ? 'Pizzas' : 'Bebidas'}
                        currentWeekKey={ds.currentWeekKey}
                        pizzasPorSemana={ds.pizzasPorSemana}
                        bebidasPorSemana={ds.bebidasPorSemana}
                        pizzasPorDiaSemana={ds.pizzasPorDiaSemana}
                        weeklyData={ds.weeklyData}
                        ventasSemanaActual={ds.ventasSemanaActual}
                        sheetHeader={sheetHeader}
                      />)
                    )}
                  />
                ))}
              </ProductGrid>
            </Card>
          </Box>
          <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
            <PizzaSalesMobileList
              data={filteredChart}
              onItemPress={(name: string) =>
                openSheet(
                  ` ${name}`,
                  (<ProductBreakdownSheet
                    productName={name}
                    type={filterType === 'Pizzas' ? 'Pizzas' : 'Bebidas'}
                    currentWeekKey={ds.currentWeekKey}
                    pizzasPorSemana={ds.pizzasPorSemana}
                    bebidasPorSemana={ds.bebidasPorSemana}
                    pizzasPorDiaSemana={ds.pizzasPorDiaSemana}
                    weeklyData={ds.weeklyData}
                    ventasSemanaActual={ds.ventasSemanaActual}
                    sheetHeader={sheetHeader}
                  />)
                )
              }
            />
          </Box>
        </>;
      })()}
    </Box>
  );
}
export default ResumenDia;
