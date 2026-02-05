/**
 * Firestore Adapter
 * Generic wrapper for Firestore operations following DDD architecture
 * 
 * @layer Infrastructure
 * @package firebase/firestore
 * @responsibility Provide type-safe Firestore CRUD operations
 */
import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { FirebaseService } from '../../../core/services/firebase.service';

/**
 * Generic Firestore Adapter
 * Provides CRUD operations for Firestore collections
 * 
 * @example
 * ```typescript
 * constructor(private firestoreAdapter: FirestoreAdapter) {}
 * 
 * // Get document
 * this.firestoreAdapter.getDocument<User>('users', 'user123');
 * 
 * // Add document
 * this.firestoreAdapter.addDocument('users', { name: 'John' });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FirestoreAdapter {
  private readonly firebaseService = inject(FirebaseService);
  private readonly firestore: Firestore = this.firebaseService.getFirestore();

  /**
   * Get a single document by ID
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @returns Observable of the document data
   */
  getDocument<T>(collectionName: string, id: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, id) as DocumentReference<T>;
    return from(
      getDoc(docRef).then((snapshot: DocumentSnapshot<T>) => 
        snapshot.exists() ? snapshot.data() ?? null : null
      )
    );
  }

  /**
   * Get all documents from a collection
   * @param collectionName - Name of the Firestore collection
   * @param constraints - Optional query constraints (where, orderBy, limit, etc.)
   * @returns Observable of array of documents
   */
  getDocuments<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    return from(
      getDocs(q).then((snapshot: QuerySnapshot<T>) =>
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T))
      )
    );
  }

  /**
   * Add a new document to a collection (auto-generated ID)
   * @param collectionName - Name of the Firestore collection
   * @param data - Document data
   * @returns Observable of the new document ID
   */
  addDocument<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Observable<string> {
    const collectionRef = collection(this.firestore, collectionName);
    return from(
      addDoc(collectionRef, data).then(docRef => docRef.id)
    );
  }

  /**
   * Set a document (create or overwrite) with a specific ID
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @param data - Document data
   * @returns Observable of void
   */
  setDocument<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: T
  ): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(setDoc(docRef, data));
  }

  /**
   * Update an existing document
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @param data - Partial document data to update
   * @returns Observable of void
   */
  updateDocument<T extends DocumentData>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(updateDoc(docRef, data as any));
  }

  /**
   * Delete a document
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @returns Observable of void
   */
  deleteDocument(collectionName: string, id: string): Observable<void> {
    const docRef = doc(this.firestore, collectionName, id);
    return from(deleteDoc(docRef));
  }

  /**
   * Get a collection reference
   * @param collectionName - Name of the Firestore collection
   * @returns CollectionReference
   */
  getCollectionRef<T = DocumentData>(collectionName: string): CollectionReference<T> {
    return collection(this.firestore, collectionName) as CollectionReference<T>;
  }

  /**
   * Get a document reference
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @returns DocumentReference
   */
  getDocumentRef<T = DocumentData>(collectionName: string, id: string): DocumentReference<T> {
    return doc(this.firestore, collectionName, id) as DocumentReference<T>;
  }
}

/**
 * Re-export Firestore query constraints for convenience
 */
export { where, orderBy, limit };
