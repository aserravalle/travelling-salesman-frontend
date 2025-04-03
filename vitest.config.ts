import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // v8 provider for coverage
      reporter: ['text', 'html'], // Generate text and HTML reports
      reportsDirectory: './coverage', // Directory to store coverage reports
      include: ['src/lib/*.{ts,tsx}'], // Currently only tests the lib
      exclude: [
        'src/lib/__tests__/**/*',
        'src/lib/utils.ts',
        'src/lib/motion.ts',
      ], // Exclude test files and specific directories
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Match alias configuration from vite.config.ts
    },
  },
});