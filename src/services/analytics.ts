import { addWeeks, format } from 'date-fns';
import type { Order } from '../domain/types';

/**
 * Devuelve una clave de semana ISO (p.ej. 2025-W07) a partir de una fecha.
 * Usamos el mismo formato que en los mocks para poder alternar sin ramificar
 * código de presentación.
 */
const isoWeek = (d: Date) => format(d, "RRRR-'W'II");

/**
 * buildDashboardData
 * -------------------
 * A partir de un array de órdenes normalizadas (Order), calcula las mismas
 * estructuras que usamos en los mocks para las vistas/hojas del dashboard.
 *
 * Estructuras que genera:
 *  - weeklyMockData: ventas totales por día de la semana (ingresos) para semana actual y 2 anteriores
 *  - mockPizzasPorSemana: unidades vendidas por tipo de pizza, por semana
 *  - mockBebidasPorSemana: unidades vendidas por tipo de bebida, por semana
 *  - mockPizzasPorDiaSemana: unidades vendidas de pizza por día de la semana (para gráficas por día)
 *  - mockVentasPorHora: unidades vendidas por hora del día actual (para momentos pico)
 *  - mockVentasSemanaActual: alias de la semana actual dentro de weeklyMockData
 *
 * Nota: El prefijo "mock" se mantiene por compatibilidad con componentes que
 * esperan esas props; realmente aquí son agregados calculados desde Firestore.
 */
export function buildDashboardData(orders: Order[]) {
  const now = new Date();
  const currentWeekKey = isoWeek(now);
  const lastWeekKey = isoWeek(addWeeks(now, -1));
  const twoWeeksKey = isoWeek(addWeeks(now, -2));
  const weekKeys = [currentWeekKey, lastWeekKey, twoWeeksKey];

  const initWeek = () => ([
    { day: 'Lun', total: 0 },
    { day: 'Mar', total: 0 },
    { day: 'Mié', total: 0 },
    { day: 'Jue', total: 0 },
    { day: 'Vie', total: 0 },
    { day: 'Sáb', total: 0 },
    { day: 'Dom', total: 0 },
  ]);

  const weeklyData: Record<string, { day: string; total: number }[]> = {
    [currentWeekKey]: initWeek(),
    [lastWeekKey]: initWeek(),
    [twoWeeksKey]: initWeek(),
  };

  const pizzasPorSemana: Record<string, { tipo: string; total: number }[]> = {
    [currentWeekKey]: [],
    [lastWeekKey]: [],
    [twoWeeksKey]: [],
  };
  const bebidasPorSemana: Record<string, { tipo: string; total: number }[]> = {
    [currentWeekKey]: [],
    [lastWeekKey]: [],
    [twoWeeksKey]: [],
  };
  const pizzasPorDiaSemana: Record<string, { day: string; total: number }[]> = {
    [currentWeekKey]: initWeek(),
    [lastWeekKey]: initWeek(),
    [twoWeeksKey]: initWeek(),
  };
  const ventasPorHora: { hour: string; total: number }[] = Array.from({ length: 24 }, (_, h) => ({ hour: String(h).padStart(2, '0') + ':00', total: 0 }));

  // Aggregate: recorre órdenes y acumula en las estructuras anteriores
  for (const o of orders) {
    const created = (o as any).createdAt?.toDate ? (o as any).createdAt.toDate() : new Date((o as any).createdAt);
    if (!(created instanceof Date) || isNaN(created.getTime())) continue;
    const wkey = isoWeek(created);
    if (!weekKeys.includes(wkey)) continue;
    const dayIdx = [1,2,3,4,5,6,0][created.getDay()]; // Mon=0...Sun=6 mapping
    // Sum totalAmount to weeklyMockData
    const dayArr = weeklyData[wkey];
    if (dayArr && dayArr[dayIdx]) dayArr[dayIdx].total += Math.round(o.totalAmount || 0);
    // Pizzas by week and by day
    (o.pizzas || []).forEach(it => {
      const arr = pizzasPorSemana[wkey];
      const found = arr.find(x => x.tipo === it.name) || arr[arr.push({ tipo: it.name, total: 0 })-1];
      found.total += it.quantity || 0;
      const byDay = pizzasPorDiaSemana[wkey];
      if (byDay && byDay[dayIdx]) byDay[dayIdx].total += it.quantity || 0;
    });
    // Drinks by week
    (o.drinks || []).forEach(it => {
      const arr = bebidasPorSemana[wkey];
      const found = arr.find(x => x.tipo === it.name) || arr[arr.push({ tipo: it.name, total: 0 })-1];
      found.total += it.quantity || 0;
    });
    // Today hourly
    const today = new Date(); today.setHours(0,0,0,0);
    const createdD = new Date(created); createdD.setHours(0,0,0,0);
    if (createdD.getTime() === today.getTime()) {
      const h = created.getHours();
      const qty = [...(o.pizzas||[]), ...(o.drinks||[])].reduce((s, it) => s + (it.quantity || 0), 0);
      ventasPorHora[h].total += qty;
    }
  }

  const ventasSemanaActual = weeklyData[currentWeekKey];
  return {
    currentWeekKey,
    weeklyData,
    bebidasPorSemana,
    pizzasPorSemana,
    pizzasPorDiaSemana,
    ventasPorHora,
    ventasSemanaActual,
  };
}
