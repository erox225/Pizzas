import { useState } from "react";

export interface Pizza {
  id: string;
  name: string;
  price: string;
  ingredients: string[];
  imageUrl?: string;
  description?: string;
  spicy?: boolean;
}

export interface Drink {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  description?: string;
}

export function useClienteState() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [bottomOpen, setBottomOpen] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"pizzas" | "drinks">("pizzas");
  const [drinks, setDrinks] = useState<Drink[]>([]);

  return {
    pizzas, setPizzas,
    bottomOpen, setBottomOpen,
    quantities, setQuantities,
    searchOpen, setSearchOpen,
    searchTerm, setSearchTerm,
    selectedIngredients, setSelectedIngredients,
    viewMode, setViewMode,
    drinks, setDrinks
  };
}
