# Analytics Monorepo

A monorepo containing a full analytics library and demo apps for multiple frameworks. The project uses **bun** as the package manager.

## Project structure

```
analytics-monorepo/
├── packages/
│   ├── analytics/              # Server-side analytics library
│   └── track/                  # Client-side @insyte/track
├── apps/
│   ├── test-next/              # Next.js demo
│   ├── test-react/             # React + Vite demo
│   ├── test-vue/               # Vue 3 + Vite demo
│   ├── test-angular/           # Angular 19 demo
│   └── README.md
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- [bun](https://bun.sh/)

### Setup

```bash
# Install dependencies
bun install

# Build libraries
bun run build:lib

# Build demo apps
bun run build:apps

# Run a specific demo
bun run dev:next      # http://localhost:3000
bun run dev:react     # http://localhost:5173
bun run dev:vue       # http://localhost:5174
bun run dev:angular   # http://localhost:4200

# Run all demos
bun run dev:apps
```

## Server-side analytics library

### Features

- **Page view tracking**: Monitor page views
- **Session analysis**: Smart session management
- **Traffic detection**: Organic, paid, social, direct
- **UTM campaign analysis**: Marketing parameters
- **Bounce rate**: Exit rate metrics
- **Time on page**: Engagement analysis
- **Multi-database support**: SQLite, PostgreSQL, MySQL, MongoDB

### Basic usage

```typescript
import { WebAnalyticsEngine } from "analytics";

const analytics = new WebAnalyticsEngine({
  database: {
    type: "sqlite",
    url: "file:./analytics.db",
  },
  tracking: {
    sessionTimeout: 30,
    enableRealTime: true,
    enableUTMTracking: true,
  },
});

await analytics.connect();

await analytics.trackPageView({
  sessionId: "session_123",
  url: "https://example.com/page",
  title: "Page Title",
  userAgent: navigator.userAgent,
});

const bounceRate = await analytics.getBounceRate();
const pageAnalytics = await analytics.getPageAnalytics();
```

## @insyte/track — Client-side provider integration

Integrate **Google Analytics**, **Mixpanel**, **PostHog**, **Segment**, **Amplitude**, **Plausible**, **Facebook Pixel**, **Microsoft Clarity**, **Hotjar**, **Heap**, **RudderStack**, and **custom providers** in any JavaScript app.

Works with React, Vue, Angular, Vite, Next.js, and vanilla JS.

```typescript
import { setupAnalytics, googleAnalytics, mixpanel } from "@insyte/track";

await setupAnalytics({
  autoPageView: true,
  providers: [
    googleAnalytics({ measurementId: "G-XXXXXXXX" }),
    mixpanel({ token: "YOUR_TOKEN" }),
  ],
});
```

Full documentation: [`packages/track/README.md`](packages/track/README.md)

## Next.js demo app

The demo app shows how to integrate the library in a real project.

```bash
bun run dev:next
bun run build:app
bun run start:app
```

### Routes

- **`/`** — Analytics dashboard
- **`/blog`** — Blog page with tracking
- **`/product/[id]`** — Dynamic product pages
- **`/api/analytics`** — Analytics API endpoints

## Development

```bash
bun run build           # Build all packages
bun run dev             # Dev mode for all packages
bun run lint            # Lint all packages
bun run type-check      # Type check

bun run build:lib       # Build libraries
bun run dev:lib         # Dev libraries
```

### Adding features

**Library:** add code in `packages/analytics/src/` or `packages/track/src/`, update exports, run `bun run build:lib`.

**Demo apps:** add pages under `apps/test-*/`, run the matching dev script.

## Database (Next.js demo)

```bash
cd apps/test-next
npx prisma studio
npx prisma db push
```

## Environment variables

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXX"
```

## Roadmap

- [ ] User authentication
- [ ] Customizable dashboards
- [x] Google Analytics integration (`@insyte/track`)
- [ ] Data export
- [ ] Automated tests
- [ ] Admin interface
- [ ] Multi-site / tenant support

## Contributing

1. Fork the project
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Open a pull request

## License

MIT License — see LICENSE for details.
