/**
 * Mocks centralizados para desarrollo
 * -----------------------------------
 * Este archivo reúne todos los datasets de demo usados por el dashboard,
 * hojas y modales. En producción se sustituyen por agregados calculados a
 * partir de Firestore (ver src/services/analytics.ts) cuando USE_MOCKS=false.
 */
import { format, addWeeks } from 'date-fns';

// Week key helper (ISO week based)
// Clave de semana ISO (2025-W07). Debe coincidir con analytics para alternar.
export const isoWeek = (d: Date) => format(d, "RRRR-'W'II");
export const currentWeekKey = isoWeek(new Date());
export const lastWeekKey = isoWeek(addWeeks(new Date(), -1));
export const twoWeeksKey = isoWeek(addWeeks(new Date(), -2));

// Finanzas y operaciones
export const finanzas = {
  ingresos: 12000,
  costes: 9000,
  gastosFijos: 6000,
  gastosVariables: 3000,
  margenPorUnidad: 40,
  puntoEquilibrio: 150,
  costePorPizza: 32,
};

export const operaciones = {
  horaSaturacion: '21:00',
  tiempoMedioPreparacion: 12,
  tiempoIdeal: 10,
};

export const canales = [
  { canal: 'Local', pedidos: 80, beneficio: 1200 },
  { canal: 'Aplicación', pedidos: 40, beneficio: 700 },
];

export const diasHoras = [
  { dia: 'Viernes', hora: '21:00', ventas: 40 },
  { dia: 'Sábado', hora: '20:00', ventas: 50 },
];

export const pizzasVendidas = [
  { nombre: 'Margarita', cantidad: 60, rentabilidad: 45 },
  { nombre: 'Diavola', cantidad: 40, rentabilidad: 50 },
];

// Ventas totales por día de la semana (semana actual)
export const ventasSemanaActual = [
  { day: 'Lun', total: 1200 },
  { day: 'Mar', total: 980 },
  { day: 'Mié', total: 1100 },
  { day: 'Jue', total: 1050 },
  { day: 'Vie', total: 1600 },
  { day: 'Sáb', total: 1900 },
  { day: 'Dom', total: 1500 },
];

export const weeklyData: Record<string, { day: string; total: number }[]> = {
  [currentWeekKey]: ventasSemanaActual,
  [lastWeekKey]: [
    { day: 'Lun', total: 900 },
    { day: 'Mar', total: 1000 },
    { day: 'Mié', total: 950 },
    { day: 'Jue', total: 1020 },
    { day: 'Vie', total: 1400 },
    { day: 'Sáb', total: 1700 },
    { day: 'Dom', total: 1300 },
  ],
  [twoWeeksKey]: [
    { day: 'Lun', total: 800 },
    { day: 'Mar', total: 850 },
    { day: 'Mié', total: 900 },
    { day: 'Jue', total: 950 },
    { day: 'Vie', total: 1300 },
    { day: 'Sáb', total: 1600 },
    { day: 'Dom', total: 1200 },
  ],
};

// Tipos locales
export type BebidaTipo = { tipo: string; total: number };
export type PizzaTipo = { tipo: string; total: number };

export const bebidasPorSemana: Record<string, BebidaTipo[]> = {
  [currentWeekKey]: [
    { tipo: 'Refresco', total: 120 },
    { tipo: 'Cerveza', total: 95 },
    { tipo: 'Agua', total: 80 },
    { tipo: 'Vino', total: 30 },
  ],
  [lastWeekKey]: [
    { tipo: 'Refresco', total: 100 },
    { tipo: 'Cerveza', total: 110 },
    { tipo: 'Agua', total: 70 },
    { tipo: 'Vino', total: 25 },
  ],
  [twoWeeksKey]: [
    { tipo: 'Refresco', total: 90 },
    { tipo: 'Cerveza', total: 85 },
    { tipo: 'Agua', total: 65 },
    { tipo: 'Vino', total: 20 },
  ],
};

