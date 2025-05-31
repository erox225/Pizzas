// Tipos compartidos para la vista de Cocina (Kitchen)

export interface KitchenOrderItem {
  name: string;
  quantity: number;
}

export interface KitchenOrderRecord {
  id: string;
  time: string; // HH:mm
  pizzas: KitchenOrderItem[];
  status: 'Preparando' | 'Entregado' | string;
}

