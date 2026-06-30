#!/usr/bin/env node
import { execSync } from "node:child_process";
import { join } from "node:path";
import { startStudio } from "./server/create-server";

function parseArgs(argv: string[]) {
  let port = 5555;
  let host = "127.0.0.1";
  let databasePath = join(process.cwd(), ".insyte", "analytics.db");
  let openBrowser = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--port" || arg === "-p") {
      port = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--host") {
      host = argv[i + 1];
      i += 1;
    } else if (arg === "--database" || arg === "-d") {
      databasePath = argv[i + 1];
      i += 1;
    } else if (arg === "--no-open") {
      openBrowser = false;
    }
  }

  return { port, host, databasePath, openBrowser };
}

async function main() {
  const { port, host, databasePath, openBrowser } = parseArgs(process.argv.slice(2));
  await startStudio({ port, host, databasePath });

  if (openBrowser) {
    const url = `http://${host}:${port}`;
    try {
      if (process.platform === "darwin") {
        execSync(`open ${url}`);
      } else if (process.platform === "win32") {
        execSync(`start ${url}`, { shell: "cmd.exe" });
      } else {
        execSync(`xdg-open ${url}`);
      }
    } catch {
      console.log(`Open ${url} in your browser`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
