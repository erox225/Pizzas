import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Config";
import { USE_MOCKS } from "../config";
import type { OrderEstado } from "../domain/types";

export const updateOrderItems = async (orderId: string, pizzas: any[], drinks: any[]) => {
  if (USE_MOCKS) {
    // Desarrollo: no persistir en Firestore
    return;
  }
  const orderRef = doc(db, "orders", orderId);
  const totalSlices = (Array.isArray(pizzas) ? pizzas : []).reduce((acc, it) => acc + (it.quantity || 0), 0);
  const totalAmount = [...(Array.isArray(pizzas) ? pizzas : []), ...(Array.isArray(drinks) ? drinks : [])]
    .reduce((acc, it) => {
      const qty = it.quantity || 0;
      let price = 0;
      if (typeof it.pricePerUnit === 'number') price = it.pricePerUnit;
      else if (it.pricePerUnit) price = parseFloat(it.pricePerUnit);
      else if (typeof it.price === 'number') price = it.price;
      else if (it.price) price = parseFloat(it.price);
      if (isNaN(price)) price = 0;
      return acc + qty * price;
    }, 0);
  await updateDoc(orderRef, {
    pizzas,
    drinks,
    totalSlices,
    totalAmount
  });
};

// Actualizar cualquier documento de cualquier colección
export async function updateDocument(collectionName: string, docId: string, data: any) {
  if (USE_MOCKS) {
    return;
  }
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, data);
}

export async function updateOrderEstado(orderId: string, estado: OrderEstado) {
  if (USE_MOCKS) {
    return;
  }
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { estado });
}
