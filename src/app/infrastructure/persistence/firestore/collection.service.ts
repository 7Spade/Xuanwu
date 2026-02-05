/**
 * Collection Service
 * Provides reactive real-time collection operations
 * 
 * @layer Infrastructure
 * @package @angular/fire/firestore
 * @responsibility Real-time collection subscriptions and batch operations
 */
import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  docData,
  CollectionReference,
  DocumentReference,
  QueryConstraint,
  query,
  doc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

/**
 * Collection Service
 * Provides real-time reactive streams for Firestore collections and documents
 * 
 * @example
 * ```typescript
 * // Subscribe to collection changes
 * this.collectionService.watchCollection<User>('users').subscribe(users => {
 *   console.log('Users updated:', users);
 * });
 * 
 * // Subscribe to single document changes
 * this.collectionService.watchDocument<User>('users', 'user123').subscribe(user => {
 *   console.log('User updated:', user);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly firestore = inject(Firestore);

  /**
   * Watch a collection for real-time updates
   * @param collectionName - Name of the Firestore collection
   * @param constraints - Optional query constraints
   * @returns Observable stream of collection data
   */
  watchCollection<T>(
    collectionName: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName) as CollectionReference;
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
    
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Watch a single document for real-time updates
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @returns Observable stream of document data
   */
  watchDocument<T>(collectionName: string, id: string): Observable<T | undefined> {
    const docRef = doc(this.firestore, collectionName, id) as DocumentReference;
    return docData(docRef, { idField: 'id' }) as Observable<T | undefined>;
  }

  /**
   * Get a collection reference
   * @param collectionName - Name of the Firestore collection
   * @returns CollectionReference
   */
  getCollectionRef(collectionName: string): CollectionReference {
    return collection(this.firestore, collectionName);
  }
}
