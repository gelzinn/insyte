# @insyte/track

Unified analytics integration for JavaScript projects — works with **React**, **Vue**, **Angular**, **Vite**, **Next.js**, and vanilla JS.

## Installation

```bash
npm install @insyte/track
# or
bun add @insyte/track
```

## Quick start

### Vanilla / Vite

```typescript
import { setupAnalytics, googleAnalytics, mixpanel } from "@insyte/track";

const analytics = await setupAnalytics({
  debug: import.meta.env.DEV,
  autoPageView: true,
  providers: [
    googleAnalytics({ measurementId: "G-XXXXXXXX" }),
    mixpanel({ token: "YOUR_TOKEN" }),
  ],
});

analytics.track("button_clicked", { label: "signup" });
```

### Next.js (App Router)

```tsx
// app/providers/analytics-provider.tsx
"use client";

import { AnalyticsProvider, ConsentBanner, googleAnalytics } from "@insyte/track/react";
import { createCustomProvider } from "@insyte/track";

export function AppAnalyticsProvider({ children }) {
  return (
    <AnalyticsProvider
      waitForConsent
      autoPageView
      consent={{ storage: "cookie", storageKey: "insyte-consent" }}
      providers={[googleAnalytics({ measurementId: process.env.NEXT_PUBLIC_GA_ID! })]}
    >
      {children}
      <ConsentBanner />
    </AnalyticsProvider>
  );
}
```

```tsx
// app/analytics-scripts.tsx
"use client";

import { AnalyticsScripts } from "@insyte/track/next/client";

export function AppAnalyticsScripts() {
  return (
    <AnalyticsScripts
      googleAnalytics={{ measurementId: process.env.NEXT_PUBLIC_GA_ID! }}
    />
  );
}
```

```typescript
// middleware.ts
import { createConsentMiddleware } from "@insyte/track/next";

export const middleware = createConsentMiddleware({
  cookieName: "insyte-consent",
  requiredCategories: ["analytics"],
});
```

### Vue 3

```typescript
import { createApp } from "vue";
import { createInsyteAnalyticsPlugin, googleAnalytics } from "@insyte/track/vue";

const app = createApp(App);
app.use(
  createInsyteAnalyticsPlugin({
    autoInit: true,
    autoPageView: true,
    providers: [googleAnalytics({ measurementId: "G-XXXXXXXX" })],
  }),
);
app.mount("#app");
```

### Angular (native plugin)

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideInsyteAnalytics, InsyteAnalyticsService } from "@insyte/track/angular";
import { googleAnalytics } from "@insyte/track";

bootstrapApplication(AppComponent, {
  providers: [
    provideInsyteAnalytics({
      autoInit: true,
      autoPageView: true,
      providers: [googleAnalytics({ measurementId: "G-XXXXXXXX" })],
    }),
  ],
});
```

```typescript
// signup.component.ts
import { Component, inject } from "@angular/core";
import { InsyteAnalyticsService } from "@insyte/track/angular";

@Component({ /* ... */ })
export class SignupComponent {
  private analytics = inject(InsyteAnalyticsService);

  onSignup() {
    this.analytics.track("signup_clicked", { plan: "pro" });
  }
}
```

## Built-in providers

| Provider | Service | User identification |
|----------|---------|---------------------|
| `googleAnalytics` | GA4 | Yes |
| `mixpanel` | Mixpanel | Yes |
| `posthog` | PostHog | Yes |
| `segment` | Segment | Yes |
| `amplitude` | Amplitude | Yes |
| `plausible` | Plausible | No |
| `heap` | Heap | Yes |
| `rudderstack` | RudderStack | Yes |
| `hotjar` | Hotjar | Yes |
| `facebookPixel` | Meta Pixel | No |
| `clarity` | Microsoft Clarity | Yes |
| `insyte` | Insyte Studio (local) | Yes |

## Local studio (Insyte Studio)

Send all events to a local dashboard during development — similar to Prisma Studio:

```typescript
import { insyte, googleAnalytics, setupAnalytics } from "@insyte/track";

await setupAnalytics({
  providers: [
    insyte({ studioUrl: "http://127.0.0.1:5555" }),
    googleAnalytics({ measurementId: "G-XXX" }),
  ],
});
```

Start the studio from the monorepo root:

```bash
bun run studio
```

See [`@insyte/studio`](../studio/README.md) for CLI options and API details.

## Consent / GDPR

Providers only initialize after user consent:

```typescript
import { setupAnalytics, googleAnalytics, facebookPixel } from "@insyte/track";

const analytics = await setupAnalytics({
  waitForConsent: true,
  consent: {
    storage: "cookie",
    storageKey: "insyte-consent",
    defaultConsent: { necessary: true, analytics: false, marketing: false },
  },
  providers: [
    googleAnalytics({ measurementId: "G-XXX" }),
    facebookPixel({ pixelId: "123" }), // marketing category
  ],
});

// After the user accepts
analytics.grantConsent(["analytics", "marketing"]);
await analytics.init();
```

React includes `<ConsentBanner />` and the `useConsent()` hook.

## Custom provider

```typescript
import { createCustomProvider, setupAnalytics } from "@insyte/track";

const myProvider = createCustomProvider({
  name: "my-backend",
  handlers: {
    track: (event, properties) =>
      fetch("/api/analytics", { method: "POST", body: JSON.stringify({ event, properties }) }),
  },
});

await setupAnalytics({ providers: [myProvider] });
```

## Exports

| Export | Description |
|--------|-------------|
| `@insyte/track` | Core + consent + providers |
| `@insyte/track/react` | Provider, hooks, ConsentBanner |
| `@insyte/track/vue` | Vue 3 plugin |
| `@insyte/track/angular` | `InsyteAnalyticsService`, `provideInsyteAnalytics` |
| `@insyte/track/next` | Middleware, script definitions, SSR helpers |
| `@insyte/track/next/client` | `<AnalyticsScripts />` with `next/script` |
| `@insyte/track/providers` | Providers only |

## License

MIT
