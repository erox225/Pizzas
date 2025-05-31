import React from "react";
import { Box, Card, Typography, Avatar, LinearProgress } from "@mui/material";
// import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import type { PizzaSale } from "./PizzaSalesChart";


interface Props {
  data: PizzaSale[];
  onItemPress?: (name: string) => void;
}

const PizzaSalesMobileList: React.FC<Props> = ({ data, onItemPress }) => {
  // Ordenar por más vendidas
  const sorted = [...data].sort((a, b) => b.total - a.total);

  // Para obtener los datos extra, necesitamos los pedidos del día por pizza
  // Se asume que cada PizzaSale tiene breakdown y posiblemente un array de pedidos
  // Si no, se puede pasar como prop los pedidos, pero aquí lo calculamos con breakdown

  // Helper para formatear fecha
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const emojiFor = (name: string): string => {
    const n = (name || '').toLowerCase();
    if (n.includes('cerveza') || n.includes('beer')) return '🍺';
    if (n.includes('vino') || n.includes('wine')) return '🍷';
    if (n.includes('agua') || n.includes('water')) return '💧';
    if (n.includes('refresco') || n.includes('gaseosa') || n.includes('cola') || n.includes('soda')) return '🥤';
    return '🍕';
  };

  return (
    <Card sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      p: 1,
      background: "#fdf6e3",
      borderRadius: 2,
      boxShadow: 1,
    }}>
      {sorted.map((pizza, i) => {
        // Calcular última vez horneada y última venta
        // Suponemos que breakdown tiene las horas y cantidades
        // Si hay breakdown, la última vez horneada es la última hora con ventas
        let ultimaHora = '-';
        let ultimaVenta = '-';
        if (pizza.breakdown) {
          const horas = Object.keys(pizza.breakdown).filter(h => pizza.breakdown[h] > 0);
          if (horas.length > 0) {
            ultimaHora = horas.sort().pop() || '-';
          }
        }
        // Si hay breakdown, la última venta es la última hora con ventas
        // Si hay array de ventas, se puede usar la fecha exacta
        // Aquí solo mostramos la hora
        ultimaVenta = ultimaHora;

        const unitPrice = (pizza as any).price ?? null;
        const totalMoney = unitPrice ? unitPrice * (pizza.total ?? 0) : null;
        const baked = (pizza as any).baked ?? (pizza as any).horneadas;
        const isPizza = emojiFor(pizza.name) === '🍕';
        const showBar = isPizza && typeof baked === 'number' && baked > 0;

        return (
          <Box
            key={pizza.name}
            sx={{
              p: 2,
              mb: 1,
              background: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              cursor: onItemPress ? 'pointer' : 'default',
              transition: 'box-shadow 0.2s',
              ':hover': onItemPress ? { boxShadow: 6, background: '#fffbe7' } : undefined
            }}
            onClick={() => onItemPress?.(pizza.name)}
          >
            {/* Fila 1: Icono + Nombre del producto */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: '#f7b32b', width: 32, height: 32, fontSize: 22 }}>
                {emojiFor(pizza.name)}
              </Avatar>
              <Typography variant="h6" sx={{ color: '#bf1e2d', fontWeight: 'bold' }}>{pizza.name}</Typography>
            </Box>

            {/* Fila 2: Grid de 4 columnas */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              alignItems: 'center',
            }}>
              {/* Col 1: Unidades */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#888' }}>Unidades</Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 700 }}>{pizza.total}</Typography>
              </Box>

              {/* Col 2: Total dinero */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#888' }}>Total €</Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 700 }}>
                  {totalMoney != null ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalMoney) : '—'}
                </Typography>
              </Box>

              {/* Col 3: Última horneada */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#888' }}>Horneada</Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 700 }}>{ultimaHora}</Typography>
              </Box>

              {/* Col 4: Última venta */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#888' }}>Venta</Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 700 }}>{ultimaVenta}</Typography>
              </Box>
            </Box>

            {/* Fila 3: Barra (solo pizzas) */}
            {showBar && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Vendidas vs Horneadas</Typography>
                  <Typography variant="caption" sx={{ color: '#333', fontWeight: 600 }}>{pizza.total}/{baked}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, (pizza.total / baked) * 100))} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            )}
          </Box>
        );
      })}
    </Card>
  );
};

export default PizzaSalesMobileList;

