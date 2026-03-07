/**
 * Module: firestore.adapter.ts
 * Purpose: Implement IFirestoreRepo using Firebase Web Firestore SDK
 * Responsibilities: map generic repository operations to Firestore document APIs
 * Constraints: deterministic logic, respect module boundaries
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import type { FirestoreDoc, IFirestoreRepo, WriteOptions } from '@/shared-kernel/ports';

import { db } from './firestore.client';

class FirebaseFirestoreRepo implements IFirestoreRepo {
  async getDoc<T>(collectionPath: string, docId: string): Promise<FirestoreDoc<T> | null> {
    const snap = await getDoc(doc(db, collectionPath, docId));
    if (!snap.exists()) {
      return null;
    }
    const raw: any = snap.data();
    return {
      id: snap.id,
      data: raw,
    };
  }

  async getDocs<T>(collectionPath: string): Promise<FirestoreDoc<T>[]> {
    const snap = await getDocs(collection(db, collectionPath));
    const docs: Array<FirestoreDoc<any>> = snap.docs.map((item) => ({
      id: item.id,
      data: item.data(),
    }));
    return docs;
  }

  async setDoc<T>(collectionPath: string, docId: string, data: T, opts?: WriteOptions): Promise<void> {
    const payload: any = data;
    await setDoc(doc(db, collectionPath, docId), payload, {
      merge: opts?.merge ?? false,
    });
  }

  async deleteDoc(collectionPath: string, docId: string): Promise<void> {
    await deleteDoc(doc(db, collectionPath, docId));
  }

  onSnapshot<T>(
    collectionPath: string,
    callback: (docs: FirestoreDoc<T>[]) => void,
  ): () => void {
    return onSnapshot(collection(db, collectionPath), (snap) => {
      const docs: Array<FirestoreDoc<any>> = snap.docs.map((item) => ({
        id: item.id,
        data: item.data(),
      }));
      callback(
        docs,
      );
    });
  }
}

export const firestoreRepo: IFirestoreRepo = new FirebaseFirestoreRepo();
