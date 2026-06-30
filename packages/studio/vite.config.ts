import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  base: "/",
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
