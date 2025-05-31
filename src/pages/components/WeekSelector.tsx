import React from "react";
import { TextField, InputAdornment, IconButton, Typography, Box } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface Props {
  week: string;
  setWeek: (w: string) => void;
  formattedWeekLabel: string;
  weekInputRef: React.RefObject<HTMLInputElement>;
  color?: string;
}

const WeekSelector: React.FC<Props> = ({ week, setWeek, formattedWeekLabel, weekInputRef, color }) => (
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
              sx={{ color: color || '#000' }}
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
);

export default WeekSelector;

