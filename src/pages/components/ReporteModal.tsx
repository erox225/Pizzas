import React from "react";
import { Box, Dialog, DialogContent, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import { USE_MOCKS } from '../../config';
// mocks centralizados para demo en desarrollo; en prod se pueden derivar desde orders
import { pedidosTodas as mockTodas, pedidosPizzas as mockPizzas, pedidosBebidas as mockBebidas } from '../../data/mocks';
import { getOrdersNormalized } from '../../services/select';

interface Producto {
  nombre: string;
  cantidad: number;
}

interface Pedido {
  fecha: string;
  unidades: number;
  venta: number;
  productos: Producto[];
}

type TipoReporte = 'todas' | 'pizzas' | 'bebidas';

interface ReporteModalProps {
  open: boolean;
  onClose: () => void;
  tipoReporte: TipoReporte;
  setTipoReporte: (tipo: TipoReporte) => void;
  fechaInicio: string;
  setFechaInicio: (fecha: string) => void;
  fechaFin: string;
  setFechaFin: (fecha: string) => void;
  reporteGenerado: string | null;
  setReporteGenerado: (r: string | null) => void;
}

// Si USE_MOCKS=false, estos arrays quedan vacíos por ahora.
// Próximo paso: derivar filas reales desde Firestore (analytics) si lo necesitas.
const pedidosTodas: Pedido[] = USE_MOCKS ? mockTodas : [];
const pedidosPizzas: Pedido[] = USE_MOCKS ? mockPizzas : [];
const pedidosBebidas: Pedido[] = USE_MOCKS ? mockBebidas : [];

export default function ReporteModal({ open, onClose, tipoReporte, setTipoReporte, fechaInicio, setFechaInicio, fechaFin, setFechaFin, reporteGenerado, setReporteGenerado }: ReporteModalProps) {
  const [expanded, setExpanded] = React.useState<number | null>(null);
  const [rows, setRows] = React.useState<Pedido[]>([]);

  // Derivar filas desde mocks (dev) o desde Firestore (prod)
  React.useEffect(() => {
    if (USE_MOCKS) {
      let local = mockTodas;
      if (tipoReporte === 'pizzas') local = mockPizzas;
      if (tipoReporte === 'bebidas') local = mockBebidas;
      setRows(local.filter(r => r.fecha >= fechaInicio && r.fecha <= fechaFin));
      return;
    }
    // Producción: construir filas desde órdenes reales
    (async () => {
      const orders = await getOrdersNormalized();
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin);
      end.setHours(23,59,59,999);
      const map = new Map<string, Pedido>();
      for (const o of orders) {
        const created = (o as any).createdAt?.toDate ? (o as any).createdAt.toDate() : new Date((o as any).createdAt);
        if (!(created instanceof Date) || isNaN(created.getTime())) continue;
        if (created < start || created > end) continue;
        const dateKey = created.toISOString().slice(0,10);
        const entry = map.get(dateKey) || { fecha: dateKey, unidades: 0, venta: 0, productos: [] };
        const items = tipoReporte === 'pizzas' ? (o.pizzas || []) : tipoReporte === 'bebidas' ? (o.drinks || []) : [ ...(o.pizzas||[]), ...(o.drinks||[]) ];
        for (const it of items) {
          const qty = it.quantity || 0;
          const price = typeof it.pricePerUnit === 'number' ? it.pricePerUnit : 0;
          entry.unidades += qty;
          entry.venta += qty * price;
          const found = entry.productos.find(p => p.nombre === it.name);
          if (found) found.cantidad += qty; else entry.productos.push({ nombre: it.name, cantidad: qty });
        }
        map.set(dateKey, entry);
      }
      const list = Array.from(map.values()).sort((a,b) => a.fecha.localeCompare(b.fecha));
      setRows(list);
    })();
  }, [tipoReporte, fechaInicio, fechaFin, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
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
        <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
          Rango: {fechaInicio} → {fechaFin} · Tipo: {tipoReporte}
        </Typography>
        <Box sx={{ p: 0, background: '#f5f5f5', borderRadius: 2, minHeight: 160, maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#e3eafc', position: 'sticky', top: 0 }}>
                <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'right' }}>Unidades</th>
                <th style={{ padding: '8px 6px', fontWeight: 700, borderBottom: '1px solid #bbb', textAlign: 'right' }}>Venta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee' }}>{row.fecha}</td>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{row.unidades}</td>
                  <td style={{ padding: '7px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(row.venta)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: '#777' }}>Sin datos</td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
