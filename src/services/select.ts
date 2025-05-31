import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/Config";
import { fromFirestoreOrder, fromFirestoreProduct } from "./adapters";
import type { Order, Product } from "../domain/types";
import { USE_MOCKS } from "../config";
import { pizzasCatalog, drinksCatalog } from "../data/mocks";

// Obtener todas las órdenes
export const fetchAllOrders = async () => {
  const ordersSnapshot = await getDocs(collection(db, "orders"));
  return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener una orden por su orderId
export const fetchOrderByOrderId = async (orderId: string) => {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("orderId", "==", orderId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
};

// Obtener todas las pizzas
export const fetchAllPizzas = async () => {
  const pizzasSnapshot = await getDocs(collection(db, "pizzas"));
  return pizzasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener todas las bebidas
export const fetchAllDrinks = async () => {
  const drinksSnapshot = await getDocs(collection(db, "drinks"));
  return drinksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Suscripción en tiempo real a una colección
export function subscribeToCollection(collectionName: string, callback: (docs: any[]) => void) {
  return onSnapshot(collection(db, collectionName), snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
}

export async function getCollectionDocs(collectionName: string): Promise<any[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Normalized getters (unified domain types)
export async function getPizzasNormalized(): Promise<Product[]> {
  if (USE_MOCKS) return pizzasCatalog as Product[];
  const snap = await getDocs(collection(db, "pizzas"));
  return snap.docs.map(d => fromFirestoreProduct(d.id, d.data()));
}

export async function getDrinksNormalized(): Promise<Product[]> {
  if (USE_MOCKS) return drinksCatalog as Product[];
  const snap = await getDocs(collection(db, "drinks"));
  return snap.docs.map(d => fromFirestoreProduct(d.id, d.data()));
}

export async function getOrdersNormalized(): Promise<Order[]> {
  if (USE_MOCKS) return [] as Order[];
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map(d => fromFirestoreOrder(d.id, d.data()));
}
