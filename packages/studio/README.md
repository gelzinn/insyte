# @insyte/studio

Local analytics engine and UI for Insyte Studio.

> **For most users:** install `@insyte/cli` and run `npx insyte studio` — same as `prisma studio`.

## Usage

```bash
bun add -d @insyte/cli
npx insyte studio
```

## Programmatic API

```ts
import { startStudio } from "@insyte/studio";

await startStudio({ port: 5555, databasePath: ".insyte/analytics.db" });
```

## Ingest API

```
POST /ingest
GET  /api/overview
GET  /api/pageviews
GET  /api/events
GET  /api/traffic
GET  /api/live
GET  /api/status
```

See `@insyte/cli` README for the full developer workflow.
