// Unified domain models for the app
// These types are intended to be the single source of truth
// for products, order items, and orders across the codebase.

import type { Timestamp } from 'firebase/firestore';

export type ProductType = 'pizza' | 'drink';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  price: number; // always number in domain
  activo?: boolean;
  // Optional/shared product fields
  description?: string;
  imageUrl?: string;
  tags?: string[];
  // Pizza-specific
  ingredients?: string[];
  spicy?: boolean;
}

export interface OrderItem {
  id: string; // product id
  name: string;
  type: ProductType;
  quantity: number;
  pricePerUnit: number;
  finalizado: boolean;
}

export type OrderEstado = 'Preparando' | 'Entregado' | 'Finalizado';

export interface Order {
  id?: string; // Firestore doc id
  orderId: string;
  pizzas: OrderItem[];
  drinks: OrderItem[];
  totalSlices: number;
  totalAmount: number;
  paymentMethod?: string;
  estado: OrderEstado;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  updatedAt?: Timestamp;
  status?: number;
}

