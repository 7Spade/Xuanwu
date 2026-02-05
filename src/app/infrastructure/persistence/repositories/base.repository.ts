/**
 * Base Repository Implementation
 * Generic CRUD repository following the Repository pattern
 * 
 * @layer Infrastructure
 * @package @angular/fire/firestore
 * @responsibility Provide generic repository operations for domain entities
 */
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreAdapter } from '../firestore/firestore.adapter';
import { CollectionService } from '../firestore/collection.service';
import { QueryConstraint, DocumentData } from '@angular/fire/firestore';

/**
 * Base entity interface
 * All entities must have an id field
 */
export interface BaseEntity {
  id?: string;
}

/**
 * Base Repository
 * Generic repository implementation that can be extended for specific domain entities
 * 
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class UserRepositoryImpl extends BaseRepository<User> {
 *   constructor() {
 *     super('users');
 *   }
 * 
 *   // Add custom methods
 *   findByEmail(email: string): Observable<User[]> {
 *     return this.findWhere(where('email', '==', email));
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class BaseRepository<T extends BaseEntity> {
  protected readonly firestoreAdapter = inject(FirestoreAdapter);
  protected readonly collectionService = inject(CollectionService);

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(protected readonly _collectionName: string) {}

  /**
   * Collection name accessor
   */
  protected get collectionName(): string {
    return this._collectionName;
  }

  /**
   * Find a single entity by ID
   * @param id - Entity ID
   * @returns Observable of entity or null
   */
  findById(id: string): Observable<T | null> {
    return this.firestoreAdapter.getDocument<T>(this.collectionName, id);
  }

  /**
   * Find all entities in the collection
   * @param constraints - Optional query constraints
   * @returns Observable of array of entities
   */
  findAll(...constraints: QueryConstraint[]): Observable<T[]> {
    return this.firestoreAdapter.getDocuments<T>(this.collectionName, ...constraints);
  }

  /**
   * Find entities matching query constraints
   * @param constraints - Query constraints (where, orderBy, limit, etc.)
   * @returns Observable of array of entities
   */
  findWhere(...constraints: QueryConstraint[]): Observable<T[]> {
    return this.firestoreAdapter.getDocuments<T>(this.collectionName, ...constraints);
  }

  /**
   * Create a new entity (auto-generated ID)
   * @param entity - Entity data
   * @returns Observable of the new entity ID
   */
  create(entity: Omit<T, 'id'>): Observable<string> {
    return this.firestoreAdapter.addDocument(this.collectionName, entity as DocumentData);
  }

  /**
   * Save an entity with a specific ID (create or overwrite)
   * @param id - Entity ID
   * @param entity - Entity data
   * @returns Observable of void
   */
  save(id: string, entity: Omit<T, 'id'>): Observable<void> {
    return this.firestoreAdapter.setDocument(this.collectionName, id, entity as DocumentData);
  }

  /**
   * Update an existing entity
   * @param id - Entity ID
   * @param updates - Partial entity data to update
   * @returns Observable of void
   */
  update(id: string, updates: Partial<Omit<T, 'id'>>): Observable<void> {
    return this.firestoreAdapter.updateDocument(this.collectionName, id, updates as Partial<DocumentData>);
  }

  /**
   * Delete an entity
   * @param id - Entity ID
   * @returns Observable of void
   */
  delete(id: string): Observable<void> {
    return this.firestoreAdapter.deleteDocument(this.collectionName, id);
  }

  /**
   * Watch the entire collection for real-time updates
   * @param constraints - Optional query constraints
   * @returns Observable stream of entities
   */
  watch(...constraints: QueryConstraint[]): Observable<T[]> {
    return this.collectionService.watchCollection<T>(this.collectionName, ...constraints);
  }

  /**
   * Watch a single entity for real-time updates
   * @param id - Entity ID
   * @returns Observable stream of entity
   */
  watchById(id: string): Observable<T | undefined> {
    return this.collectionService.watchDocument<T>(this.collectionName, id);
  }
}
