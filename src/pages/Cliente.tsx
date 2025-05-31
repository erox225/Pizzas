/*Cliente.tsx */
import React, { useEffect } from "react";
import { Box, Grid, AppBar, Toolbar, Typography, IconButton, Collapse, Paper, Drawer, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';
import "@fontsource/roboto-slab";
import PizzaCard from "./components/PizzaCard";
import BottomBar from "./components/BottomBar";
import DrinkCardMobile from "./components/DrinkCardMobile";
import { useClienteState } from "./logic/Cliente.state";
import { useClienteHandlers } from "./logic/Cliente.handlers";
import { getPizzasNormalized, getDrinksNormalized } from "../services/select";
import { Pizza, Drink } from "./logic/Cliente.state";

export default function Cliente() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleGenerarReporte = () => {
    // Acción para generar reporte
    handleMenuClose();
    alert('Generar reporte');
  };
  const handleSalir = () => {
    // Acción para salir
    handleMenuClose();
    alert('Salir');
  };
  const {
    pizzas, setPizzas,
    bottomOpen, setBottomOpen,
    quantities, setQuantities,
    searchOpen, setSearchOpen,
    searchTerm, setSearchTerm,
    selectedIngredients, setSelectedIngredients,
    viewMode, setViewMode,
    drinks, setDrinks
  } = useClienteState();

  const {
    handleIncrement,
    handleDecrement,
    toggleIngredient,
    clearFilters
  } = useClienteHandlers({ setQuantities, setSelectedIngredients, setSearchTerm });

  useEffect(() => {
    getPizzasNormalized().then((arr) => {
      setPizzas(
        arr
          .filter(p => p.type === 'pizza')
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price.toString(),
            ingredients: p.ingredients ?? [],
            imageUrl: p.imageUrl ?? '',
            description: p.description,
            spicy: p.spicy,
          }))
      );
    });
  }, []);

  useEffect(() => {
    getDrinksNormalized().then((arr) => {
      setDrinks(
        arr
          .filter(d => d.type === 'drink')
          .map(d => ({
            id: d.id,
            name: d.name,
            price: d.price.toString(),
            imageUrl: d.imageUrl ?? '/bebidaEjemplo.png',
            description: d.description,
          }))
      );
    });
  }, []);

  const allIngredients = Array.from(new Set(pizzas.flatMap((p: Pizza) => p.ingredients)));

  const filteredPizzas = pizzas.filter((pizza: Pizza) => {
    const matchesName = pizza.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIngredients = selectedIngredients.length > 0
      ? selectedIngredients.every((ing: string) => pizza.ingredients.includes(ing))
      : true;
    return matchesName && matchesIngredients;
  });

  const selectedPizzas = pizzas.filter((pizza: Pizza) => quantities[pizza.id] > 0);
  const totalSlices = selectedPizzas.reduce((sum, pizza) => sum + quantities[pizza.id], 0);
  const totalAmount = selectedPizzas.reduce((sum, pizza) => sum + (quantities[pizza.id] * parseFloat(pizza.price)), 0);

  return (
    <Box
      sx={{
        backgroundColor: "#fdf6e3",
        minHeight: "100vh",
        width: "100%",
        color: "#111",
        pb: 10,
        fontFamily: "'Roboto Slab', serif"
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "#bf1e2d" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontFamily: "'Roboto Slab', serif", flexGrow: 1 }}>
            Fratelli
          </Typography>
        </Toolbar>
      </AppBar>



<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 1100,
    py: 1,
    mb: 2,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    backgroundColor: "#ffecb3"
  }}
>
  <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
    <Typography
      onClick={() => setViewMode("pizzas")}
      sx={{
        fontWeight: "bold",
        fontFamily: "'Roboto Slab', serif",
        fontSize: "24px",
        px: 3,
        py: 1,
        borderRadius: 3,
        border: "2px solid",
        borderColor: viewMode === "pizzas" ? "#bf1e2d" : "transparent",
        backgroundColor: viewMode === "pizzas" ? "#fdecea" : "transparent",
        cursor: "pointer",
        color: viewMode === "pizzas" ? "#bf1e2d" : "black",
        display: "flex",
        alignItems: "center",
        gap: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#f8d7da"
        }
      }}
    >
      🍕 Pizzas
    </Typography>

    <Typography
      onClick={() => setViewMode("drinks")}
      sx={{
        fontWeight: "bold",
        fontFamily: "'Roboto Slab', serif",
        fontSize: "24px",
        px: 3,
        py: 1,
        borderRadius: 3,
        border: "2px solid",
        borderColor: viewMode === "drinks" ? "#4caf50" : "transparent",
        backgroundColor: viewMode === "drinks" ? "#e8f5e9" : "transparent",
        cursor: "pointer",
        color: viewMode === "drinks" ? "#388e3c" : "black",
        display: "flex",
        alignItems: "center",
        gap: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "#c8e6c9"
        }
      }}
    >
      🥤 Bebidas
    </Typography>
  </Box>
</Box>

<Grid
  container
  spacing={{ xs: 2, sm: 3, md: 4 }}
  sx={{ px: { xs: 1, sm: 2, md: 4 }, pb: 4 }}
  justifyContent="center"
>
  {viewMode === "pizzas" &&
    filteredPizzas.map((pizza) => (
      <Grid
        item
        key={pizza.id}
        xs={12}
        sm={6}
        md={4}
        lg={3}
        xl={2.4}
        display="flex"
        justifyContent="center"
      >
        <PizzaCard
          pizza={pizza}
          quantity={quantities[pizza.id] || 0}
          onIncrement={() => handleIncrement(pizza.id)}
          onDecrement={() => handleDecrement(pizza.id)}
        />
      </Grid>
    ))}

  {viewMode === "drinks" &&
    drinks.map((drink) => (
<Grid
  item
  key={drink.id}
  xs={12}
  sm={6}
  md={4}
  lg={3}
  xl={2.4}
  display="flex"
  justifyContent="center"
>
    <DrinkCardMobile
      drink={drink}
      quantity={quantities[drink.id] || 0}
      onIncrement={() => handleIncrement(drink.id)}
      onDecrement={() => handleDecrement(drink.id)}
    />
</Grid>
    ))}
</Grid>

      {/* AQUÍ USAMOS EL NUEVO COMPONENTE */}
      <BottomBar
        bottomOpen={bottomOpen}
        setBottomOpen={setBottomOpen}
        totalSlices={totalSlices}
        totalAmount={totalAmount}
        pizzas={pizzas}
        drinks={drinks} // 👈 nuevo
        quantities={quantities}
      />

      <style>{`
        @keyframes pulseBorder {
          0% { opacity: 0.7; transform: scaleX(0.95); }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0.7; transform: scaleX(0.95); }
        }
      `}</style>
    </Box>
  );
}
