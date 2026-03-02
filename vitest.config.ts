import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // globals: false (default) — test helpers (describe/it/expect) must be
    // explicitly imported in each test file. This keeps imports explicit and
    // avoids polluting the global namespace, which is preferable in a
    // TypeScript project where unused globals are invisible to the type checker.
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
