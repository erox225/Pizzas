import { useState, useEffect } from "react";
import { Pizza } from "../components/InventarioVivo";

export function usePizzaKitchenDashboardState() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);

  useEffect(() => {
    if (!selectedPizza && pizzas.length > 0) {
      setSelectedPizza(pizzas[0]);
    }
  }, [pizzas, selectedPizza]);

  return {
    pizzas, setPizzas,
    selectedPizza, setSelectedPizza
  };
}
