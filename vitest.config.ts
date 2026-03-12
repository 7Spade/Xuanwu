import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // Must be ordered most-specific first to avoid partial matches
      '@/shadcn-ui/lib/utils': path.resolve(__dirname, './src/lib-ui/shadcn-ui/utils/utils'),
      '@/shadcn-ui/hooks': path.resolve(__dirname, './src/lib-ui/shadcn-ui/hooks'),
      '@/shadcn-ui': path.resolve(__dirname, './src/lib-ui/shadcn-ui'),
      '@/lib-ui': path.resolve(__dirname, './src/lib-ui'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
