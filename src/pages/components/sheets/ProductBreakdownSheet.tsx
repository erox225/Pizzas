import React, { useState, useRef, FC } from "react";
import { Box, Typography, TextField, InputAdornment, IconButton, Stack, Divider } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { format, parse, addDays, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface PizzaTipo { tipo: string; total: number; }
interface BebidaTipo { tipo: string; total: number; }
interface Props {
  currentWeekKey: string;
  productName: string;
  type: 'Pizzas' | 'Bebidas';
  pizzasPorSemana: Record<string, PizzaTipo[]>;
  bebidasPorSemana: Record<string, BebidaTipo[]>;
  pizzasPorDiaSemana: Record<string, { day: string; total: number }[]>;
  weeklyData: Record<string, { day: string; total: number }[]>;
  ventasSemanaActual: { day: string; total: number }[];
  sheetHeader: { bg: string; text: string };
}

const ProductBreakdownSheet: FC<Props> = (props) => {
  const { currentWeekKey, productName, type, pizzasPorSemana, bebidasPorSemana, pizzasPorDiaSemana, weeklyData, ventasSemanaActual, sheetHeader } = props;
  const [week, setWeek] = useState<string>(currentWeekKey);
  const weekInputRef = useRef<HTMLInputElement | null>(null);
  const pizzaPriceMap: Record<string, number> = { 'Margarita': 9, 'Diavola': 11, 'Cuatro Quesos': 12, 'Prosciutto': 12 };
  const drinkPriceMap: Record<string, number> = { 'Refresco': 2.5, 'Cerveza': 3, 'Agua': 1.5, 'Vino': 4 };
  const price = type === 'Pizzas' ? (pizzaPriceMap[productName] ?? 10) : (drinkPriceMap[productName] ?? 2);
  const totalSemanaProducto = (() => {
    if (type === 'Pizzas') {
      const arr = pizzasPorSemana[week] ?? [];
      const found = arr.find((p: any) => p.tipo === productName);
      return found?.total ?? 0;
    } else {
      const arr = bebidasPorSemana[week] ?? [];
      const found = arr.find((b: any) => b.tipo === productName);
      return found?.total ?? 0;
    }
  })();
  const basePorDia = (() => {
    if (type === 'Pizzas') {
      return (pizzasPorDiaSemana[week] ?? []).map((d: any) => ({ day: d.day, total: d.total }));
    } else {
      return (weeklyData[week] ?? ventasSemanaActual).map((d: any) => ({ day: d.day, total: d.total }));
    }
  })();
  const sumBase = basePorDia.reduce((acc: number, d: any) => acc + (d.total || 0), 0) || 1;
  const proporciones = basePorDia.map((d: any) => ({ day: d.day, p: (d.total || 0) / sumBase }));
  const unidadesPorDia = proporciones.map((d: any) => ({
    day: d.day,
    units: Math.round(d.p * totalSemanaProducto)
  }));
  const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const dineroPorDia = unidadesPorDia.map((d: any) => ({ day: d.day, money: d.units * price }));
  let formattedWeekLabel = week;
  try {
    const mondayTmp = parse(week + '-1', "RRRR-'W'II-i", new Date());
    const monthTmp = format(mondayTmp, 'LLLL', { locale: es });
    const monthCapTmp = monthTmp.charAt(0).toUpperCase() + monthTmp.slice(1);
    const weekNumTmp = getWeekOfMonth(mondayTmp, { locale: es, weekStartsOn: 1 });
    formattedWeekLabel = `${monthCapTmp}, Semana ${weekNumTmp}`;
  } catch {}
  const totalUnidades = unidadesPorDia.reduce((acc: number, d: any) => acc + d.units, 0);
  const totalDinero = dineroPorDia.reduce((acc: number, d: any) => acc + d.money, 0);
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1, position: 'relative' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Semana</Typography>
        <TextField
          value={formattedWeekLabel}
          size="small"
          fullWidth
          inputProps={{ readOnly: true }}
          sx={{ '& input': { fontFamily: '"Comic Sans MS", "Roboto Slab", cursive', fontWeight: 700, letterSpacing: 0.3 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Abrir selector de semana"
                  onClick={() => {
                    const el = weekInputRef.current;
                    if (!el) return;
                    try { (el as any).showPicker ? (el as any).showPicker() : el.click(); } catch { el.click(); }
                    el.focus();
                  }}
                  size="small"
                  sx={{ color: sheetHeader.text }}
                >
                  <CalendarMonthIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <input
          type="week"
          value={week}
          onChange={(e) => setWeek((e.target as HTMLInputElement).value)}
          ref={weekInputRef}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
          aria-label="Seleccionar semana"
        />
      </Box>
      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mt: 2,mb:1, textTransform: 'uppercase'}}>
        Ventas de la semana
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, py: 0.5, mb: 1, borderRadius: 1, background: '#f3f4f6', border: '1px solid #0001' }}>
    <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 42, textTransform: 'uppercase' }}>Día</Typography>
    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Unidades</Typography>
    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Venta</Typography>
      </Box>
      <Stack spacing={1}>
        {unidadesPorDia.map((d: any, idx: number) => {
          const m = dineroPorDia[idx]?.money ?? 0;
          return (
            <Box
              key={d.day}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                background: idx % 2 === 0 ? '#fff' : '#e6f6ff',
                border: '1px solid #0001',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 42 }}>{d.day}</Typography>
              <Typography variant="body2" sx={{ color: '#0f766e' }}>{d.units} uds</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>{eur.format(m)}</Typography>
            </Box>
          );
        })}
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Información de la semana
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ p: 1.5, background: '#f1f5f9', borderRadius: 2, border: '1px solid #0001', textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: '#475569', fontWeight: 700, fontSize: 20 }}>Ventas totales</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{totalUnidades} uds</Typography>
        </Box>
        <Box sx={{ p: 1.5, background: '#fff7ed', borderRadius: 2, border: '1px solid #0001', textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ color: '#b45309', fontWeight: 700, fontSize: 20 }}>Ingresos</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{eur.format(totalDinero)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductBreakdownSheet;
