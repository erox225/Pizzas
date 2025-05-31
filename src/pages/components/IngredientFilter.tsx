import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Fade,
  Paper,
  Tooltip,
  Zoom,
  ClickAwayListener,
  Button,
  Badge
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import NatureIcon from "@mui/icons-material/Nature";
import SetMealIcon from "@mui/icons-material/SetMeal";
import StarsIcon from "@mui/icons-material/Stars";
import EmojiFoodBeverageIcon from "@mui/icons-material/EmojiFoodBeverage";

const ingredientTypes = {
  "Base y Salsas": {
    keywords: ["tomate", "salsa bbq", "salsa boloñesa", "ajo"],
    icon: <LocalPizzaIcon htmlColor="#f44336" />,
    color: "#f44336"
  },
  Quesos: {
    keywords: ["mozzarella", "queso", "cheddar", "gorgonzola", "parmesano", "pecorino", "emmental", "taleggio"],
    icon: <RestaurantIcon htmlColor="#ffeb3b" />,
    color: "#ffeb3b"
  },
  Verduras: {
    keywords: ["rúcula", "calabacín", "berenjena", "pimiento", "olivas", "cebolla", "piña", "jalapeños", "alcachofa", "tomate cherry"],
    icon: <NatureIcon htmlColor="#4caf50" />,
    color: "#4caf50"
  },
  "Carnes y Proteínas": {
    keywords: ["jamón", "jamón curado", "jamón de parma", "pollo", "bacon", "pepperoni", "chorizo", "carne", "gambas", "atún", "longaniza", "anchoa", "speck"],
    icon: <SetMealIcon htmlColor="#e91e63" />,
    color: "#e91e63"
  },
  Especiales: {
    keywords: ["nata", "crema", "trufa", "aceite de trufa", "perejil", "orégano"],
    icon: <StarsIcon htmlColor="#9c27b0" />,
    color: "#9c27b0"
  }
};

export default function IngredientFilter({
  allIngredients,
  selectedIngredients,
  toggleIngredient,
  clearFilters,
  bottomOpen
}: {
  allIngredients: string[];
  selectedIngredients: string[];
  toggleIngredient: (ingredient: string) => void;
  clearFilters: () => void;
  bottomOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [animatedIngredient, setAnimatedIngredient] = useState<string | null>(null);
  const [badgeKey, setBadgeKey] = useState(0); // para reiniciar la animación

  useEffect(() => {
    setBadgeKey(prev => prev + 1);
  }, [selectedIngredients.length]);

  const getIngredientGroup = (ingredient: string) => {
    for (const [label, { keywords }] of Object.entries(ingredientTypes)) {
      if (keywords.includes(ingredient.toLowerCase())) return label;
    }
    return "Otros";
  };

  const grouped = allIngredients.reduce((acc, ing) => {
    const group = getIngredientGroup(ing);
    if (!acc[group]) acc[group] = [];
    acc[group].push(ing);
    return acc;
  }, {} as Record<string, string[]>);

  const handleToggle = (ing: string) => {
    toggleIngredient(ing);
    setAnimatedIngredient(ing);
    setTimeout(() => setAnimatedIngredient(null), 300);
  };

  const handleClickAway = () => {
    if (open) setOpen(false);
  };

  return (
    <>
      {!bottomOpen && (
        <Box sx={{ position: "fixed", bottom: 104, right: 20, zIndex: 9999 }}>
          <Tooltip title="Filtrar por ingredientes" TransitionComponent={Zoom}>
            <Badge
              key={badgeKey}
              badgeContent={selectedIngredients.length}
              color="error"
              invisible={selectedIngredients.length === 0}
              className="badge-animate"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: "bold",
                  backgroundColor: "#bf1e2d",
                  fontSize: 12,
                  minWidth: 20,
                  height: 20
                }
              }}
            >
              <IconButton
                onClick={() => setOpen(prev => !prev)}
                sx={{
                  backgroundColor: "#ffedb5",
                  color: "#fff",
                  width: 56,
                  height: 56,
                  border: "3px solid #ccb702",
                  "&:hover": {
                    backgroundColor: "#a81a26"
                  }
                }}
              >
                <span role="img" aria-label="ajo" style={{ fontSize: 24 }}>
                  🧄
                </span>
              </IconButton>
            </Badge>
          </Tooltip>
        </Box>
      )}

      {open && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Fade in={open}>
            <Paper
              elevation={6}
              sx={{
                position: "fixed",
                bottom: 170,
                right: 20,
                zIndex: 9998,
                width: 280,
                maxHeight: "65vh",
                overflowY: "auto",
                borderRadius: 3,
                p: 2,
                backgroundColor: "#fffde7"
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 2, fontFamily: "'Roboto Slab', serif", color: "#bf1e2d" }}
              >
                Ingredientes
              </Typography>

              {Object.entries(grouped).map(([label, ingredients], idx) => {
                const meta = ingredientTypes[label] || {};
                return (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <IconButton size="small" sx={{ backgroundColor: meta.color || "#e0e0e0" }}>
                        {meta.icon || <EmojiFoodBeverageIcon />}
                      </IconButton>
                      <Typography variant="caption" fontWeight="bold">
                        {label}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {ingredients.map((ing, i) => {
                        const selected = selectedIngredients.includes(ing);
                        const isAnimated = animatedIngredient === ing;
                        return (
                          <Chip
                            key={i}
                            label={ing}
                            onClick={() => handleToggle(ing)}
                            className={isAnimated ? "animated-chip" : ""}
                            sx={{
                              fontFamily: "'Roboto Slab', serif",
                              backgroundColor: selected ? meta.color || "#f0f0f0" : "#f0f0f0",
                              color: selected ? "#fff" : "#000",
                              transition: "all 0.2s ease"
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    clearFilters();
                    setOpen(false);
                  }}
                  sx={{
                    borderColor: "#bf1e2d",
                    color: "#bf1e2d",
                    fontWeight: "bold",
                    fontFamily: "'Roboto Slab', serif",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#fce4ec",
                      borderColor: "#a81a26",
                      color: "#a81a26"
                    }
                  }}
                >
                  Limpiar filtros
                </Button>
              </Box>
            </Paper>
          </Fade>
        </ClickAwayListener>
      )}

      <style>{`
        .animated-chip {
          animation: zoomBounce 0.3s ease-in-out;
        }
        .badge-animate {
          animation: pulseBadge 0.4s ease-in-out;
        }
        @keyframes zoomBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes pulseBadge {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}