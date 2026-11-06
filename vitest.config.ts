import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Needed so Vitest can resolve TypeScript path aliases used in src/
    extensions: ['.ts', '.tsx', '.js'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    // Use separate tsconfig that includes both src/ and tests/
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.ts'],
      reporter: ['text', 'lcov'],
    },
  },
});
