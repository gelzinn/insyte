import { execSync } from "node:child_process";

export function openBrowser(url: string): void {
  try {
    if (process.platform === "darwin") {
      execSync(`open "${url}"`);
    } else if (process.platform === "win32") {
      execSync(`start "" "${url}"`, { shell: "cmd.exe" });
    } else {
      execSync(`xdg-open "${url}"`);
    }
  } catch {
    console.log(`\n  Open ${url} in your browser\n`);
  }
}
