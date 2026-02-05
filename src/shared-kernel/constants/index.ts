/**
 * Shared Kernel - Global Constants
 * 
 * Constants and enums used across all bounded contexts.
 */

/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'Xuanwu',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * HTTP status codes
 * These are exported for use across the application
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * User roles
 * These are exported for use across the application
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}
