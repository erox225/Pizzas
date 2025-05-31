import React, { useState, useEffect } from "react";
import { Card, Typography, Box, Button, Divider, Stack } from "@mui/material";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SellIcon from "@mui/icons-material/Sell";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";

interface DetallePizzaProps {
  pizza: {
    name: string;
    slices: number;
    highlight?: { badge: string; value: string,colorDetalle:string };
  };
  soldToday: number;
  onPizzaMade: () => void;
}

const DetallePizza: React.FC<DetallePizzaProps> = ({ pizza, soldToday, onPizzaMade }) => {
  const [bounce, setBounce] = useState(false);
  const [lastMade, setLastMade] = useState(new Date());
  const [shake, setShake] = useState(false);
  const [freshTimes, setFreshTimes] = useState<{ [key: string]: Date | null }>({});
  const trendingFlavor = "BBQ";
  const pizzasToday = soldToday;
  const isTrending = pizza.name === trendingFlavor;

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.2; }
        100% { opacity: 1; }
      }
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.5); }
      }
      @keyframes shake {
        0% { transform: translate(0); }
        25% { transform: translate(-0.2px, 0.2px); }
        50% { transform: translate(0.2px, -0.2px); }
        75% { transform: translate(-0.1px, 0.1px); }
        100% { transform: translate(0); }
      }
      @keyframes pizzaWiggle {
        0% { transform: translate(0); }
        25% { transform: translate(-0.1px, 0.1px); }
        50% { transform: translate(0.1px, -0.1px); }
        75% { transform: translate(-0.05px, 0.05px); }
        100% { transform: translate(0); }
      }
      @keyframes fadeInSlide {
        0% {
          opacity: 0;
          transform: translateY(-4px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes shine {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 0.5; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes subtlePulse {
        0% { background-color: #2e7d32; color: #fff; }
        50% { background-color: #3c9142; color: #fff; }
        100% { background-color: #2e7d32; color: #fff; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleAddPizza = () => {
    onPizzaMade();
    setLastMade(new Date());
    setShake(true);
    const expireAt = new Date(Date.now() + 10000);
    setFreshTimes(prev => ({ ...prev, [pizza.name]: expireAt }));
    setTimeout(() => {
      setFreshTimes(prev => ({ ...prev, [pizza.name]: null }));
    }, 10000);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    setBounce(true);
    const timeout = setTimeout(() => setBounce(false), 300);
    return () => clearTimeout(timeout);
  }, [pizza.slices]);

  if (!pizza?.name) {
    return (
      <Box
        sx={{
          p: 4,
          backgroundColor: "#1e1e1e",
          borderRadius: 4,
          textAlign: "center",
          color: "#ccc",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DisabledByDefaultIcon sx={{ fontSize: 64, color: "#b71c1c", mb: 2 }} />
        <Typography variant="h6">Ninguna pizza seleccionada</Typography>
        {pizza.slices <= 2 && (
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 1,
              backgroundColor:
                pizza.slices === 2
                  ? "#fb8c00"
                  : pizza.slices === 1
                  ? "#d32f2f"
                  : "#b71c1c",
              color: "#fff",
              borderRadius: "999px",
              px: 1.5,
              py: 0.5,
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              textAlign: "center",
              animation: "blink 2.5s infinite",
              alignSelf: "center",
            }}
          >
            {pizza.slices === 2
              ? "BAJO STOCK"
              : pizza.slices === 1
              ? "¡CRÍTICO!"
              : "¡AGOTADA!"}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card
      className={shake ? "shake" : ""}
      sx={{
        position: "relative",
        background: isTrending
          ? "linear-gradient(145deg, #5e1e1e, #3e0f0f)"
          : "linear-gradient(145deg, #2c2c2c, #1c1c1c)",
        borderRadius: 6,
        p: 2,
        color: "#fff",
        fontFamily: "'Roboto Slab', serif",
        boxShadow: 8,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        "&.shake": {
          animation: "shake 0.4s ease-out",
        },
      }}
    >
      {isTrending && (
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <WhatshotIcon sx={{ color: "#ff5722", fontSize: 32 }} />
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1}>
        <LocalPizzaIcon sx={{ fontSize: 32, color: "#ffa726" }} />
        <Typography variant="h5" fontWeight="bold" color="#FFDAA3">
          {pizza.name}
        </Typography>
      </Stack>


      <Divider sx={{ backgroundColor: "#424242" }} />

      <Box>

        {pizza.slices === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 0.9,
                py: 0.3,
                backgroundColor: '#b71c1c',
                color: '#ffffff',
                borderRadius: '999px',
                fontWeight: 800,
                letterSpacing: .5,
                fontSize: 12,
                textTransform: 'uppercase',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
              }}
              title="Sin stock"
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>❌</span>
              <span>AGOTADO</span>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{ fontSize: "1.1rem", textAlign: "center", mb: 2 , color: "#FFDAA3"}}
          >
            <strong>Trozos disponibles:</strong> {pizza.slices}
          </Typography>
        )}

        <Box
          sx={{
            fontSize: { xs: 28, sm: 32, md: 36 },
            textAlign: "center",
            animation: bounce ? "pizzaWiggle 0.6s ease-out" : "none",
            whiteSpace: "nowrap",
            letterSpacing: 2,
            color: pizza.slices === 0 ? "#b71c1c" : undefined,
            opacity: pizza.slices >= 7 ? 0.9 : 1,
            textShadow: "0 0 2px #000",
          }}
        >
          {pizza.slices === 0 ? "❌" : "🍕".repeat(Math.min(pizza.slices, 8))}{pizza.slices > 8 ? '…' : ''}
        </Box>

        {freshTimes[pizza.name] && new Date() < freshTimes[pizza.name]! ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Typography
              sx={{
                backgroundColor: "#43a047",
                color: "#fff",
                borderRadius: "999px",
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                textAlign: "center",
                animation: "fadeInSlide 0.6s ease-out",
              }}
            >
              ¡Recién horneada!
            </Typography>
          </Box>
        ) : (
          pizza.slices <= 2 && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography
                sx={{
                  backgroundColor:
                    pizza.slices === 2
                      ? "#fb8c00"
                      : pizza.slices === 1
                      ? "#d32f2f"
                      : "#b71c1c",
                  color: "#fff",
                  borderRadius: "999px",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                {pizza.slices === 2
                  ? "BAJO STOCK"
                  : pizza.slices === 1
                  ? "¡CRÍTICO!"
                  : "¡AGOTADA!"}
              </Typography>
            </Box>
          )
        )}

        <Stack spacing={2} mt={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScheduleIcon sx={{ color: "#81c784" }} />
            <Typography
              variant="body2"
              color="#FFDAA3"
            >
              Última vez horneada: 
              {freshTimes[pizza.name] && new Date() < freshTimes[pizza.name]! ? (
                <Box
                  component="span"
                  sx={{
                    animation: "subtlePulse 1.5s ease-out",
                    borderRadius: "6px",
                    px: 0.5,
                    display: "inline-block",
                    backgroundColor: "#2e7d32",
                    ml: 0.5,
                  }}
                >
                  <strong>{lastMade.toLocaleTimeString()}</strong>
                </Box>
              ) : (
                <Box
                  component="span"
                  sx={{
                    borderRadius: "6px",
                    px: 0.5,
                    display: "inline-block",
                    backgroundColor: "transparent",
                    ml: 0.5,
                  }}
                >
                  <strong>{lastMade.toLocaleTimeString()}</strong>
                </Box>
              )}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <SellIcon sx={{ color: "#ffcc80" }} />
            <Typography variant="body2"  color="#FFDAA3">
              Pizzas vendidas hoy: <strong>{pizzasToday}</strong>
            </Typography>
          </Stack>

          {pizza.highlight && (
            <Box
              sx={{
                mt: 3,
                borderRadius: 2,
                px: 1,
                py: 0.5,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.75,
                  background: "linear-gradient(to right, #232323, #1e1e1e, #232323)",
                  borderRadius: 1,
                  gap: 1,
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{pizza.highlight.badge}</span>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#fff",
                    letterSpacing: 1,
                    fontSize: "0.85rem",
                  }}
                >
                  {pizza.highlight.value}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>

      <Button
        variant="contained"
        onClick={handleAddPizza}
        startIcon={<AddCircleOutlineIcon />}
        sx={{
          backgroundColor: "#ffa726",
          color: "#000",
          fontWeight: "bold",
          borderRadius: 3,
          fontSize: "1rem",
          py: 1.5,
          textTransform: "none",
          boxShadow: 3,
          mt: 2,
          "&:hover": {
            backgroundColor: "#fb8c00",
          },
        }}
      >
        Pizza hecha
      </Button>
    </Card>
  );
};

export default DetallePizza;
