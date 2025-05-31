import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  GlobalStyles,
  Paper,
  Chip
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Pizza {
  name: string;
  slices: number;
  lastBaked: string;
  lastSold: string;
  color: string;
  icon: string;
}

interface BajoStockProps {
  pizzas: Pizza[];
  onSelectPizza?: (pizza: Pizza) => void;
  selectedPizzaName?: string;
}

const BajoStock: React.FC<BajoStockProps> = ({ pizzas, onSelectPizza, selectedPizzaName }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lowCount = (pizzas || []).filter(p => (p.slices ?? 0) <= 4).length;

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes blink': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.2 },
            '100%': { opacity: 1 },
          }
        }}
      />
    <Paper
      elevation={4}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#1f1f1f',
        border: '1px solid',
        borderColor: lowCount > 0 ? 'rgba(255,167,38,0.28)' : 'rgba(255,255,255,0.12)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#1f1f1f',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningAmberIcon sx={{ color: "#ffa726", mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }} textTransform={"uppercase"}>
            Bajo en Stock
          </Typography>
          <WarningAmberIcon sx={{ color: "#ffa726", ml: 1 }} />
        </Box>
        <Chip
          size="small"
          label={lowCount}
          sx={{
            backgroundColor: lowCount > 0 ? '#fb8c00' : '#424242',
            color: '#fff',
            fontWeight: 800
          }}
        />
      </Box>

<Box
  ref={containerRef}
  sx={{
    px: 2,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    rowGap: '4px',
    columnGap: '4px',
    height: "100%",
    overflowY: "auto",
  }}
>
  {pizzas.filter(pizza => pizza.slices <= 4).length === 0 ? (
  <Box sx={{
    textAlign: "center",
    py: 6,
    color: "#888",
    backgroundColor: "#1e1e1e",
    borderRadius: 3,
    mx: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
  }}>
    <Typography variant="h6" sx={{ mt: 1 }}>
      ¡Todas las pizzas tienen suficiente stock!
    </Typography>
  </Box>
) : pizzas
      .filter(pizza => pizza.slices <= 4)
      .sort((a, b) => a.slices - b.slices)
      .map((pizza, index) => {
    let bgColor = "#424242";
    switch (pizza.slices) {
      case 4: bgColor = "#388e3c"; break;
      case 3: bgColor = "#f9a825"; break;
      case 2: bgColor = "#fb8c00"; break;
      case 1: bgColor = "#e53935"; break;
      case 0: bgColor = "#b71c1c"; break;
    }

    let icon = "🍕";
    switch (pizza.slices) {
      case 4: icon = "🟢"; break;
      case 3: icon = "🟡"; break;
      case 2: icon = "🟠"; break;
      case 1: icon = "🔴"; break;
      case 0: icon = "❌"; break;
    }

    return (
      <Box
        key={index}
        onClick={() => onSelectPizza?.(pizza)}
        sx={{
          cursor: "pointer",
          '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s ease-in-out' },
          borderLeft: `6px solid ${bgColor}`,
          backgroundColor: pizza.name === selectedPizzaName ? "#37474f" : "#262626",
          borderRadius: 3,
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          animation: 'fadeInUp 0.6s ease forwards',
          animationDelay: '0s',
          transition: "background-color 0.3s ease",
          height: '140px',
          minHeight: '140px',
          maxHeight: '140px',
          marginTop: 0,
          paddingTop: 0,
        }}
      >
        <Box sx={{ fontSize: "2rem" }}>{icon}</Box>
        <Box sx={{ flex: 1, color: "#fff" }}>
          <Typography variant="h6" fontWeight="bold">{pizza.name}</Typography>
          <Box sx={{ display: "flex", gap: 4, mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Horneada</Typography>
              <Typography variant="body1" fontWeight="bold">{pizza.lastBaked}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Venta</Typography>
              <Typography variant="body1" fontWeight="bold">{pizza.lastSold}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: `${bgColor}22`,
              border: `2px solid ${bgColor}`,
              borderRadius: "999px",
              px: 2,
              py: 1,
              fontWeight: "bold",
              fontSize: "1.4rem",
              color: "#fff",
            }}
          >
            <Typography sx={{ fontSize: "1.4rem" }}>🍕</Typography>
            <Typography sx={{ fontSize: "1.4rem" }}>{pizza.slices}</Typography>
          </Box>
          {(pizza.slices === 2 || pizza.slices === 1 || pizza.slices === 0) && (
            <Typography
              sx={{
                backgroundColor: pizza.slices === 2 ? "#fb8c00" : "#d32f2f",
                color: "#fff",
                borderRadius: "999px",
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                animation: "blink 2.5s infinite",
              }}
            >
              {pizza.slices === 0
                ? "¡AGOTADA!"
                : pizza.slices === 1
                ? "¡CRÍTICO!"
                : "BAJO STOCK"}
            </Typography>
          )}
        </Box>
      </Box>
    );
  })}
</Box>
      
    </Paper>
    </>
  );
};

export default BajoStock;
