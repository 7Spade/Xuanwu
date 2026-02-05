/**
 * Shared Kernel - Public API
 * 
 * This barrel file exports the public API of the shared kernel.
 * This code is shared across all bounded contexts.
 * 
 * IMPORTANT: This layer must be framework-agnostic (Pure TypeScript).
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Guards
export * from './guards';