export const pizzasPorSemana: Record<string, PizzaTipo[]> = {
  [currentWeekKey]: [
    { tipo: 'Margarita', total: 150 },
    { tipo: 'Diavola', total: 120 },
    { tipo: 'Cuatro Quesos', total: 90 },
    { tipo: 'Prosciutto', total: 70 },
  ],
  [lastWeekKey]: [
    { tipo: 'Margarita', total: 130 },
    { tipo: 'Diavola', total: 140 },
    { tipo: 'Cuatro Quesos', total: 85 },
    { tipo: 'Prosciutto', total: 60 },
  ],
  [twoWeeksKey]: [
    { tipo: 'Margarita', total: 120 },
    { tipo: 'Diavola', total: 110 },
    { tipo: 'Cuatro Quesos', total: 80 },
    { tipo: 'Prosciutto', total: 55 },
  ],
};

// Ventas por hora del día (mock)
export const ventasPorHora: { hour: string; total: number }[] = Array.from({ length: 24 }, (_, h) => {
  const label = String(h).padStart(2, '0') + ':00';
  const base = Math.max(0, -Math.pow(h - 21, 2) + 200); // pico en 21h
  const noise = (h * 7) % 11;
  return { hour: label, total: Math.round((base + noise) / 10) };
});

export const pizzasPorDiaSemana: Record<string, { day: string; total: number }[]> = {
  [currentWeekKey]: [
    { day: 'Lun', total: 90 },
    { day: 'Mar', total: 85 },
    { day: 'Mié', total: 95 },
    { day: 'Jue', total: 100 },
    { day: 'Vie', total: 160 },
    { day: 'Sáb', total: 180 },
    { day: 'Dom', total: 140 },
  ],
  [lastWeekKey]: [
    { day: 'Lun', total: 80 },
    { day: 'Mar', total: 88 },
    { day: 'Mié', total: 90 },
    { day: 'Jue', total: 92 },
    { day: 'Vie', total: 150 },
    { day: 'Sáb', total: 170 },
    { day: 'Dom', total: 130 },
  ],
  [twoWeeksKey]: [
    { day: 'Lun', total: 75 },
    { day: 'Mar', total: 78 },
    { day: 'Mié', total: 82 },
    { day: 'Jue', total: 85 },
    { day: 'Vie', total: 140 },
    { day: 'Sáb', total: 160 },
    { day: 'Dom', total: 120 },
  ],
};

// Demo price maps used by some views
export const pizzaPriceMap: Record<string, number> = { 'Margarita': 9, 'Diavola': 11, 'Cuatro Quesos': 12, 'Prosciutto': 12 };
export const drinkPriceMap: Record<string, number> = { 'Refresco': 2.5, 'Cerveza': 3, 'Agua': 1.5, 'Vino': 4 };

// Report modal mock data (for centralized access)
export const pedidosTodas = [
  { fecha: '2025-09-10', unidades: 12, venta: 240, productos: [{ nombre: 'Margarita', cantidad: 4 }, { nombre: 'Coca-Cola', cantidad: 2 }] },
  { fecha: '2025-09-11', unidades: 15, venta: 300, productos: [{ nombre: 'Diavola', cantidad: 5 }, { nombre: 'Sprite', cantidad: 3 }] },
  { fecha: '2025-09-12', unidades: 10, venta: 200, productos: [{ nombre: 'Cuatro Quesos', cantidad: 3 }, { nombre: 'Agua', cantidad: 2 }] },
  { fecha: '2025-09-13', unidades: 18, venta: 360, productos: [{ nombre: 'Prosciutto', cantidad: 6 }, { nombre: 'Fanta', cantidad: 2 }] },
  { fecha: '2025-09-14', unidades: 9, venta: 180, productos: [{ nombre: 'Margarita', cantidad: 2 }, { nombre: 'Cerveza', cantidad: 1 }] },
];
export const pedidosPizzas = [
  { fecha: '2025-09-10', unidades: 8, venta: 160, productos: [{ nombre: 'Margarita', cantidad: 4 }, { nombre: 'Diavola', cantidad: 4 }] },
  { fecha: '2025-09-11', unidades: 10, venta: 200, productos: [{ nombre: 'Cuatro Quesos', cantidad: 5 }, { nombre: 'Prosciutto', cantidad: 5 }] },
  { fecha: '2025-09-12', unidades: 7, venta: 140, productos: [{ nombre: 'Margarita', cantidad: 3 }, { nombre: 'Diavola', cantidad: 4 }] },
  { fecha: '2025-09-13', unidades: 12, venta: 240, productos: [{ nombre: 'Cuatro Quesos', cantidad: 6 }, { nombre: 'Prosciutto', cantidad: 6 }] },
  { fecha: '2025-09-14', unidades: 5, venta: 100, productos: [{ nombre: 'Margarita', cantidad: 2 }, { nombre: 'Diavola', cantidad: 3 }] },
];
export const pedidosBebidas = [
  { fecha: '2025-09-10', unidades: 4, venta: 80, productos: [{ nombre: 'Coca-Cola', cantidad: 2 }, { nombre: 'Sprite', cantidad: 2 }] },
  { fecha: '2025-09-11', unidades: 5, venta: 100, productos: [{ nombre: 'Agua', cantidad: 3 }, { nombre: 'Fanta', cantidad: 2 }] },
  { fecha: '2025-09-12', unidades: 3, venta: 60, productos: [{ nombre: 'Cerveza', cantidad: 2 }, { nombre: 'Vino', cantidad: 1 }] },
  { fecha: '2025-09-13', unidades: 6, venta: 120, productos: [{ nombre: 'Coca-Cola', cantidad: 3 }, { nombre: 'Agua', cantidad: 3 }] },
  { fecha: '2025-09-14', unidades: 4, venta: 80, productos: [{ nombre: 'Sprite', cantidad: 2 }, { nombre: 'Fanta', cantidad: 2 }] },
];

