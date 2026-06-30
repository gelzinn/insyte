import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { setupDatabase } from "insyte";
import { WebAnalyticsEngine } from "insyte";
import type { AnalyticsConfig } from "insyte";

export interface StudioEngineOptions {
  databasePath: string;
}

let engineInstance: WebAnalyticsEngine | null = null;
let databasePath = "";

export function getDatabasePath(): string {
  return databasePath;
}

export async function createStudioEngine(options: StudioEngineOptions): Promise<WebAnalyticsEngine> {
  databasePath = resolve(options.databasePath);
  mkdirSync(dirname(databasePath), { recursive: true });

  const sqliteUrl = `sqlite://${databasePath}`;
  await setupDatabase("sqlite", sqliteUrl);

  const config: AnalyticsConfig = {
    database: { type: "sqlite", url: sqliteUrl },
    tracking: {
      sessionTimeout: 30,
      enableRealTime: true,
      enableGeolocation: false,
      enableUTMTracking: true,
      excludedPaths: ["/api", "/ingest", "/favicon.ico"],
    },
  };

  const engine = new WebAnalyticsEngine(config);
  await engine.connect();
  engineInstance = engine;
  return engine;
}

export function getStudioEngine(): WebAnalyticsEngine {
  if (!engineInstance) {
    throw new Error("Studio engine is not initialized");
  }
  return engineInstance;
}

export async function shutdownStudioEngine(): Promise<void> {
  if (engineInstance) {
    await engineInstance.disconnect();
    engineInstance = null;
  }
}
