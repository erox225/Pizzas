import React, { useState, useRef, FC } from "react";
import { Box, Typography, TextField, InputAdornment, IconButton, Divider } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryBarChart from "../CategoryBarChart";
import { format, parse, addDays, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface BebidaTipo { tipo: string; total: number; }
interface Props {
  currentWeekKey: string;
  bebidasPorSemana: Record<string, BebidaTipo[]>;
  sheetHeader: { bg: string; text: string };
}

const BebidasVendidasSheet: FC<Props> = ({ currentWeekKey, bebidasPorSemana, sheetHeader }) => {
  const [week, setWeek] = useState<string>(currentWeekKey);
  const weekInputRef = useRef<HTMLInputElement | null>(null);
  const data = bebidasPorSemana[week] ?? bebidasPorSemana[currentWeekKey] ?? [];
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
      {/* Leyenda de días seleccionados */}
      {(() => {
        try {
          const monday = parse(week + '-1', "RRRR-'W'II-i", new Date());
          const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
          const label = days.map(d => format(d, 'eee dd', { locale: es }).replace(/\./g, '')).join(', ');
          return <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 1 }}>{label}</Typography>;
        } catch { return null; }
      })()}
      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: 2, mt: '20px', textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Bebidas vendidas de la semana
      </Typography>
      {/* Gráfico por tipo de bebida (semana) */}
      <Box sx={{ mt: 1, p: 1.5, background: '#f9fafb', borderRadius: 2, border: '1px solid #0001', minHeight: 240, maxHeight: 400, overflowY: 'auto', boxShadow: 'inset 0 6px 6px -6px rgba(0,0,0,0.08), inset 0 -6px 6px -6px rgba(0,0,0,0.08)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#444' }}>Ventas por tipo (semana)</Typography>
        <CategoryBarChart
          data={data.map(b => ({ name: b.tipo, total: b.total }))}
          unitSuffix=" uds"
          colorMap={{
            Refresco: '#3b82f6',
            Cerveza: '#f59e0b',
            Agua: '#14b8a6',
            Vino: '#a855f7',
          }}
          colors={[ '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee', '#93c5fd' ]}
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Información de la semana
      </Typography>
  {/* Totales al pie */}
      {(() => {
        try {
          const selMonday = parse(week + '-1', "RRRR-'W'II-i", new Date());
          const selM = selMonday.getMonth();
          const selY = selMonday.getFullYear();
          let monthTotal = 0;
          let weekTotal = 0;
          Object.entries(bebidasPorSemana).forEach(([wkey, arr]) => {
            const m = parse(wkey + '-1', "RRRR-'W'II-i", new Date());
            if (m.getMonth() === selM && m.getFullYear() === selY) {
              monthTotal += arr.reduce((s, x) => s + (x.total || 0), 0);
            }
            if (wkey === week) {
              weekTotal = arr.reduce((s, x) => s + (x.total || 0), 0);
            }
          });
          const monthName = format(selMonday, 'LLLL', { locale: es });
          const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          return (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 0 }}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff7e0',
                    borderRadius: 2,
                    boxShadow: '0px 3px 12px 0px rgba(0,0,0,0.08)',
                    pb: 2,
                    pt: 2,
                    px: 2,
                  }}
                >
                  <Typography variant="subtitle2" align="center" sx={{ color: '#b70202', fontWeight: 700, mb: 0.5, width: '100%' }}>
                    Bebidas totales de la semana
                  </Typography>
                  <Typography variant="h4" align="center" sx={{ color: '#111', fontWeight: 800, width: '100%' }}>{weekTotal} Uds</Typography>
                  <Typography variant="caption" align="center" sx={{ color: '#033448', width: '100%' }}>Semana actual</Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1976d2',
                    borderRadius: 2,
                    boxShadow: '0px 3px 12px 0px rgba(0,0,0,0.08)',
                    pb: 2,
                    pt: 2,
                    px: 2,
                  }}
                >
                  <Typography variant="subtitle2" align="center" sx={{ color: '#fff', fontWeight: 700, mb: 0.5, width: '100%' }}>
                    Bebidas totales del mes
                  </Typography>
                  <Typography variant="h4" align="center" sx={{ color: '#fff', fontWeight: 800, width: '100%' }}>{monthTotal} Uds</Typography>
                  <Typography variant="caption" align="center" sx={{ color: '#e3f2fd', width: '100%' }}>Mes: {monthCap}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          );
        } catch {
          return null;
        }
      })()}
    </Box>
  );
};

export default BebidasVendidasSheet;
