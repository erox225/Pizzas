// src/components/PizzaCardSmall.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Fade,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SpaIcon from "@mui/icons-material/Spa";
import NoMealsIcon from "@mui/icons-material/NoMeals";
import GlutenFreeIcon from "@mui/icons-material/DoNotTouch";
import SetMealIcon from "@mui/icons-material/SetMeal";

const labelIcons: Record<string, JSX.Element> = {
  vegana: <SpaIcon fontSize="inherit" sx={{ color: "#4caf50" }} />,
  "sin gluten": <GlutenFreeIcon fontSize="inherit" sx={{ color: "#f57c00" }} />,
  "sin lactosa": <NoMealsIcon fontSize="inherit" sx={{ color: "#ff9800" }} />,
  pescado: <SetMealIcon fontSize="inherit" sx={{ color: "#03a9f4" }} />
};
  
export default function PizzaCardSmall({
  pizza,
  quantity,
  onIncrement,
  onDecrement,
  isInOrder = false,
  disabled = false,
  availableSlices = 8,
  disableIncrement = false,
}: {
  pizza: any;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isInOrder?: boolean;
  disabled?: boolean;
  availableSlices?: number;
  disableIncrement?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);

  useEffect(() => {
    // Pulsa suavemente el badge cuando cambia el número disponible
    setBadgePulse(true);
    const t = setTimeout(() => setBadgePulse(false), 220);
    return () => clearTimeout(t);
  }, [availableSlices]);

  return (
    <Card
      onClick={() => {
        // Click en cualquier parte de la carta suma 1 (si no está deshabilitado)
        if (disabled || disableIncrement) return;
        onIncrement();
      }}
      sx={{
        backgroundColor: "#fffaf0",
        borderRadius: 2,
        p: 1.5,
        fontFamily: "'Roboto Slab', serif",
        flex: "1 1 0",
        minWidth: 0,
        height: 280,
        boxShadow: isInOrder ? "0 0 0 2px #bf1e2d" : 2,
        display: "flex",
        flexDirection: "column",
        transition: "transform 200ms ease, box-shadow 180ms ease, border-left-color 180ms ease",
        borderLeftWidth: 6,
        borderLeftStyle: "solid",
        borderLeftColor: isInOrder ? "#bf1e2d" : "transparent",
        position: 'relative',
        overflow: 'visible',
        "&:hover": { transform: "scale(1.02)" }
      }}
    >
      {/* Badge único: trozos disponibles de esta pizza */}
      {/* Keyframes locales para el pulso del badge */}
      <style>{`
        @keyframes badgePulse { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
      `}</style>
      <Box sx={{
        position: 'absolute', top: -10, right: -8,
        background: availableSlices === 0 ? '#bf1e2d' : (availableSlices <= 2 ? '#f7b32b' : '#059669'), color: '#fff', borderRadius: '999px',
        minWidth: 34, height: '27px', paddingLeft: '7.6px', paddingRight: '7.6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Manrope, Roboto, system-ui, -apple-system',
        fontWeight: 800, fontSize: 18, lineHeight: 1,
        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 2,
        transition: 'background-color 180ms ease',
        animation: badgePulse ? 'badgePulse 200ms ease' : 'none'
      }} title={availableSlices === 0 ? 'Sin stock' : 'Trozos disponibles'}>
        {availableSlices}
      </Box>
      <Box
        sx={{
          cursor: !isInOrder && !disabled ? "pointer" : "default",
          width: "100%",
          height: 100,
          borderRadius: 1,
          overflow: "hidden",
          mb: 1
        }}
      >
        <CardMedia
          component="img"
          image={imgError ? "/pizzaEjemplo.png" : pizza.imageUrl}
          alt={pizza.name}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </Box>

      {/* Nombre + precio */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: "bold",
            color: "#bf1e2d",
            fontSize: 17
          }}
        >
          {pizza.name}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#444",
            fontSize: 15,
            whiteSpace: "nowrap",
            backgroundColor: "#ffe082",
            padding: "1px 12px",
            borderRadius: "10px",
            fontWeight : "bold"
          }}
        >
          {pizza.price}€
        </Typography>
      </Box>


      <Divider sx={{ my: 0.5 }} />

      {/* Ingredientes con scroll y dos filas */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontSize: 12, color: "#555" }}>
          Ingredientes:
        </Typography>
        <Box sx={{ overflowX: "auto", mt: 0.5 }}>
          <Box
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gridTemplateRows: "repeat(2, auto)",
              gap: 0.5,
              rowGap: 0.5,
              minWidth: "max-content",
              py: 0.5
            }}
          >
            {pizza.ingredients.map((ing: string, i: number) => {
              const emojiMap: Record<string, string> = {
                tomate: "🍅",
                mozzarella: "🧀",
                queso: "🧀",
                champiñón: "🍄",
                cebolla: "🧅",
                pimiento: "🫑",
                rúcula: "🌿",
                pepperoni: "🌶️",
                salami: "🌶️",
                piña: "🍍",
                aceituna: "🫒",
                jamón: "🥩",
                bacon: "🥓",
                pollo: "🍗",
                gorgonzola: "🧀",
                parmesano: "🧀",
                atún: "🐟",
                ajo: "🧄",
                trufa: "🍄",
                nata: "🥛",
                "tomate cherry": "🍅",
                alcachofa: "🌱",
                berenjena: "🍆",
                speck: "🥓"
              };
              const emoji = emojiMap[ing.toLowerCase()] || "🍕";
              return (
                <Chip
                  key={i}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <span>{emoji}</span>
                      <span>{ing}</span>
                    </Box>
                  }
                  size="small"
                  sx={{
                    fontSize: 12,
                    backgroundColor: "#f5f5f5",
                    px: 1,
                    fontFamily: "'Roboto Slab', serif"
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Botones de cantidad */}
      <Box sx={{ display: "flex", justifyContent: "center"}}>
        <IconButton
          onClick={(e) => { e.stopPropagation(); onDecrement(); }}
          disabled={disabled}
          size="large"
          sx={{
            border: "2px solid #bf1e2d",
            color: "#bf1e2d",
            width: 40,
            height: 40,
            opacity: disabled ? 0.5 : 1
          }}
        >
          <RemoveIcon fontSize="medium" />
        </IconButton>
        <Fade in key={quantity} timeout={{ enter: 300, exit: 100 }}>
          <Typography
            variant="h6"
            sx={{
              width: 28,
              textAlign: "center",
              fontSize: 22,
              mx: 1
            }}
          >
            {quantity}
          </Typography>
        </Fade>
        {(disabled || disableIncrement) ? (
          <Tooltip title={disableIncrement ? 'Sin stock' : 'Bloqueado por edición'} placement="top" arrow enterTouchDelay={500} leaveTouchDelay={1200}>
            <span>
              <IconButton
                onClick={(e) => { e.stopPropagation(); }}
                disabled
                size="large"
                sx={{
                  backgroundColor: "#ccc",
                  color: "#fff",
                  width: 40,
                  height: 40,
                  "&:hover": { backgroundColor: "#ccc" }
                }}
              >
                <AddIcon fontSize="medium" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <IconButton
            onClick={(e) => { e.stopPropagation(); onIncrement(); }}
            size="large"
            sx={{
              backgroundColor: "#bf1e2d",
              color: "#fff",
              width: 40,
              height: 40,
              "&:hover": { backgroundColor: "#a81a26" }
            }}
          >
            <AddIcon fontSize="medium" />
          </IconButton>
        )}
      </Box>
    </Card>
  );
}
