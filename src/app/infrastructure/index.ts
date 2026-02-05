/**
 * Infrastructure Layer - Public API
 * 
 * This barrel file exports the public API of the infrastructure layer.
 * Only items exported here are accessible to other layers.
 */

// Firestore services
export * from './persistence/firestore';
export * from './persistence/repositories';

// Firebase adapters
export * from './adapters/firebase';
