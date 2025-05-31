import React from "react";
import { Paper, BottomNavigation, BottomNavigationAction, Box } from "@mui/material";

interface Props {
  onNavigate: (section: number) => void;
  active: number;
}

/**
 * Material 3-style bottom bar (con tus emojis originales)
 * - BottomNavigation para a11y + ripple
 * - Superficie translúcida con blur y safe-area
 * - Estado seleccionado tipo "pill" y tipografía marcada
 */
const DashboardBadge: React.FC<Props> = ({ onNavigate, active }) => {
  const Emoji = ({ symbol, label }: { symbol: string; label: string }) => (
    <Box
      component="span"
      role="img"
      aria-label={label}
      sx={{ fontSize: 24, lineHeight: 1 }}
    >
      {symbol}
    </Box>
  );

  return (
    <Paper
      elevation={6}
      square
      sx={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        zIndex: 1200,
        height: "64px", // Altura fija para el botón
        backdropFilter: "blur(8px)",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 18, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
        borderTop: (theme) =>
          `1px solid ${
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
          }`
      }}
    >
      <BottomNavigation
        value={active}
        onChange={(_, newValue: number) => onNavigate(newValue)}
        showLabels
        sx={{
          // px: 1, // Eliminado el padding horizontal
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            height: "64px", // Altura fija para el botón
            borderRadius: 2,
            outline: "none", // Quita el borde al hacer click
            boxShadow: "none", // Quita cualquier sombra de foco
          },
          "& .Mui-selected": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                
                
          },
          "& .MuiBottomNavigationAction-label": {
            fontWeight: 600,
          },
        }}
      >
        <BottomNavigationAction
          label="Ventas"
          icon={<Emoji symbol="🍕" label="Ventas" />}
          aria-label="Ir a Ventas"
          sx={{
            color: (theme) => theme.palette.error.main,
            '&.Mui-selected': {
              color: (theme) => theme.palette.error.main,
              backgroundColor: '#ffe5e5', // pill rojo pastel
            },
          }}
        />
        <BottomNavigationAction
          label="Productos"
          icon={<Emoji symbol="🛒" label="Productos" />}
          aria-label="Ir a Productos"
          sx={{
            color: (theme) => theme.palette.info.main,
            '&.Mui-selected': {
              color: (theme) => theme.palette.info.main,
              backgroundColor: '#e5f0ff', // pill azul pastel
            },
          }}
        />
        <BottomNavigationAction
          label="Órdenes"
          icon={<Emoji symbol="📦" label="Órdenes" />}
          aria-label="Ir a Órdenes"
          sx={{
            color: (theme) => theme.palette.success.main,
            '&.Mui-selected': {
              color: (theme) => theme.palette.success.main,
              backgroundColor: '#e5ffe5', // pill verde pastel
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default DashboardBadge;

