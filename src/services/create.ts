import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/Config";
import type { Order, Product } from "../domain/types";
import { toFirestoreOrder, toFirestoreProduct } from "./adapters";

export async function createDocument(collectionName: string, data: any) {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

export async function createOrder(order: Order) {
  const ref = collection(db, "orders");
  const fsOrder = toFirestoreOrder(order);
  const docRef = await addDoc(ref, fsOrder);
  return docRef.id;
}

export async function createProduct(product: Product) {
  const ref = collection(db, product.type === 'pizza' ? 'pizzas' : 'drinks');
  const fsProduct = toFirestoreProduct(product);
  const docRef = await addDoc(ref, fsProduct);
  return docRef.id;
}
