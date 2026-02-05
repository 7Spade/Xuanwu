import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup-tests.ts'],
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.angular', 'coverage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.angular/',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/testing/**',
        '**/*.d.ts',
        'src/main.ts',
        'src/main.server.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@app': resolve(__dirname, './src/app'),
      '@core': resolve(__dirname, './src/app/core'),
      '@shared': resolve(__dirname, './src/app/shared'),
      '@infrastructure': resolve(__dirname, './src/app/infrastructure'),
      '@features': resolve(__dirname, './src/app/features'),
      '@domain': resolve(__dirname, './src/app/domain'),
      '@application': resolve(__dirname, './src/app/application'),
      '@shared-kernel': resolve(__dirname, './src/shared-kernel'),
      '@environments': resolve(__dirname, './src/environments'),
      '@testing': resolve(__dirname, './src/testing'),
    },
  },
});
