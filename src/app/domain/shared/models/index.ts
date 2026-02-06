/**
 * Domain Models Barrel Export
 * 
 * Exports all shared domain models.
 * This is the public API for domain models.
 * 
 * @remarks
 * All domain models are pure TypeScript interfaces with no framework dependencies.
 * They represent the core business entities of the system.
 */

export type { User } from './user.model';
export type { Organization } from './organization.model';
export type { Workspace } from './workspace.model';
