import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': resolve(__dirname, './src/core'),
      '@browser': resolve(__dirname, './src/browser'),
      '@d3-app': resolve(__dirname, './src/d3-app'),
      '@react-app': resolve(__dirname, './src/react-app'),
    },
  },
  build: {
    lib: {
      entry: {
        core: resolve(__dirname, 'src/core/index.ts'),
        browser: resolve(__dirname, 'src/browser/index.ts'),
      },
      name: 'LM2596Calculator',
      formats: ['es', 'umd'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'd3'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          d3: 'd3',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
} as any);  // Type workaround for Vite/Vitest config merge
