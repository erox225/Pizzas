type BarraHandlersParams = {
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

export function useBarraHandlers({ setQuantities }: BarraHandlersParams) {
  const handleIncrement = (id: string) => {
    setQuantities((q: Record<string, number>) => ({ ...q, [id]: (q[id] || 0) + 1 }));
  };

  const handleDecrement = (id: string) => {
    setQuantities((q: Record<string, number>) => ({ ...q, [id]: Math.max((q[id] || 0) - 1, 0) }));
  };

  // Puedes agregar más handlers aquí según la lógica del componente

  return {
    handleIncrement,
    handleDecrement
  };
}
