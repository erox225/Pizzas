import { mapFinalizadoItems } from "../utils";
import { useRef, useState } from "react";
import { updateOrderItems } from "../services/update";
import type { OrderItem } from "../domain/types";

// Tipo mínimo para operar en el resumen sin forzar Order completo
export type SummaryItem = {
  id?: string;
  name: string;
  quantity: number;
  pricePerUnit?: number;
  finalizado?: boolean;
  // opcional: tipo del producto en órdenes nuevas
  type?: 'pizza' | 'drink';
};

export type OrderLike = {
  pizzas: SummaryItem[];
  drinks: SummaryItem[];
  id?: string | null;
  estado?: string;
};

type Params = {
  currentOrder?: OrderLike;
  localFinalizados?: Record<string, boolean>;
  setLocalFinalizados?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

// Hook personalizado que gestiona el resumen de la orden seleccionada
export function useOrderSummary({
  currentOrder = { pizzas: [], drinks: [], id: null },
  localFinalizados: externalLocalFinalizados,
  setLocalFinalizados: setExternalLocalFinalizados,
}: Params) {
  const badgeRef = useRef<HTMLDivElement | null>(null);

  // Estado local para ítems finalizados en órdenes nuevas
  const [internalLocal, setInternalLocal] = useState<Record<string, boolean>>({});
  const localFinalizados = externalLocalFinalizados ?? internalLocal;
  const setLocalFinalizados = setExternalLocalFinalizados ?? setInternalLocal;

  // Obtener todos los productos (pizzas y bebidas) de la orden seleccionada
  const selectedItems: SummaryItem[] = [
    ...(currentOrder?.pizzas || []),
    ...(currentOrder?.drinks || []),
  ];

  // Si la orden no tiene id, usar el estado local para finalizados
  const selected: SummaryItem[] = currentOrder?.id
    ? selectedItems
    : selectedItems.map((item: SummaryItem) => ({
        ...item,
        finalizado: typeof item.finalizado === 'boolean' ? item.finalizado : (localFinalizados[item.name] || false)
      }));

  // Calcular total de bebidas
  // Calcular total de bebidas correctamente usando el array de drinks
  const totalDrinks = (currentOrder?.drinks || []).reduce((acc, drink) => acc + (drink.quantity || 0), 0);

  // Al hacer click en un ítem, alternamos su estado `finalizado`
  const toggleItemClick = (id: string) => {
    if (!currentOrder?.id) {
      // Orden nueva: actualizar estado local
      setLocalFinalizados(prev => ({
        ...prev,
        [id.split('-')[1]]: !prev[id.split('-')[1]]
      }));
      return;
    }
    // Orden guardada: actualizar en Firestore y reflejar el cambio localmente primero
    const updatedPizzas = mapFinalizadoItems(currentOrder.pizzas || [], id);
    const updatedDrinks = mapFinalizadoItems(currentOrder.drinks || [], id);
    // Actualizar visualmente el estado local de los ítems (optimista)
    currentOrder.pizzas = updatedPizzas;
    currentOrder.drinks = updatedDrinks;
    // Persistir en Firestore (no bloquea el UI)
    updateOrderItems(currentOrder.id as string, updatedPizzas as any[], updatedDrinks as any[]);
  };

  return {
    selected,
    totalDrinks,
    toggleItemClick,
    badgeRef
  };
}
