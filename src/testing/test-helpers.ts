/**
 * Test helper utilities
 * Common testing functions and utilities
 */

import { signal, Signal } from '@angular/core';
import { vi } from 'vitest';

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout exceeded');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Wait for a signal to have a specific value
 */
export async function waitForSignal<T>(
  sig: Signal<T>,
  expectedValue: T,
  timeout = 5000
): Promise<void> {
  await waitFor(() => sig() === expectedValue, timeout);
}

/**
 * Create a mock signal for testing
 */
export function createMockSignal<T>(initialValue: T): Signal<T> {
  return signal(initialValue);
}

/**
 * Delay helper for async tests
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock environment object
 */
export const mockEnvironment = {
  production: false,
  firebase: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    databaseURL: 'https://test.firebaseio.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  },
};

/**
 * SSR-safe test helper
 * Checks if code is running in browser context
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Create a spy that can be used to track function calls
 */
export function createSpy<T extends (...args: unknown[]) => unknown>(
  implementation?: T
) {
  const spy = vi.fn(implementation);
  return spy;
}
