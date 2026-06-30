import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: ".",
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/ui"),
    },
  },
  build: {
    outDir: "dist/ui",
    emptyOutDir: true,
  },
  server: {
    port: 5556,
    proxy: {
      "/api": "http://localhost:5555",
      "/ingest": "http://localhost:5555",
    },
  },
});
