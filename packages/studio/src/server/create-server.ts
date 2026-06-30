import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createStudioEngine, getDatabasePath, getStudioEngine } from "./engine";
import { handleIngest, type IngestPayload } from "./ingest";

export interface StudioServerOptions {
  port?: number;
  host?: string;
  databasePath?: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

function getUiRoot(): string | null {
  const candidates = [
    join(__dirname, "../ui"),
    join(__dirname, "../../dist/ui"),
    join(process.cwd(), "dist/ui"),
    join(process.cwd(), "packages/studio/dist/ui"),
  ];

  try {
    const require = createRequire(import.meta.url);
    const studioPackageJson = require.resolve("@insyte/studio/package.json");
    candidates.unshift(join(dirname(studioPackageJson), "dist/ui"));
  } catch {
    // @insyte/studio not resolvable from this context
  }

  for (const candidate of candidates) {
    if (existsSync(join(candidate, "index.html"))) {
      return candidate;
    }
  }

  return null;
}

export async function createStudioApp(options: StudioServerOptions = {}) {
  const databasePath = options.databasePath ?? join(process.cwd(), ".insyte", "analytics.db");
  await createStudioEngine({ databasePath });

  const app = new Hono();
  app.use("*", cors());

  app.get("/api/health", (c) =>
    c.json({
      status: "ok",
      database: getDatabasePath(),
    }),
  );

  app.get("/api/status", async (c) => {
    const engine = getStudioEngine();
    const overview = await engine.getOverview();
    return c.json({
      status: "ok",
      database: getDatabasePath(),
      counts: {
        pageviews: overview.totalPageviews,
        events: overview.totalEvents,
        sessions: overview.uniqueSessions,
        users: overview.uniqueUsers,
      },
    });
  });

  app.get("/api/overview", async (c) => {
    const engine = getStudioEngine();
    const overview = await engine.getOverview();
    return c.json(overview);
  });

  app.get("/api/pageviews", async (c) => {
    const engine = getStudioEngine();
    const limit = Number(c.req.query("limit") ?? 50);
    const offset = Number(c.req.query("offset") ?? 0);
    const [recent, aggregated] = await Promise.all([
      engine.getRecentPageviews(limit, offset),
      engine.getPageAnalytics(),
    ]);
    return c.json({ recent, aggregated });
  });

  app.get("/api/events", async (c) => {
    const engine = getStudioEngine();
    const limit = Number(c.req.query("limit") ?? 50);
    const offset = Number(c.req.query("offset") ?? 0);
    const events = await engine.getRecentEvents(limit, offset);
    return c.json({ events });
  });

  app.get("/api/traffic", async (c) => {
    const engine = getStudioEngine();
    const [sources, campaigns] = await Promise.all([
      engine.getTrafficSources(),
      engine.getCampaignAnalytics(),
    ]);
    return c.json({ sources, campaigns });
  });

  app.get("/api/live", async (c) => {
    const engine = getStudioEngine();
    const live = await engine.getRealTimeAnalytics();
    return c.json(live);
  });

  app.get("/api/bounce-rate", async (c) => {
    const engine = getStudioEngine();
    const bounceRate = await engine.getBounceRate();
    return c.json(bounceRate);
  });

  app.post("/ingest", async (c) => {
    const payload = (await c.req.json()) as IngestPayload;
    const engine = getStudioEngine();
    const result = await handleIngest(engine, payload);
    return c.json(result);
  });

  app.post("/api/query", async (c) => {
    const body = await c.req.json();
    const { action } = body as { action: string };
    const engine = getStudioEngine();

    switch (action) {
      case "getBounceRate":
        return c.json(await engine.getBounceRate());
      case "getPageAnalytics":
        return c.json(await engine.getPageAnalytics());
      case "getTrafficSources":
        return c.json(await engine.getTrafficSources());
      case "getCampaignAnalytics":
        return c.json(await engine.getCampaignAnalytics());
      case "getRealTimeAnalytics":
        return c.json(await engine.getRealTimeAnalytics());
      case "trackPageView":
        await handleIngest(engine, {
          type: "pageview",
          sessionId: body.sessionId,
          userId: body.userId,
          url: body.url,
          referrer: body.referrer,
          userAgent: body.userAgent,
          ip: body.ip,
          utmParams: body.utmParams,
        });
        return c.json({ success: true });
      case "trackPageExit":
        await handleIngest(engine, {
          type: "page_exit",
          sessionId: body.sessionId,
          url: body.url,
          duration: body.duration,
        });
        return c.json({ success: true });
      default:
        return c.json({ error: "Unknown action" }, 400);
    }
  });

  const uiRoot = getUiRoot();

  if (uiRoot) {
    app.use("/assets/*", serveStatic({ root: uiRoot }));
  }

  app.get("*", async (c) => {
    const path = c.req.path;
    if (path.startsWith("/api") || path.startsWith("/ingest")) {
      return c.notFound();
    }

    if (!uiRoot) {
      return c.text("Insyte Studio UI not built. Run: bun run build --filter=@insyte/studio", 503);
    }

    const filePath = join(uiRoot, "index.html");
    const html = readFileSync(filePath, "utf-8");
    return c.html(html);
  });

  return app;
}

export async function startStudio(options: StudioServerOptions = {}) {
  const port = options.port ?? 5555;
  const host = options.host ?? "127.0.0.1";
  const app = await createStudioApp(options);

  serve({ fetch: app.fetch, port, hostname: host }, (info) => {
    console.log(`\n  Insyte Studio running at http://${host}:${info.port}\n`);
    console.log(`  Database: ${getDatabasePath()}\n`);
    console.log(`  Ingest endpoint: http://${host}:${info.port}/ingest\n`);
  });

  return { port, host };
}
