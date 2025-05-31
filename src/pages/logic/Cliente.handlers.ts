type ClienteHandlersParams = {
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setSelectedIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
};

export function useClienteHandlers({ setQuantities, setSelectedIngredients, setSearchTerm }: ClienteHandlersParams) {
  const handleIncrement = (id: string) => {
    setQuantities((prev: Record<string, number>) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev: Record<string, number>) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev: string[]) =>
      prev.includes(ingredient) ? prev.filter((i: string) => i !== ingredient) : [...prev, ingredient]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedIngredients([]);
  };

  return {
    handleIncrement,
    handleDecrement,
    toggleIngredient,
    clearFilters
  };
}
