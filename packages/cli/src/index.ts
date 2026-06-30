import { runInit } from "./commands/init";
import { runStudio } from "./commands/studio";
import type { InsyteFramework } from "./utils/detect-framework";

function printHelp(): void {
  console.log(`
Usage: insyte [command] [options]

Commands:
  studio          Open Insyte Studio (local analytics browser)
  init            Scaffold Insyte in your project
  dev             Alias for \`insyte studio\`

Studio options:
  -p, --port      Port (default: 5555)
  --host          Host (default: 127.0.0.1)
  -d, --database  SQLite database path (default: .insyte/analytics.db)
  --no-open       Do not open the browser

Init options:
  --framework     next | react | vue | angular
  --force         Overwrite existing files

Examples:
  npx insyte studio
  npx insyte init --framework next
  npx insyte studio --port 5556

Install as dev dependency (recommended):
  bun add -d @insyte/cli @insyte/track
`);
}

function parseStudioArgs(args: string[]) {
  let port = 5555;
  let host = "127.0.0.1";
  let database: string | undefined;
  let open = true;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--port" || arg === "-p") {
      port = Number(args[i + 1]);
      i += 1;
    } else if (arg === "--host") {
      host = args[i + 1];
      i += 1;
    } else if (arg === "--database" || arg === "-d") {
      database = args[i + 1];
      i += 1;
    } else if (arg === "--no-open") {
      open = false;
    }
  }

  return { port, host, database, open };
}

function parseInitArgs(args: string[]) {
  let framework: InsyteFramework | undefined;
  let force = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--framework") {
      framework = args[i + 1] as InsyteFramework;
      i += 1;
    } else if (arg === "--force") {
      force = true;
    }
  }

  return { framework, force };
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return;
  }

  if (command === "studio" || command === "dev") {
    await runStudio(parseStudioArgs(rest));
    return;
  }

  if (command === "init") {
    await runInit(parseInitArgs(rest));
    return;
  }

  if (!command) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
