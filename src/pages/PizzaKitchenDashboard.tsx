import React, { useState, useEffect } from "react";
import { parse, differenceInMinutes } from "date-fns";
import { Box, Typography } from "@mui/material";
import DetallePizza from "./components/DetallePizza";
import BajoStock from "./components/BajoStock";
import InventarioVivo, { Pizza as UIPizza } from "./components/InventarioVivo";
// import Tendencias from "./components/Tendencias";
import { USE_MOCKS } from "../config";
import { getPizzasNormalized, getOrdersNormalized } from "../services/select";
import { kitchenHistorial, kitchenPizzas } from "../data/mocks";
import type { KitchenOrderRecord } from "./kitchen.types";

const historial: KitchenOrderRecord[] = kitchenHistorial as KitchenOrderRecord[];

const PizzaKitchenDashboard: React.FC = () => {
  const [pizzas, setPizzas] = useState<any[]>(kitchenPizzas);
  const [selectedPizza, setSelectedPizza] = useState<UIPizza | null>(null);

  useEffect(() => {
    if (!selectedPizza && pizzas.length > 0) {
      setSelectedPizza(pizzas[0]);
    }
  }, [pizzas, selectedPizza]);

  // Conectar a Firestore en producción: construir inventario y ventas del día por pizza
  useEffect(() => {
    if (USE_MOCKS) return; // En dev mantenemos los datos locales de ejemplo
    (async () => {
      const [catalog, orders] = await Promise.all([
        getPizzasNormalized(),
        getOrdersNormalized(),
      ]);
      const pizzasCatalog = catalog.filter(p => p.type === 'pizza');
      const today = new Date(); today.setHours(0,0,0,0);
      const soldMap: Record<string, { qty: number; lastSold?: Date }> = {};
      for (const o of orders) {
        const created = (o as any).createdAt?.toDate ? (o as any).createdAt.toDate() : new Date((o as any).createdAt);
        const d = new Date(created); d.setHours(0,0,0,0);
        if (d.getTime() !== today.getTime()) continue;
        (o.pizzas || []).forEach(it => {
          const entry = soldMap[it.name] || { qty: 0 };
          entry.qty += it.quantity || 0;
          entry.lastSold = created;
          soldMap[it.name] = entry;
        });
      }
      const list: any[] = pizzasCatalog.map((p, idx) => {
        const s = soldMap[p.name] || { qty: 0, lastSold: undefined };
        return {
          id: idx + 1,
          name: p.name,
          slices: 0,
          lastBaked: '-',
          lastSold: s.lastSold ? new Date(s.lastSold).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
          soldToday: s.qty,
          isBBQ: false,
          emoji: '🍕',
        };
      });
      setPizzas(list as Pizza[]);
      if (!selectedPizza && list.length) setSelectedPizza(list[0] as any);
    })();
  }, []);

  const onPizzaClick = (pizza: UIPizza) => {
    setSelectedPizza(pizza);
  };

  const onPizzaMade = () => {
    if (selectedPizza) {
      setPizzas(prev => prev.map(p => p.id === selectedPizza.id ? { ...p, slices: (p.slices || 0) + 8 } : p));
      setSelectedPizza(prev => prev ? { ...prev, slices: (prev.slices || 0) + 8 } : prev);
    }
  };

// Destacados de pizza con color
const highlightedPizzas = [
  { id: 1, badge: "🔥", value: "¡Pizza en Tendencia!", color: "#7e1412", borderColor:"#ff0000", colorDetalle:"#ff0000"}, // Margarita
  { id: 4, badge: "🏆", value: "Más Vendida del Día", color: "#6a1b9a", borderColor:"#3d0448", colorDetalle:"#A316F9"},   // Cuatro Quesos (morado oscuro)
  { id: 2, badge: "⚡", value: "¡Más Rápida en Venderse!", color: "#352600" , borderColor:"#d1ad00",colorDetalle:"#d1ad00" }, // Pepperoni (amarillo oscuro)
];


const pizzasWithHighlight = pizzas.map((pizza: any) => {
  const highlight = highlightedPizzas.find(h => h.id === pizza.id);
  return highlight ? { ...pizza, highlight } : pizza;
});

  return (
    <Box sx={{ width: "100%", height: "100vh", p: 0, backgroundColor: "#1e1e1e", color: "#fff", overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Dos filas: Inventario (36%) y paneles (64%) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap:0, height: '100%' }}>
        {/* Fila 1: Inventario en Vivo (36%) */}
        <Box sx={{ flex: '0 0 34%', minHeight: 0, overflow: 'hidden', pb: '0px' }}>
          <InventarioVivo
            pizzas={pizzasWithHighlight}
            onPizzaClick={onPizzaClick}
            selectedPizzaName={selectedPizza?.name}
          />
        </Box>
        {/* Fila 2: Detalle + Bajo Stock (64%) */}
        <Box
          sx={{
            flex: '1 1 64%',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '70% 28%',
            columnGap: '2%',
            width: '100%',
            maxWidth: '100%',
            alignItems: 'stretch',
            px: 2,
            py: 1,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          {/* Bajo stock (izquierda) */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', boxSizing: 'border-box', minWidth: 0, height: '100%', overflowY: 'auto', pr: 1 }}>
            <BajoStock pizzas={pizzasWithHighlight} onSelectPizza={onPizzaClick} selectedPizzaName={selectedPizza?.name} />
          </Box>
          {/* Detalle de la pizza seleccionada (derecha) */}
          <Box sx={{ boxSizing: 'border-box', minWidth: 0, height: '100%', overflowY: 'auto', pl: 1 }}>
            {selectedPizza && (
              <DetallePizza pizza={pizzasWithHighlight.find(p => p.id === selectedPizza?.id) || null} onPizzaMade={onPizzaMade} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PizzaKitchenDashboard;

// Interfaces necesarias para las funciones de métricas
export interface Pizza {
  id: number;
  name: string;
  slices: number;
  lastBaked: string;
  lastSold: string;
  soldToday: number;
  isBBQ: boolean;
  emoji: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  time: string;
  pizzas: OrderItem[];
  status: string;
}

// Función para calcular el tiempo promedio de preparación de una pizza
export function calcularTiempoPromedioPreparacion(historial: OrderRecord[]): number {
  if (historial.length < 2) return 0;

  // Ordenar por hora (y por fecha si está disponible en el futuro)
  const historialOrdenado = [...historial].sort((a, b) => {
    const dateA = parse(a.time, "HH:mm", new Date());
    const dateB = parse(b.time, "HH:mm", new Date());
    return dateA.getTime() - dateB.getTime();
  });

  const tiempos: number[] = [];
  for (let i = 1; i < historialOrdenado.length; i++) {
    const prev = parse(historialOrdenado[i - 1].time, "HH:mm", new Date());
    const curr = parse(historialOrdenado[i].time, "HH:mm", new Date());
    const diff = differenceInMinutes(curr, prev);
    tiempos.push(diff);
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  return promedio;
}

// Función para obtener la pizza más vendida del día
export function obtenerPizzaMasVendida(pizzas: Pizza[]): Pizza | null {
  if (pizzas.length === 0) return null;
  return pizzas.reduce((max, curr) => (curr.soldToday > max.soldToday ? curr : max), pizzas[0]);
}

// Función para calcular el total de pizzas vendidas hoy
export function calcularTotalPizzasVendidas(pizzas: Pizza[]): number {
  return pizzas.reduce((total, pizza) => total + pizza.soldToday, 0);
}
