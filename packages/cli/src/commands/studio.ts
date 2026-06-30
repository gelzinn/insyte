import { join } from "node:path";
import { startStudio } from "@insyte/studio";
import { openBrowser } from "../utils/open-browser";

export interface StudioCommandOptions {
  port?: number;
  host?: string;
  database?: string;
  open?: boolean;
  cwd?: string;
}

export async function runStudio(options: StudioCommandOptions = {}): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const port = options.port ?? 5555;
  const host = options.host ?? "127.0.0.1";
  const databasePath = options.database ?? join(cwd, ".insyte", "analytics.db");
  const shouldOpen = options.open ?? true;

  console.log("\n  Insyte Studio — local analytics browser\n");

  await startStudio({ port, host, databasePath });

  if (shouldOpen) {
    openBrowser(`http://${host}:${port}`);
  }
}
