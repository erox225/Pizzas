import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/Config";

export async function deleteDocument(collectionName: string, docId: string) {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
}
