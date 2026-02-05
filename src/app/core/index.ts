/**
 * Core Layer - Public API
 * 
 * This barrel file exports the public API of the core layer.
 * Only items exported here are accessible to other layers.
 */

// Application Configuration
export { appConfig } from './providers/app.config';
export { config as serverConfig } from './providers/app.config.server';

// Routes
export { routes } from './app.routes';
export { serverRoutes } from './app.routes.server';

// Auth
// export * from './auth';

// Interceptors
// export * from './interceptors';

// Providers
// export * from './providers';

// Error Handler
// export * from './error-handler';

// Services
// export * from './services';
