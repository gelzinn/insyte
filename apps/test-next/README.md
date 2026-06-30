# Analytics Test App (Next.js)

A Next.js 15 app to test and demonstrate the analytics library in a real environment.

## Features

- **Full dashboard**: Real-time analytics metrics
- **Automatic tracking**: Pageviews, time on page, traffic sources
- **Data simulation**: Button to generate test data
- **Demo pages**: Product and blog scenarios
- **Prisma integration**: Local SQLite database
- **API routes**: Endpoints to interact with the analytics library

## Project structure

```
apps/test-next/
├── prisma/
│   ├── schema.prisma
│   └── dev.db
├── src/
│   ├── app/
│   │   ├── api/analytics/
│   │   ├── blog/
│   │   ├── product/[id]/
│   │   └── page.tsx
│   └── middleware.ts
└── package.json
```

## Setup

```bash
cd apps/test-next
bun install
npx prisma generate
npx prisma db push
```

## Run

```bash
# From monorepo root
bun run dev:next

# Or from this directory
bun run dev
```

## Routes

- **Dashboard**: `http://localhost:3000`
- **Blog**: `http://localhost:3000/blog`
- **Products**: `http://localhost:3000/product/1`, `http://localhost:3000/product/2`

## API examples

```javascript
// Track a pageview
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'trackPageView',
    sessionId: 'session_123',
    url: 'https://example.com/page',
    title: 'Page Title',
    userAgent: navigator.userAgent
  })
})

// Get bounce rate
fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getBounceRate' })
})
```

## Environment

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXX"
```

## License

MIT
