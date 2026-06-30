import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "react/index": "src/react/index.tsx",
    "vue/index": "src/vue/index.ts",
    "angular/index": "src/angular/index.ts",
    "next/index": "src/next/index.ts",
    "next/client": "src/next/client.tsx",
    "providers/index": "src/providers/index.ts",
  },
  format: ["cjs", "esm"],
  outDir: "dist",
  clean: true,
  sourcemap: true,
  dts: true,
  minify: true,
  external: ["react", "vue", "@angular/core", "next", "next/script", "next/server"],
  treeshake: true,
});
