/*PizzaCard.tsx*/
import React from "react";
import { usePizzaCardState } from "../logic/PizzaCard.state";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Stack,
  IconButton,
  Chip,
  Divider,
  Fade
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SpaIcon from "@mui/icons-material/Spa";
import NoMealsIcon from "@mui/icons-material/NoMeals";
import GlutenFreeIcon from "@mui/icons-material/DoNotTouch";
import SetMealIcon from "@mui/icons-material/SetMeal";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NatureIcon from "@mui/icons-material/Eco";

const labelIcons = {
  vegana: <SpaIcon fontSize="small" sx={{ color: "#4caf50" }} />,
  "sin gluten": <GlutenFreeIcon fontSize="small" sx={{ color: "#f57c00" }} />,
  "sin lactosa": <NoMealsIcon fontSize="small" sx={{ color: "#ff9800" }} />,
  pescado: <SetMealIcon fontSize="small" sx={{ color: "#03a9f4" }} />
};

const ingredientIcons = {
  tomate: "🍅",
  mozzarella: "🧀",
  "salsa bbq": "🍖",
  jamón: "🥩",
  pollo: "🍗",
  bacon: "🥓",
  champiñón: "🍄",
  rúcula: "🌿",
  cebolla: "🧅",
  pimiento: "🫑",
  piña: "🍍",
  atún: "🐟",
  "salami picante": "🌶️",
  berenjena: "🍆",
  "tomate cherry": "🍒",
  "queso gorgonzola": "🧀",
  parmesano: "🧀",
  pecorino: "🧀",
  taleggio: "🧀",
  emmental: "🧀",
  speck: "🥓",
  alcachofa: "🌱",
  aceituna: "🫒",
  orégano: "🌿",
  trufa: "🍄",
};

export default function PizzaCard({ pizza, quantity, onIncrement, onDecrement }: {
  pizza: {
    name: string;
    price: string;
    ingredients: string[];
    imageUrl?: string;
    description?: string;
    spicy?: boolean;
  };
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const { imageError, setImageError } = usePizzaCardState();
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
        minWidth: 320,
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2 }}>
        <CardMedia
          component="img"
          image={imageError ? "/pizzaEjemplo.png" : pizza.imageUrl}
          alt={pizza.name}
          onError={() => setImageError(true)}
          sx={{
            objectFit: "cover",
            borderRadius: 2,
            width: 150,
            height: 144,
            boxShadow: 1,
          }}
        />
        <Box sx={{ flex: 1, width: '100%' }}>
          <Typography
            variant="h5"
            gutterBottom
            fontFamily="'Roboto Slab', serif"
            sx={{
              color: "#bf1e2d",
              fontWeight: 700,
              letterSpacing: "0.5px"
            }}
          >
            {pizza.name} - {pizza.price}€/Trozo
          </Typography>

          {pizza.spicy && (
  <Fade in>
    <Chip
      icon={<Box component="span" sx={{ fontSize: "1rem" }}>🌶️</Box>}
      label="Picante"
      size="small"
      sx={{
        mb: 1,
        backgroundColor: "#e53935",
        color: "#fff",
        fontWeight: 600,
        fontFamily: "'Roboto Slab', serif"
      }}
    />
  </Fade>
)}


          <Typography variant="body2" sx={{ mb: 1, color: '#444' }}>
            {pizza.description}
          </Typography>

          <Typography variant="subtitle2" fontWeight="bold">Ingredientes:</Typography>

          <Box
            sx={{
              overflowX: 'auto',
              width: '100%',
              display: 'flex',
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridTemplateRows: 'repeat(2, auto)',
                gap: 1,
                minWidth: 'max-content',
              }}
            >
              {pizza.ingredients?.map((ing, i) => (
                <Chip
                  key={i}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <span>{(ingredientIcons as Record<string, string>)[ing.toLowerCase()] || "🍕"}</span>
                      {ing}
                    </Box>
                  }
                  size="small"
                  sx={{
                    fontFamily: "'Roboto Slab', serif",
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    flexShrink: 0
                  }}
                />
              ))}
            </Box>
          </Box>


        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
        <IconButton
          onClick={onDecrement}
          sx={{
            border: "2px solid #bf1e2d",
            color: "#bf1e2d",
            width: 44,
            height: 44
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography fontWeight="bold">{quantity}</Typography>
        <IconButton
          onClick={onIncrement}
          sx={{
            backgroundColor: "#bf1e2d",
            color: "white",
            width: 44,
            height: 44,
            '&:hover': {
              backgroundColor: "#a81a26"
            }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  );
}