// Catálogo de ejemplo para desarrollo (Product del dominio)
export const pizzasCatalog = [
  { id: 'pz1', type: 'pizza', name: 'MARGHERITA', price: 12, ingredients: ['Tomate', 'Mozzarella', 'Albahaca'], description: 'Clásica italiana', spicy: false },
  { id: 'pz2', type: 'pizza', name: 'DIAVOLA', price: 13, ingredients: ['Tomate', 'Mozzarella', 'Salami picante'], description: 'Amantes del picante', spicy: true },
  { id: 'pz3', type: 'pizza', name: 'CUATRO QUESOS', price: 14, ingredients: ['Mozzarella', 'Gorgonzola', 'Parmigiano', 'Emmental'], description: 'Quesera total', spicy: false },
];

export const drinksCatalog = [
  { id: 'dr1', type: 'drink', name: 'Coca-Cola', price: 1.5, description: 'Refresco clásico' },
  { id: 'dr2', type: 'drink', name: 'Agua', price: 1.0, description: 'Mineral' },
  { id: 'dr3', type: 'drink', name: 'Cerveza', price: 2.5, description: 'Rubia' },
];

// Historial de pedidos para la vista de cocina (timeline)
export const kitchenHistorial = [
  {
    id: '1026',
    time: '19:30',
    pizzas: [ { name: 'Margarita', quantity: 3 }, { name: 'Diabla', quantity: 4 } ],
    status: 'Preparando'
  },
  {
    id: '1025',
    time: '20:15',
    pizzas: [ { name: 'Margarita', quantity: 3 }, { name: 'Diabla', quantity: 4 } ],
    status: 'Entregado'
  },
  {
    id: '1024',
    time: '18:20',
    pizzas: [ { name: 'Margarita', quantity: 3 }, { name: 'Diabla', quantity: 4 } ],
    status: 'Entregado'
  },
];

// Inventario inicial de cocina (solo para desarrollo)
export const kitchenPizzas = [
  { id: 1, name: 'Margarita', slices: 6, lastBaked: '13:00', lastSold: '15:00', soldToday: 25, isBBQ: false, emoji: '🍅' },
  { id: 2, name: 'Pepperoni', slices: 4, lastBaked: '14:30', lastSold: '15:10', soldToday: 40, isBBQ: true, emoji: '🌶️' },
  { id: 3, name: 'Hawaiana', slices: 5, lastBaked: '15:10', lastSold: '15:15', soldToday: 12, isBBQ: false, emoji: '🍍' },
  { id: 4, name: 'Cuatro Quesos', slices: 2, lastBaked: '12:45', lastSold: '13:30', soldToday: 18, isBBQ: false, emoji: '🧀' },
];
