/**
 * Transaction Service
 * Handles Firestore transactions and batch operations
 * 
 * @layer Infrastructure
 * @package firebase/firestore
 * @responsibility Atomic operations and batch writes
 */
import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  runTransaction,
  writeBatch,
  doc,
  DocumentReference,
  Transaction,
  WriteBatch,
  DocumentData
} from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { FirebaseService } from '../../../core/services/firebase.service';

/**
 * Transaction Service
 * Provides atomic transaction and batch operations for Firestore
 * 
 * @example
 * ```typescript
 * // Run a transaction
 * this.transactionService.runTransaction(async (transaction) => {
 *   const userDoc = await transaction.get(userRef);
 *   const newBalance = userDoc.data().balance - 100;
 *   transaction.update(userRef, { balance: newBalance });
 * });
 * 
 * // Batch write
 * this.transactionService.batchWrite((batch) => {
 *   batch.set(doc1Ref, { name: 'User 1' });
 *   batch.set(doc2Ref, { name: 'User 2' });
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly firebaseService = inject(FirebaseService);
  private readonly firestore: Firestore = this.firebaseService.getFirestore();

  /**
   * Run a Firestore transaction
   * @param updateFunction - Function that performs the transaction operations
   * @returns Observable that completes when transaction is committed
   */
  runTransaction<T>(
    updateFunction: (_transaction: Transaction) => Promise<T>
  ): Observable<T> {
    return from(runTransaction(this.firestore, updateFunction));
  }

  /**
   * Execute a batch write operation
   * Batch writes are atomic - either all succeed or all fail
   * 
   * @param batchFunction - Function that performs batch operations
   * @returns Observable that completes when batch is committed
   */
  batchWrite(
    batchFunction: (_batch: WriteBatch) => void
  ): Observable<void> {
    const batch = writeBatch(this.firestore);
    batchFunction(batch);
    return from(batch.commit());
  }

  /**
   * Get a document reference
   * Helper method for creating document references in transactions
   * 
   * @param collectionName - Name of the Firestore collection
   * @param id - Document ID
   * @returns DocumentReference
   */
  getDocumentRef<T = DocumentData>(
    collectionName: string,
    id: string
  ): DocumentReference<T> {
    return doc(this.firestore, collectionName, id) as DocumentReference<T>;
  }
}
