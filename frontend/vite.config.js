import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: {
    port: 5173,
    open: true,
    // When the Express backend is running locally, uncomment this proxy and
    // set VITE_API_URL="/api" in .env so cookies/sessions work same-origin.
    // proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
