import { Pizza } from "../components/InventarioVivo";

type PizzaKitchenDashboardHandlersParams = {
  setPizzas: React.Dispatch<React.SetStateAction<Pizza[]>>;
  selectedPizza: Pizza | null;
  setSelectedPizza: React.Dispatch<React.SetStateAction<Pizza | null>>;
};

export function usePizzaKitchenDashboardHandlers({ setPizzas, selectedPizza, setSelectedPizza }: PizzaKitchenDashboardHandlersParams) {
  const onPizzaClick = (pizza: Pizza) => {
    setSelectedPizza(pizza);
  };

  const onPizzaMade = () => {
    if (selectedPizza) {
      setPizzas((prevPizzas: Pizza[]) =>
        prevPizzas.map((pizza) =>
          pizza.id === selectedPizza.id ? { ...pizza, slices: 8 } : pizza
        )
      );
      setSelectedPizza({ ...selectedPizza, slices: 8 });
    }
  };

  return {
    onPizzaClick,
    onPizzaMade
  };
}
