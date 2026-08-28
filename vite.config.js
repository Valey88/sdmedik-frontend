import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import imageOptimizer from "vite-plugin-image-optimizer";
import compression from "vite-plugin-compression";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // imageOptimizer({
    //   png: { quality: 80 }, // Оптимизация PNG
    //   jpeg: { quality: 80 }, // Оптимизация JPEG
    //   webp: { quality: 80 }, // Конвертация в WebP
    // }),
    compression({
      algorithm: "brotliCompress",
    }),
  ],
  build: {
    outDir: "build", // Устанавливаем выходную директорию
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
