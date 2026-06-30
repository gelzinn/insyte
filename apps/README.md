# Test apps — @insyte/track

Minimal demos to validate integration in each framework.

| App | Framework | Port | Command |
|-----|-----------|------|---------|
| `test-next` | Next.js 15 | 3000 | `bun run dev:next` |
| `test-react` | React + Vite | 5173 | `bun run dev:react` |
| `test-vue` | Vue 3 + Vite | 5174 | `bun run dev:vue` |
| `test-angular` | Angular 19 | 4200 | `bun run dev:angular` |

## Run all demos

```bash
bun install
bun run build:lib   # required on first clone — builds insyte, track, and studio
bun run dev:apps
```

For studio + apps together:

```bash
bun run build:lib
bun run dev         # or: bun run studio & bun run dev:apps
```

## What each demo does

- Console provider (`demo-console`) — events appear in DevTools
- **Insyte Studio collector** — events sent to local studio in dev (`http://127.0.0.1:5555`)
- Consent banner (GDPR)
- Button to fire `demo_button_clicked` event
- Auto pageview after accepting cookies

## Local analytics studio

```bash
# Terminal 1
bun run studio

# Terminal 2
bun run dev:react   # or dev:next, dev:vue, dev:angular
```

Open http://127.0.0.1:5555, accept cookies in the demo app, and browse unified analytics.

## Optional environment variables

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
VITE_INSYTE_STUDIO_URL=http://127.0.0.1:5555
NEXT_PUBLIC_INSYTE_STUDIO_URL=http://127.0.0.1:5555
```
