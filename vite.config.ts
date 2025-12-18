
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Shim process.env for the browser environment as required by the prompt
    'process.env': {
      API_KEY: JSON.stringify(process.env.VITE_API_KEY || '')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
