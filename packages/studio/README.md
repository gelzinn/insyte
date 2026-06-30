# @insyte/studio

Local analytics dashboard for Insyte — similar to Prisma Studio or Drizzle Studio.

Browse unified, standardized analytics data from your apps in development. Events are collected via the `insyte()` provider from `@insyte/track` and stored in a local SQLite database.

## Quick start

```bash
# From the monorepo root
bun run studio
```

This starts the studio at **http://127.0.0.1:5555** and opens it in your browser. The database is stored at `.insyte/analytics.db` in your project root.

## Wire your app

Add the `insyte()` collector to your `@insyte/track` setup:

```ts
import { insyte } from "@insyte/track";

const analytics = createAnalytics({
  providers: [
    insyte({ studioUrl: "http://127.0.0.1:5555" }),
    // ...other providers (GA4, Mixpanel, etc.)
  ],
});
```

Demo apps in `apps/` enable this automatically in development.

### Environment variables

| App | Variable | Default (dev) |
|-----|----------|---------------|
| Next.js | `NEXT_PUBLIC_INSYTE_STUDIO_URL` | `http://127.0.0.1:5555` |
| Vite (React/Vue) | `VITE_INSYTE_STUDIO_URL` | `http://127.0.0.1:5555` |
| Angular | `NG_APP_INSYTE_STUDIO_URL` | `http://127.0.0.1:5555` |

## CLI options

```bash
insyte-studio --port 5555 --database ./.insyte/analytics.db --no-open
```

| Flag | Description |
|------|-------------|
| `-p, --port` | HTTP port (default: 5555) |
| `-d, --database` | SQLite database path |
| `--host` | Bind host (default: 127.0.0.1) |
| `--no-open` | Do not open the browser |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ingest` | POST | Unified event ingestion |
| `/api/overview` | GET | Summary metrics |
| `/api/pageviews` | GET | Recent + aggregated pageviews |
| `/api/events` | GET | Recent custom events |
| `/api/traffic` | GET | Sources and campaigns |
| `/api/live` | GET | Real-time activity |

### Ingest payload

```json
{
  "type": "pageview",
  "sessionId": "abc-123",
  "url": "http://localhost:5173/",
  "title": "Home",
  "referrer": "",
  "userAgent": "Mozilla/5.0..."
}
```

Supported types: `pageview`, `page_exit`, `track`, `identify`.

## Development workflow

```bash
# Terminal 1 — studio
bun run studio

# Terminal 2 — demo app
bun run dev:react   # or dev:next, dev:vue, dev:angular
```

Accept analytics cookies in the demo app, then interact with the UI. Data appears in Insyte Studio within seconds.

## Build

```bash
bun run build:studio
```
