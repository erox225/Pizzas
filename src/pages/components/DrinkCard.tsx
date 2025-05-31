import React, { useState } from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Fade,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export interface Drink {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  description?: string;
}

export default function DrinkCard({
  drink,
  quantity,
  onIncrement,
  onDecrement,
  disabled = false,
  isInOrder = false
}: {
  drink: Drink;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  isInOrder?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      onClick={() => {
        // Click en cualquier parte de la carta suma 1
        if (!disabled) onIncrement();
      }}
      sx={{
        backgroundColor: isInOrder ? "#fffaf0" : (quantity > 1 ? "#f5f5f5" : "#fffaf0"),
        borderRadius: 3,
        p: { xs: 1, sm: 1.5 },
        fontFamily: "'Roboto Slab', serif",
        width: { xs: "100%", sm: "90%" },
        maxWidth: { xs: 180, sm: 210, md: 230 },
        minWidth: { xs: 140, sm: 160 },
        boxShadow: isInOrder ? 6 : (quantity > 1 ? 6 : 2),
        border: isInOrder ? "2.5px solid #bf1e2d" : (quantity > 1 ? "2.5px solid #bf1e2d" : "1.5px solid #e0e0e0"),
        borderLeftWidth: 6,
        borderLeftStyle: 'solid',
        borderLeftColor: isInOrder ? '#bf1e2d' : 'transparent',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "transform 200ms ease, box-shadow 180ms ease, border 180ms ease, border-left-color 180ms ease",
        position: 'relative',
        overflow: 'visible',
        "&:hover": { transform: "scale(1.03)", boxShadow: 8 },
        m: { xs: 0.5, sm: 1 }
      }}
    >
      {quantity > 0 && (
        <Box sx={{
          position: 'absolute', top: -6, right: -6,
          background: '#bf1e2d', color: '#fff', borderRadius: '999px',
          minWidth: 28, height: 28, px: 1.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Manrope, Roboto, system-ui, -apple-system',
          fontWeight: 800, fontSize: 14, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 2
        }}>
          {quantity}
        </Box>
      )}
      <Box
        sx={{
          cursor: disabled ? "default" : "pointer",
          width: { xs: 110, sm: 140 },
          height: { xs: 90, sm: 130 },
          borderRadius: 2,
          overflow: "hidden",
          mb: 1,
          margin: "auto",
          boxShadow: quantity > 1 ? "0 0 0 3px #bf1e2d33" : "none"
        }}
      >
        <CardMedia
          component="img"
          image="/bebidaEjemplo.png"
          alt={drink.name}
          onError={() => setImgError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#bf1e2d",
            fontSize: { xs: 15, sm: 17 },
            textTransform: "uppercase",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {drink.name}
        </Typography>
        <Chip
          label={`${parseFloat(drink.price).toFixed(2)}€`}
          size="small"
          sx={{ backgroundColor: "#ffe082", fontWeight: "bold", fontSize: { xs: "12px", sm: "14px" }, px: 1.5, borderRadius: "8px"}}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", mt: "auto", gap: 1 }}>
        <IconButton
          onClick={(e) => { e.stopPropagation(); onDecrement(); }}
          disabled={disabled}
          size="large"
          sx={{
            border: "2px solid #bf1e2d",
            color: "#bf1e2d",
            width: 44,
            height: 44,
            opacity: disabled ? 0.5 : 1,
            backgroundColor: "#fff",
            boxShadow: quantity > 1 ? "0 0 0 2px #bf1e2d33" : "none"
          }}
        >
          <RemoveIcon fontSize="medium" />
        </IconButton>
        <Fade in key={quantity}>
          <Typography
            variant="h6"
            sx={{ width: 32, textAlign: "center", fontSize: { xs: 24, sm: 28 }, mx: 1, fontWeight: "bold", color: quantity > 1 ? "#bf1e2d" : "#222" }}
          >
            {quantity}
          </Typography>
        </Fade>
        {disabled ? (
          <Tooltip title={'Bloqueado por edición'} placement="top" arrow enterTouchDelay={500} leaveTouchDelay={1200}>
            <span>
              <IconButton
                onClick={(e) => { e.stopPropagation(); }}
                disabled
                size="large"
                sx={{
                  backgroundColor: "#ccc",
                  color: "#fff",
                  width: 44,
                  height: 44,
                  "&:hover": { backgroundColor: "#ccc" },
                  boxShadow: quantity > 1 ? "0 0 0 2px #bf1e2d33" : "none"
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
              width: 44,
              height: 44,
              "&:hover": { backgroundColor: "#a81a26" },
              boxShadow: quantity > 1 ? "0 0 0 2px #bf1e2d33" : "none"
            }}
          >
            <AddIcon fontSize="medium" />
          </IconButton>
        )}
      </Box>
    </Card>
  );
}
