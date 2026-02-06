/**
 * User Domain Model
 * 
 * Represents a user entity in the system.
 * This is a pure domain model with no framework dependencies.
 * 
 * @remarks
 * - Aligned with Firebase Auth user structure
 * - Compatible with Next.js migration source data
 * - Framework-agnostic (DDD pure domain layer)
 */
export interface User {
  /**
   * Unique identifier for the user (Firebase Auth UID)
   */
  readonly id: string;

  /**
   * User's email address
   */
  readonly email: string;

  /**
   * User's display name
   * @nullable Can be null if not set by the user
   */
  readonly displayName: string | null;

  /**
   * URL to user's profile photo
   * @nullable Can be null if not set
   */
  readonly photoURL: string | null;

  /**
   * Timestamp when the user account was created
   */
  readonly createdAt: Date;
}
