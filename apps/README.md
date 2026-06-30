# Apps de teste — @insyte/track

Demos mínimas para validar a integração em cada framework.

| App | Framework | Porta | Comando |
|-----|-----------|-------|---------|
| `test-next` | Next.js 15 | 3000 | `bun run dev:next` |
| `test-react` | React + Vite | 5173 | `bun run dev:react` |
| `test-vue` | Vue 3 + Vite | 5174 | `bun run dev:vue` |
| `test-angular` | Angular 19 | 4200 | `bun run dev:angular` |

## Rodar todas

```bash
bun install
bun run build:lib
bun run dev:apps
```

## O que cada demo faz

- Provider de console (`demo-console`) para ver eventos no DevTools
- Banner de consentimento (GDPR)
- Botão para disparar evento `demo_button_clicked`
- Pageview automático após aceitar cookies

## Variáveis opcionais

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
```
