import { Timestamp } from 'firebase/firestore';
import type { Order, OrderItem, Product } from '../domain/types';

// Helpers
const toNumber = (v: any, fallback = 0) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? Number(n) : fallback;
};

const isFsTimestamp = (v: any): v is Timestamp => v && typeof v.toDate === 'function';

// Product adapters (optional)
export function fromFirestoreProduct(id: string, data: any): Product {
  return {
    id,
    type: data.type ?? (data.ingredients ? 'pizza' : 'drink'),
    name: data.name ?? '',
    price: toNumber(data.price, 0),
    activo: data.activo,
    description: data.description,
    imageUrl: data.imageUrl,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : undefined,
    spicy: data.spicy,
  };
}

export function toFirestoreProduct(p: Product) {
  return {
    type: p.type,
    name: p.name,
    price: p.price,
    activo: p.activo ?? true,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    tags: p.tags ?? [],
    ingredients: p.type === 'pizza' ? (p.ingredients ?? []) : undefined,
    spicy: p.type === 'pizza' ? (p.spicy ?? false) : undefined,
  };
}

// Order adapters
export function fromFirestoreOrder(id: string, data: any): Order {
  const items = (arr: any[]): OrderItem[] =>
    Array.isArray(arr)
      ? arr.map((it) => ({
          id: it.id ?? '',
          name: it.name ?? '',
          type: it.type ?? 'pizza',
          quantity: toNumber(it.quantity, 0),
          pricePerUnit: toNumber(it.pricePerUnit ?? it.price, 0),
          finalizado: Boolean(it.finalizado),
        }))
      : [];
  return {
    id,
    orderId: data.orderId ?? '',
    pizzas: items(data.pizzas),
    drinks: items(data.drinks),
    totalSlices: toNumber(data.totalSlices, 0),
    totalAmount: toNumber(data.totalAmount, 0),
    paymentMethod: data.paymentMethod ?? undefined,
    estado: (data.estado as any) ?? 'Preparando',
    createdAt: isFsTimestamp(data.createdAt) ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt ?? Date.now())),
    expiresAt: isFsTimestamp(data.expiresAt) ? data.expiresAt : Timestamp.fromDate(new Date(data.expiresAt ?? Date.now())),
    updatedAt: isFsTimestamp(data.updatedAt) ? data.updatedAt : undefined,
    status: typeof data.status === 'number' ? data.status : undefined,
  };
}

export function toFirestoreOrder(order: Order) {
  return {
    orderId: order.orderId,
    pizzas: order.pizzas.map((it) => ({
      id: it.id,
      name: it.name,
      type: it.type,
      quantity: it.quantity,
      pricePerUnit: it.pricePerUnit,
      finalizado: !!it.finalizado,
    })),
    drinks: order.drinks.map((it) => ({
      id: it.id,
      name: it.name,
      type: it.type,
      quantity: it.quantity,
      pricePerUnit: it.pricePerUnit,
      finalizado: !!it.finalizado,
    })),
    totalSlices: order.totalSlices,
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod ?? null,
    estado: order.estado,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    updatedAt: order.updatedAt ?? null,
    status: typeof order.status === 'number' ? order.status : null,
  };
}

