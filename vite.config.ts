import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    testTimeout: 20000,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reportsDirectory: './.coverage',
      reporter: ['lcov', 'json', 'json-summary'],
    },
  },
});
