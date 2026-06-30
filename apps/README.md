# Test apps — @insyte/track

Minimal demos to validate integration in each framework.

| App | Framework | Port | Command |
|-----|-----------|------|---------|
| `test-next` | Next.js 15 | 3000 | `bun run dev:next` |
| `test-react` | React + Vite | 5173 | `bun run dev:react` |
| `test-vue` | Vue 3 + Vite | 5174 | `bun run dev:vue` |
| `test-angular` | Angular 19 | 4200 | `bun run dev:angular` |

## Quick start

```bash
bun install
bun run build:lib

# Terminal 1 — Insyte Studio (like prisma studio)
bun run studio

# Terminal 2 — demo apps
bun run dev:apps
```

## SDK setup in demos

Each demo uses the simplified Insyte API:

```tsx
import { InsyteProvider } from "@insyte/track/react";

<InsyteProvider autoPageView>{children}</InsyteProvider>
```

In development, events flow to Studio automatically (`INSYTE_DEV=true` by default).

## Environment variables

```env
INSYTE_DEV=true
INSYTE_STUDIO_URL=http://127.0.0.1:5555
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX   # optional
```

## Scaffold your own project

```bash
npx insyte init --framework next
```
