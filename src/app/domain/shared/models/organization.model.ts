/**
 * Organization Domain Model
 * 
 * Represents an organization entity in the system.
 * Organizations are the top-level grouping for workspaces and members.
 * 
 * @remarks
 * - Pure domain model with no framework dependencies
 * - Compatible with Next.js migration source data
 * - Firestore document structure
 */
export interface Organization {
  /**
   * Unique identifier for the organization
   */
  readonly id: string;

  /**
   * Organization name
   */
  readonly name: string;

  /**
   * Organization description
   */
  readonly description: string;

  /**
   * User ID of the organization owner
   */
  readonly ownerId: string;

  /**
   * Array of user IDs who are members of the organization
   * @immutable Use ReadonlyArray to prevent mutations
   */
  readonly memberIds: ReadonlyArray<string>;

  /**
   * Array of user IDs who are administrators of the organization
   * @immutable Use ReadonlyArray to prevent mutations
   */
  readonly adminIds: ReadonlyArray<string>;

  /**
   * Timestamp when the organization was created
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the organization was last updated
   */
  readonly updatedAt: Date;
}
