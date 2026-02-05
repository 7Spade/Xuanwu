/**
 * Global test setup file
 * Runs before all test files
 */

import { vi } from 'vitest';

// Mock browser globals for SSR safety
/* eslint-disable no-undef */
if (typeof window === 'undefined') {
  (global as any).window = {};
}

// Suppress console errors/warnings in tests unless explicitly enabled
if (!process.env['VITEST_SHOW_CONSOLE']) {
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
  };
}
/* eslint-enable no-undef */

// Set test environment
process.env['NODE_ENV'] = 'test';
