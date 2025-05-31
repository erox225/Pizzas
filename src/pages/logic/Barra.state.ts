import { useState, useEffect } from "react";
import type { Order } from "../../domain/types";

export function useBarraState() {
  const [pizzas, setPizzas] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingSelection, setPendingSelection] = useState<Order | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"pizzas" | "drinks">("pizzas");

  return {
    pizzas, setPizzas,
    orders, setOrders,
    quantities, setQuantities,
    searchOpen, setSearchOpen,
    searchTerm, setSearchTerm,
    selectedOrder, setSelectedOrder,
    pendingSelection, setPendingSelection,
    showUnsavedModal, setShowUnsavedModal,
    drinks, setDrinks,
    viewMode, setViewMode
  };
}
