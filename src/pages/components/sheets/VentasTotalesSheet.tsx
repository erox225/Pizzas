import React, { useState, useRef, FC } from "react";
import { Box, Typography, Divider, TextField, InputAdornment, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WeeklySalesChart from "../WeeklySalesChart";
import { format, parse, addDays, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  currentWeekKey: string;
  weeklyData: Record<string, { day: string; total: number }[]>;
  finanzas: {
    ingresos: number;
    costes: number;
    gastosFijos: number;
    gastosVariables: number;
    margenPorUnidad: number;
    puntoEquilibrio: number;
    costePorPizza: number;
  };
  sheetHeader: { bg: string; text: string };
}

const VentasTotalesSheet: FC<Props> = (props) => {
  const { currentWeekKey, weeklyData, finanzas, sheetHeader } = props;
  const [week, setWeek] = useState<string>(currentWeekKey);
  const weekInputRef = useRef<HTMLInputElement | null>(null);
  const weekData = weeklyData[week] ?? weeklyData[currentWeekKey];
  let formattedWeekLabel = week;
  try {
    const mondayTmp = parse(week + '-1', "RRRR-'W'II-i", new Date());
    const monthTmp = format(mondayTmp, 'LLLL', { locale: es });
    const monthCapTmp = monthTmp.charAt(0).toUpperCase() + monthTmp.slice(1);
    const weekNumTmp = getWeekOfMonth(mondayTmp, { locale: es, weekStartsOn: 1 });
    formattedWeekLabel = `${monthCapTmp}, Semana ${weekNumTmp}`;
  } catch {}
  return (
    <Box>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1, position: 'relative', cursor: 'pointer' }}
        onClick={() => {
          const el = weekInputRef.current;
          if (!el) return;
          try { (el as any).showPicker ? (el as any).showPicker() : el.click(); } catch { el.click(); }
          el.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const el = weekInputRef.current;
            if (!el) return;
            try { (el as any).showPicker ? (el as any).showPicker() : el.click(); } catch { el.click(); }
            el.focus();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Semana</Typography>
        <TextField
          value={formattedWeekLabel}
          size="small"
          fullWidth
          inputProps={{ readOnly: true }}
          sx={{
            '& input': {
              fontFamily: '"Comic Sans MS", "Roboto Slab", cursive',
              fontWeight: 700,
              letterSpacing: 0.3,
            },
          }}
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
      {/* El input ya muestra "Mes, Semana N" */}
      {(() => {
        try {
          const monday = parse(week + '-1', "RRRR-'W'II-i", new Date());
          const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
          const label = days
            .map(d => format(d, 'eee dd', { locale: es }).replace(/\./g, ''))
            .join(', ');
          return (
            <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 1 }}>
              {label}
            </Typography>
          );
        } catch {
          return null;
        }
      })()}
      <Typography variant="subtitle1" align="center" sx={{mt:'20px', fontWeight: 700, mb: 1, textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Ventas totales de la semana
      </Typography>
      {(() => {
        let highlightLabel: string | undefined = undefined;
        try {
          const monday = parse(week + '-1', "RRRR-'W'II-i", new Date());
          const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
          const today = new Date();
          today.setHours(0,0,0,0);
          for (let i = 0; i < 7; i++) {
            const d = addDays(monday, i);
            d.setHours(0,0,0,0);
            if (d.getTime() === today.getTime()) {
              highlightLabel = labels[i];
              break;
            }
          }
        } catch {}
        return (
          <Box sx={{ minHeight: 240, maxHeight: 400, overflowY: 'auto'}}>
            <WeeklySalesChart data={weekData} color="#bf1e2d" highlightDay={highlightLabel} />
          </Box>
        );
      })()}
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Información de la semana
      </Typography>
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
        {(() => {
          try {
            const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
            const ratio = finanzas.ingresos > 0 ? (finanzas.ingresos - finanzas.costes) / finanzas.ingresos : 0.25;
            const weeklySales = weekData.reduce((acc, d) => acc + (d.total || 0), 0);
            const weeklyBenefit = Math.round(weeklySales * ratio);
            return (
              <Box sx={{ p: 2, background: '#fff7e0', borderRadius: 2, border: '1px solid #0001' }}>
                <Typography variant="subtitle2" sx={{ color: '#b26a00', fontWeight: 700, mb: 0.5 }}>
                  Beneficio total de la semana
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {eur.format(weeklyBenefit)}
                </Typography>
              </Box>
            );
          } catch {
            return null;
          }
        })()}
        {(() => {
          try {
            const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
            const selectedMonday = parse(week + '-1', "RRRR-'W'II-i", new Date());
            const selMonth = selectedMonday.getMonth();
            const selYear = selectedMonday.getFullYear();
            const ratio = finanzas.ingresos > 0 ? (finanzas.ingresos - finanzas.costes) / finanzas.ingresos : 0.25;
            let monthlySales = 0;
            Object.entries(weeklyData).forEach(([key, data]) => {
              const monday = parse(key + '-1', "RRRR-'W'II-i", new Date());
              for (let i = 0; i < data.length; i++) {
                const d = addDays(monday, i);
                if (d.getMonth() === selMonth && d.getFullYear() === selYear) {
                  monthlySales += data[i].total;
                }
              }
            });
            const monthlyBenefit = Math.round(monthlySales * ratio);
            const monthName = format(selectedMonday, 'LLLL', { locale: es });
            const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            return (
              <Box sx={{ p: 2, background: '#43a047', borderRadius: 2, border: '1px solid #0001' }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                  Beneficio total del mes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                  {eur.format(monthlyBenefit)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#e0f2f1' }}>
                  Mes: {monthCap}
                </Typography>
              </Box>
            );
          } catch {
            return null;
          }
        })()}
      </Box>
    </Box>
  );
};

export default VentasTotalesSheet;
