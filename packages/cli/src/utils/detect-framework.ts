import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type InsyteFramework = "next" | "react" | "vue" | "angular" | "unknown";

export function detectFramework(cwd = process.cwd()): InsyteFramework {
  const pkgPath = join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    return "unknown";
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (deps.next) return "next";
  if (deps["@angular/core"]) return "angular";
  if (deps.vue) return "vue";
  if (deps.react) return "react";

  if (existsSync(join(cwd, "next.config.ts")) || existsSync(join(cwd, "next.config.js"))) {
    return "next";
  }

  return "unknown";
}
