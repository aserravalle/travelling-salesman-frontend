// filepath: /C:/git/travelling-salesman-frontend/project/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  }
});