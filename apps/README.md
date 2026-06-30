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
bun run build:lib
bun run dev:apps
```

## What each demo does

- Console provider (`demo-console`) — events appear in DevTools
- Consent banner (GDPR)
- Button to fire `demo_button_clicked` event
- Auto pageview after accepting cookies

## Optional environment variables

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
```
