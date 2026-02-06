/**
 * Workspace Domain Model
 * 
 * Represents a workspace entity in the system.
 * Workspaces belong to organizations and contain projects/resources.
 * 
 * @remarks
 * - Pure domain model with no framework dependencies
 * - Compatible with Next.js migration source data
 * - Firestore document structure
 */
export interface Workspace {
  /**
   * Unique identifier for the workspace
   */
  readonly id: string;

  /**
   * Workspace name
   */
  readonly name: string;

  /**
   * Workspace description
   */
  readonly description: string;

  /**
   * ID of the organization this workspace belongs to
   */
  readonly orgId: string;

  /**
   * Array of user IDs who are members of the workspace
   * @immutable Use ReadonlyArray to prevent mutations
   */
  readonly memberIds: ReadonlyArray<string>;

  /**
   * Timestamp when the workspace was created
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the workspace was last updated
   */
  readonly updatedAt: Date;
}
