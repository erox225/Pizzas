

// Genera un ID aleatorio de orden (puede servir si no se usa Firestore para autogenerarlos)
export const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Calcula totales de una orden (porciones y coste total)
export const calculateOrderTotals = (
  pizzas: any[],
  drinks: any[],
  quantities: Record<string, number>
) => {
  const allItems = [...pizzas, ...drinks];
  const totalAmount = allItems.reduce((acc, item) => {
    const qty = quantities[item.id] || 0;
    const price = parseFloat(item.price) || 0;
    return acc + qty * price;
  }, 0);

  const totalPortions = allItems.reduce((acc, item) => {
    const qty = quantities[item.id] || 0;
    return acc + qty;
  }, 0);

  return { totalAmount, totalPortions };
};

// Simula un objeto de cantidades (por ID) a partir de una orden
export const simulateQuantities = (order: any) => {
  const quantities: Record<string, number> = {};

  [...(order.pizzas || []), ...(order.drinks || [])].forEach((item: any) => {
    if (item.id && typeof item.quantity === "number") {
      quantities[item.id] = item.quantity;
    }
  });

  return quantities;
};


// Dado un array de items (pizzas o drinks) y un id formateado, actualiza el campo "finalizado" del ítem correspondiente
export const mapFinalizadoItems = (items: any[], id: string) => {
  const [orderIdPart, namePart] = id.split("-");

  return items.map(item => {
    return item.id === id || item.name === namePart
      ? { ...item, finalizado: !item.finalizado }
      : item;
  });
};