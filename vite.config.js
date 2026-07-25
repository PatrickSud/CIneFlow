import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' garante que os caminhos dos assets funcionem em qualquer host
// (Vercel, Netlify, GitHub Pages em subpasta, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
});
