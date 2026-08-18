import { defineConfig } from 'vitest/config';
import path from 'node:path';
import fs from 'node:fs';

const SHARED_DIR = path.resolve(__dirname, '../shared/');

export default defineConfig({
  plugins: [
    {
      name: 'vite-plugin-shared',
      enforce: 'pre',
      resolveId(source: string) {
        if (!source.startsWith('shared/')) return null;
        const candidate = path.join(SHARED_DIR, source.slice('shared/'.length));
        if (fs.existsSync(candidate)) return candidate;
        if (fs.existsSync(candidate + '.ts')) return candidate + '.ts';
        if (fs.existsSync(candidate + '.tsx')) return candidate + '.tsx';
        if (fs.existsSync(path.join(candidate, 'index.ts'))) return path.join(candidate, 'index.ts');
        return candidate;
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist'],
    testTimeout: 20_000,
  },
});