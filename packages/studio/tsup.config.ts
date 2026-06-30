import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    outDir: "dist",
    clean: true,
    sourcemap: true,
    dts: true,
    external: ["insyte", "hono", "@hono/node-server"],
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    outDir: "dist",
    clean: false,
    sourcemap: true,
    dts: false,
    banner: { js: "#!/usr/bin/env node" },
    external: ["insyte", "hono", "@hono/node-server"],
  },
]);
