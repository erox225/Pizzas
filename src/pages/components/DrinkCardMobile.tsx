import React, { useState } from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Fade,
  useMediaQuery
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTheme } from "@mui/material/styles";

export interface Drink {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  description?: string;
}

export default function DrinkCardMobile({
  drink,
  quantity,
  onIncrement,
  onDecrement,
  disabled = false
}: {
  drink: Drink;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        backgroundColor: "#fffaf0",
        color: "#111",
        borderRadius: 3,
        p: 2,
        fontFamily: "'Roboto Slab', serif",
        width: '100%',
        maxWidth: 400,
        minWidth: 300,
        minHeight: 250,
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.01)',
        },
      }}
    >
      <CardMedia
        component="img"
        image={"/bebidaEjemplo.png"}
        alt={drink.name}
        onError={() => setImgError(true)}
        sx={{
          width: "100%",
          height: isMobile ? 180 : 130,
          borderRadius: 1,
          objectFit: "cover",
          mb: 1
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#3e2723",
            fontSize: isMobile ? 18 : 20,
            textTransform: "uppercase",
            maxWidth: "70%"
          }}
        >
          {drink.name}
        </Typography>
        <Chip
          label={`${parseFloat(drink.price).toFixed(2)}€`}
          size="small"
          sx={{
            backgroundColor: "#ffe082",
            fontWeight: "bold",
            fontSize: isMobile ? "16px" : "18px",
            px: 1.5
          }}
        />
      </Box>

      {drink.description && (
        <Typography
          variant="body2"
          sx={{ color: "#555", mt: 0.5, fontSize: isMobile ? 12 : 13 }}
        >
          {drink.description}
        </Typography>
      )}

      {drink.description && (
        <Box sx={{ mt: 1 }}>
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
              {drink.description.split(",").map((ing, i) => {
                const emojiMap: Record<string, string> = {
                  limón: "🍋",
                  menta: "🌿",
                  hielo: "🧊",
                  azúcar: "🍬",
                  naranja: "🍊",
                  fresa: "🍓",
                  soda: "🥤",
                  ron: "🥃",
                  cola: "🥤",
                  vodka: "🍸",
                  leche: "🥛",
                  café: "☕",
                  canela: "🌰"
                };
                const trimmed = ing.trim().toLowerCase();
                const emoji = emojiMap[trimmed] || "🥤";
                return (
                  <Chip
                    key={i}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <span>{emoji}</span>
                        <span>{ing.trim()}</span>
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
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <IconButton
          onClick={onDecrement}
          disabled={disabled}
          size="large"
          sx={{
            border: "2px solid #bf1e2d",
            color: "#bf1e2d",
            width: 44,
            height: 44,
            opacity: disabled ? 0.5 : 1
          }}
        >
          <RemoveIcon fontSize="medium" />
        </IconButton>

        <Fade in key={quantity}>
          <Typography
            variant="h6"
            sx={{
              width: 32,
              textAlign: "center",
              fontSize: 26,
              mx: 1
            }}
          >
            {quantity}
          </Typography>
        </Fade>

        <IconButton
          onClick={onIncrement}
          disabled={disabled}
          size="large"
          sx={{
            backgroundColor: disabled ? "#ccc" : "#bf1e2d",
            color: "#fff",
            width: 44,
            height: 44,
            "&:hover": { backgroundColor: disabled ? "#ccc" : "#a81a26" }
          }}
        >
          <AddIcon fontSize="medium" />
        </IconButton>
      </Box>
    </Card>
  );
}