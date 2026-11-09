import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En développement, les appels /api sont transmis au serveur Express.
    proxy: { '/api': 'http://localhost:4000' },
  },
});
