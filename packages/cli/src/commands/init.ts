import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { detectFramework, type InsyteFramework } from "../utils/detect-framework";

const ENV_EXAMPLE = `# Insyte — local analytics (enabled automatically in development)
INSYTE_DEV=true
INSYTE_STUDIO_URL=http://127.0.0.1:5555

# Optional: production API key (future hosted ingest)
# INSYTE_KEY=ins_xxxxxxxx
`;

const TEMPLATES: Record<InsyteFramework, { files: Array<{ path: string; content: string }> }> = {
  next: {
    files: [
      {
        path: "lib/insyte.ts",
        content: `import { Insyte } from "@insyte/track";

export const analytics = new Insyte();
`,
      },
      {
        path: "app/providers/insyte-provider.tsx",
        content: `"use client";

import { InsyteProvider } from "@insyte/track/react";

export function AppInsyteProvider({ children }: { children: React.ReactNode }) {
  return <InsyteProvider autoPageView>{children}</InsyteProvider>;
}
`,
      },
    ],
  },
  react: {
    files: [
      {
        path: "src/lib/insyte.ts",
        content: `import { Insyte } from "@insyte/track";

export const analytics = new Insyte();
`,
      },
      {
        path: "src/providers/insyte-provider.tsx",
        content: `import { InsyteProvider } from "@insyte/track/react";

export function AppInsyteProvider({ children }: { children: React.ReactNode }) {
  return <InsyteProvider autoPageView>{children}</InsyteProvider>;
}
`,
      },
    ],
  },
  vue: {
    files: [
      {
        path: "src/lib/insyte.ts",
        content: `import { Insyte } from "@insyte/track";

export const analytics = new Insyte();
`,
      },
      {
        path: "src/insyte.ts",
        content: `import { createInsytePlugin } from "@insyte/track/vue";

export const insytePlugin = createInsytePlugin({ autoPageView: true });
`,
      },
    ],
  },
  angular: {
    files: [
      {
        path: "src/app/insyte.config.ts",
        content: `import { provideInsyte } from "@insyte/track/angular";

export const insyteProviders = provideInsyte({ autoPageView: true });
`,
      },
    ],
  },
  unknown: {
    files: [
      {
        path: "insyte.ts",
        content: `import { Insyte } from "@insyte/track";

export const analytics = new Insyte();

await analytics.init();
`,
      },
    ],
  },
};

function writeFileSafe(cwd: string, relativePath: string, content: string, force: boolean): boolean {
  const fullPath = join(cwd, relativePath);
  if (existsSync(fullPath) && !force) {
    console.log(`  skip  ${relativePath} (already exists)`);
    return false;
  }

  mkdirSync(join(fullPath, ".."), { recursive: true });
  writeFileSync(fullPath, content, "utf-8");
  console.log(`  create ${relativePath}`);
  return true;
}

export interface InitOptions {
  framework?: InsyteFramework;
  force?: boolean;
  cwd?: string;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const framework = options.framework ?? detectFramework(cwd);
  const force = options.force ?? false;

  console.log(`\n  Insyte init — framework: ${framework}\n`);

  writeFileSafe(cwd, ".env.example", ENV_EXAMPLE, force);

  const template = TEMPLATES[framework];
  for (const file of template.files) {
    writeFileSafe(cwd, file.path, file.content, force);
  }

  console.log(`
  Next steps:
    1. bun add @insyte/track
    2. bun add -d @insyte/cli
    3. cp .env.example .env.local   # or .env
    4. Wire the provider into your app root
    5. npx insyte studio            # browse events locally

  Docs: https://github.com/gelzinn/insyte
`);
}
