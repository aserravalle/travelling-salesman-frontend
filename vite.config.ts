import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  server: {
    host: "::",
    port: Number(process.env.PORT) || 8080,
  },
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    allowedHosts: [process.env.VITE_ALLOWED_HOSTS || 'localhost:8080']
  }
});
