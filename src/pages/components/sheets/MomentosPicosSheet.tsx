import React, { FC, useState, useRef } from "react";
import { Box, Typography, Divider, Chip, IconButton, TextField, InputAdornment } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourlySalesChart from "../HourlySalesChart";

interface Data { hour: string; total: number; }
interface Props {
  ventasPorHora: Data[];
}

const MomentosPicosSheet: FC<Props> = ({ ventasPorHora }) => {
  // Estado para la fecha seleccionada
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // Simular datos por día (en real, aquí iría fetch o filtro)
  const data = React.useMemo(() =>
    (ventasPorHora ?? []).map(d => ({
      ...d,
      // Cambia los datos según el día para simular (solo para demo)
      total: d.total + (selectedDate === new Date().toISOString().slice(0, 10) ? 0 : 2)
    })), [ventasPorHora, selectedDate]);

  const [highlightHour, setHighlightHour] = useState<string | undefined>(undefined);
  const chartRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  // Colores de borde de los momentos pico
  const palettes = [
    { bg: '#e3f2fd', text: '#1976d2' },
    { bg: '#e8f5e9', text: '#2e7d32' },
    { bg: '#fff3e0', text: '#e65100' },
  ];
  // Calcular los 3 momentos pico para el día seleccionado
  const byTotal = React.useMemo(() =>
    [...data].sort((a, b) => b.total - a.total).slice(0, 3), [data]);
  const highlightBars = React.useMemo(() =>
    byTotal.map((h, i) => ({ hour: h.hour, color: palettes[i % palettes.length].text })), [byTotal, palettes]);
  // Estado para expandir solo una carta a la vez
  const [expanded, setExpanded] = useState<string | null>(null);
  // Datos ficticios de pizzas y bebidas por hora, recalculados por día
  const ventasPorHoraExtra = React.useMemo(() => {
    const result: Record<string, { pizzas: number; bebidas: number }> = {};
    data.forEach(d => {
      result[d.hour] = {
        pizzas: Math.floor(d.total * 0.7),
        bebidas: Math.floor(d.total * 0.3)
      };
    });
    return result;
  }, [data]);
  // Ref para el input de fecha
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: '2px solid #222',
          borderRadius: 2,
          px: 1.2,
          py: 0.5,
          width: '90%',
          fontFamily: 'Fredoka, Arial, sans-serif',
          fontWeight: 600,
          fontSize: 15,
          color: '#222',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* El input está por encima y cubre todo */}
          <input
            ref={inputRef}
            id="date-momentos"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 2,
              border: 'none',
              margin: 0,
              padding: 0,
            }}
            tabIndex={0}
            aria-label="Seleccionar día"
          />
          {/* El contenido visual está debajo */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            <span style={{ flex: 1, userSelect: 'none', fontSize: 15, pointerEvents: 'none' }}>
              {(() => {
                const date = new Date(selectedDate);
                return date.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
              })()}
            </span>
            <CalendarMonthIcon
              sx={{ ml: 1, fontSize: 22, color: '#222', cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={e => {
                e.stopPropagation();
                if (inputRef.current) {
                  inputRef.current.showPicker ? inputRef.current.showPicker() : inputRef.current.focus();
                }
              }}
            />
          </Box>
        </Box>
      </Box>
      <Typography 
        variant="body2"
        sx={{ 
          color: '#222', 
          mb: 1, 
          textAlign: 'center', 
          fontWeight: 700,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
        }}
      >
        Ventas por hora del día
      </Typography>
      <Box sx={{ p: 1.5, background: '#fffaf0', borderRadius: 2, border: '1px solid #0001', minHeight: 240, maxHeight: 240, overflowY: 'auto', boxShadow: 'inset 0 6px 6px -6px rgba(0,0,0,0.08), inset 0 -6px 6px -6px rgba(0,0,0,0.08)' }}>
        <HourlySalesChart
          data={data}
          unitSuffix=" uds"
          height={240}
          showAverage={false}
          highlightHour={highlightHour}
          chartRef={chartRef}
          highlightBars={highlightBars}
        />
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Typography
        variant="subtitle1"
        sx={{
          color: '#222',
          fontWeight: 700,
          textAlign: 'center',
          mb: 1.2,
          letterSpacing: 0.2,
          textTransform: 'uppercase',
        }}
      >
        Momentos del día
      </Typography>
      {(() => {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', position: 'relative', minHeight: 80 }}>
            {/* Línea vertical timeline */}
            <Box sx={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 4, bgcolor: '#e0e0e0', zIndex: 0, borderRadius: 2 }} />
            <Box sx={{ flex: 1, pl: 6 }}>
              {byTotal.map((h, i) => (
                <Box
                  key={h.hour}
                  sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', mb: 3, position: 'relative', cursor: 'pointer' }}
                  onClick={() => {
                    setHighlightHour(h.hour);
                    setExpanded(expanded === h.hour ? null : h.hour);
                  }}
                >
                  {/* Círculo enumerado */}
                  <Box sx={{ position: 'absolute', left: -43, top: 18, zIndex: 1, width: 36, height: 36, bgcolor: '#fff', border: `4px solid ${palettes[i % palettes.length].text}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: palettes[i % palettes.length].text, boxShadow: '0 2px 8px #0001' }}>
                    {i + 1}
                  </Box>
                  {/* Carta */}
                  <Box sx={{
                    flex: 1,
                    ml: 2,
                    px: 1.5,
                    py: 0.7,
                    background: palettes[i % palettes.length].bg,
                    borderRadius: 2,
                    border: '1px solid #0001',
                    boxShadow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    minHeight: expanded === h.hour ? 100 : 60,
                    transition: 'min-height 0.38s cubic-bezier(0.4,0,0.2,1), padding 0.38s cubic-bezier(0.4,0,0.2,1)',
                    overflow: 'hidden',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={`Momento pico #${i + 1}`}
                        size="small"
                        sx={{
                          color: palettes[i % palettes.length].text,
                          mb: 0.5,
                          background: palettes[i % palettes.length].bg,
                          fontSize: 13,
                          borderRadius: 2,
                          px: 1.5,
                          height: 26,
                          letterSpacing: 0.2,
                          boxShadow: '0 1px 4px #0001',
                          border: '1px solid',

                        }}
                      />
                      <IconButton size="small" sx={{ transition: 'transform 0.2s', transform: expanded === h.hour ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#444' }}>🕒 {h.hour} <span style={{ fontSize: 20, margin: '0 6px', verticalAlign: 'middle' }}>➡️</span> {h.total} <span style={{ color: '#666', fontWeight: 500, fontSize: 18 }}>uds</span></Typography>
                    <Box
                      sx={{
                        mt: expanded === h.hour ? 1.5 : 0,
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        opacity: expanded === h.hour ? 1 : 0,
                        maxHeight: expanded === h.hour ? 40 : 0,
                        transition: 'opacity 0.38s cubic-bezier(0.4,0,0.2,1), max-height 0.38s cubic-bezier(0.4,0,0.2,1), margin-top 0.38s cubic-bezier(0.4,0,0.2,1)',
                        pointerEvents: expanded === h.hour ? 'auto' : 'none',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                        🍕 Pizzas: {ventasPorHoraExtra[h.hour]?.pizzas ?? 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        🥤 Bebidas: {ventasPorHoraExtra[h.hour]?.bebidas ?? 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })()}
    </Box>
  );
};

export default MomentosPicosSheet;
