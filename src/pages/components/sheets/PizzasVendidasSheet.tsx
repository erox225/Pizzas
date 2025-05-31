import React, { useState, useRef, FC } from "react";
import { Box, Typography, TextField, InputAdornment, IconButton, Tabs, Tab, Divider } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryBarChart from "../CategoryBarChart";
import WeeklySalesChart from "../WeeklySalesChart";
import { format, parse, addDays, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface PizzaTipo { tipo: string; total: number; }
interface DayData { day: string; total: number; }
interface Props {
  currentWeekKey: string;
  pizzasPorSemana: Record<string, PizzaTipo[]>;
  pizzasPorDiaSemana: Record<string, DayData[]>;
  sheetHeader: { bg: string; text: string };
}

const PizzasVendidasSheet: FC<Props> = (props) => {
  const { currentWeekKey, pizzasPorSemana, pizzasPorDiaSemana, sheetHeader } = props;
  const [week, setWeek] = useState<string>(currentWeekKey);
  const [tabP, setTabP] = useState<number>(0);
  const weekInputRef = useRef<HTMLInputElement | null>(null);
  const data = pizzasPorSemana[week] ?? pizzasPorSemana[currentWeekKey] ?? [];
  const dataByDay = pizzasPorDiaSemana[week] ?? pizzasPorDiaSemana[currentWeekKey] ?? [];
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
  <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: '8px', mt: '20px', textTransform: 'uppercase', fontFamily: 'inherit' }}>
        Pizzas vendidas de la semana
      </Typography>
      {/* Tabs de visualización con diseño e iconos */}
      <Box sx={{ mb: 1, px: 0.5 }}>
        <Tabs
          value={tabP}
          onChange={(_, v) => setTabP(v)}
          centered
          TabIndicatorProps={{ sx: { backgroundColor: '#ef4444', height: 3, borderRadius: 2 } }}
          sx={{
            minHeight: 0,
            '& .MuiTab-root': {
              minHeight: 36,
              textTransform: 'none',
              mx: 0.5,
              px: 1.5,
              borderRadius: 20,
              color: '#7a7a7a',
            },
            '& .MuiTab-root.Mui-selected': {
              backgroundColor: '#ffe5e9',
              color: '#b91c1c',
              fontWeight: 700,
            }
          }}
        >
          <Tab icon={<Box component="span" sx={{ fontSize: 18 }}>🍕</Box>} iconPosition="start" label="Por tipo" />
          <Tab icon={<Box component="span" sx={{ fontSize: 18 }}>📆</Box>} iconPosition="start" label="Por día" />
        </Tabs>
      </Box>
      {tabP === 0 && (
        <Box sx={{ mt: 1, p: 1.5, background: '#fff5f5', borderRadius: 2, border: '1px solid #0001', minHeight: 240, maxHeight: 400, overflowY: 'auto', boxShadow: 'inset 0 6px 6px -6px rgba(0,0,0,0.08), inset 0 -6px 6px -6px rgba(0,0,0,0.08)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#b91c1c' }}>Ventas por tipo (semana)</Typography>
          <CategoryBarChart
            data={data.map(p => ({ name: p.tipo, total: p.total }))}
            unitSuffix=" uds"
            colorMap={{
              Margarita: '#ef4444',
              Diavola: '#f97316',
              'Cuatro Quesos': '#f59e0b',
              Prosciutto: '#ec4899',
            }}
            colors={[ '#f87171', '#fb923c', '#fbbf24', '#f472b6', '#34d399', '#60a5fa' ]}
          />
        </Box>
      )}
      {tabP === 1 && (
        <Box sx={{ mt: 1, p: 1.5, background: '#fff7ed', borderRadius: 2, border: '1px solid #0001', minHeight: 240, maxHeight: 400, overflowY: 'auto', boxShadow: 'inset 0 6px 6px -6px rgba(0,0,0,0.08), inset 0 -6px 6px -6px rgba(0,0,0,0.08)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#c2410c' }}>Ventas por día (semana)</Typography>
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
                if (d.getTime() === today.getTime()) { highlightLabel = labels[i]; break; }
              }
            } catch {}
            return <WeeklySalesChart data={dataByDay} color="#ef4444" highlightDay={highlightLabel} unitSuffix=" uds" />;
          })()}
        </Box>
      )}
      {/* Totales al pie */}
      {(() => {
        try {
          const weeklyTotal = data.reduce((acc, p) => acc + (p.total || 0), 0);
          const selMonday = parse(week + '-1', "RRRR-'W'II-i", new Date());
          const selM = selMonday.getMonth();
          const selY = selMonday.getFullYear();
          let monthTotal = 0;
          Object.entries(pizzasPorSemana).forEach(([wkey, arr]) => {
            const m = parse(wkey + '-1', "RRRR-'W'II-i", new Date());
            if (m.getMonth() === selM && m.getFullYear() === selY) {
              monthTotal += arr.reduce((s, x) => s + (x.total || 0), 0);
            }
          });
          const monthName = format(selMonday, 'LLLL', { locale: es });
          const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
          return (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle1" align="center" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', fontFamily: 'inherit' }}>
                Información de la semana
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 0 }}>
                <Box sx={{ flex: 1, p: 2, background: '#fff3e0', borderRadius: 2, border: '1px solid #0001', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" align="center" sx={{ color: '#e65100', fontWeight: 700, mb: 1, fontSize: 15, lineHeight: 1.2 }}>
                    Pizzas totales de la<br/>semana
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ fontWeight: 900, fontSize: 32, mb: 1, lineHeight: 1.1 }}>{weeklyTotal} Uds</Typography>
                  <Typography variant="body2" align="center" sx={{ color: '#e65100', fontWeight: 400, fontSize: 14 }}>Semana actual</Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, background: '#ef4444', borderRadius: 2, border: '1px solid #0001', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" align="center" sx={{ color: '#fff', fontWeight: 700, mb: 1, fontSize: 15, lineHeight: 1.2 }}>
                    Pizzas totales del<br/>mes
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ color: '#fff', fontWeight: 900, fontSize: 32, mb: 1, lineHeight: 1.1 }}>{monthTotal} Uds</Typography>
                  <Typography variant="body2" align="center" sx={{ color: '#f3f4f6', fontWeight: 400, fontSize: 14 }}>Mes: {monthCap}</Typography>
                </Box>
              </Box>
            </>
          );
        } catch {
          return null;
        }
      })()}
    </Box>
  );
};

export default PizzasVendidasSheet;
