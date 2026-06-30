# @insyte/track

Biblioteca unificada para integrar analytics em projetos JavaScript — funciona com **React**, **Vue**, **Angular**, **Vite**, **Next.js** e vanilla JS.

## Instalação

```bash
npm install @insyte/track
# ou
bun add @insyte/track
```

## Setup rápido

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

import { AnalyticsProvider, googleAnalytics, posthog } from "@insyte/track/react";

export function AppAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider
      autoInit
      autoPageView
      debug={process.env.NODE_ENV === "development"}
      providers={[
        googleAnalytics({ measurementId: process.env.NEXT_PUBLIC_GA_ID! }),
        posthog({ apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY! }),
      ]}
    >
      {children}
    </AnalyticsProvider>
  );
}
```

```tsx
// app/layout.tsx
import { AppAnalyticsProvider } from "./providers/analytics-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppAnalyticsProvider>{children}</AppAnalyticsProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/signup-button.tsx
"use client";

import { useTrack } from "@insyte/track/react";

export function SignupButton() {
  const track = useTrack();

  return (
    <button onClick={() => track("signup_clicked", { plan: "pro" })}>
      Sign up
    </button>
  );
}
```

### Vue 3

```typescript
// main.ts
import { createApp } from "vue";
import { createInsyteAnalyticsPlugin, googleAnalytics } from "@insyte/track/vue";
import App from "./App.vue";

const app = createApp(App);

const analyticsPlugin = createInsyteAnalyticsPlugin({
  autoInit: true,
  autoPageView: true,
  providers: [googleAnalytics({ measurementId: "G-XXXXXXXX" })],
});

app.use(analyticsPlugin);
app.mount("#app");
```

### Angular

```typescript
// analytics.service.ts
import { Injectable } from "@angular/core";
import { setupAnalytics, googleAnalytics, type AnalyticsClient } from "@insyte/track";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  private client!: AnalyticsClient;

  async init() {
    this.client = await setupAnalytics({
      autoPageView: true,
      providers: [googleAnalytics({ measurementId: environment.gaId })],
    });
  }

  track(event: string, properties?: Record<string, unknown>) {
    this.client.track(event, properties);
  }
}
```

## Providers built-in

| Provider | Função | Identificação de usuário |
|----------|--------|--------------------------|
| `googleAnalytics` | GA4 | ✅ |
| `mixpanel` | Mixpanel | ✅ |
| `posthog` | PostHog | ✅ |
| `segment` | Segment | ✅ |
| `amplitude` | Amplitude | ✅ |
| `plausible` | Plausible | ❌ (privacy-first) |
| `facebookPixel` | Meta Pixel | ❌ |
| `clarity` | Microsoft Clarity | ✅ |

## Provider customizado

```typescript
import { createCustomProvider, setupAnalytics } from "@insyte/track";

const myProvider = createCustomProvider({
  name: "my-backend",
  debug: true,
  handlers: {
    init: () => console.log("ready"),
    track: (event, properties) => {
      fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify({ event, properties }),
      });
    },
    page: (properties) => {
      fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify({ type: "pageview", ...properties }),
      });
    },
    identify: (userId, traits) => {
      fetch("/api/analytics/identify", {
        method: "POST",
        body: JSON.stringify({ userId, traits }),
      });
    },
  },
});

await setupAnalytics({ providers: [myProvider] });
```

## API

```typescript
// Instância
analytics.track("event_name", { key: "value" });
analytics.page({ title: "Home" });
analytics.identify("user_123", { plan: "pro" });
analytics.reset();
analytics.setUserProperties({ company: "Acme" });

// Enviar só para providers específicos
analytics.track("purchase", { amount: 99 }, { providers: ["mixpanel"] });

// Helpers globais (após initAnalytics)
import { track, page, identify } from "@insyte/track";
track("clicked");
```

## Exports

- `@insyte/track` — core framework-agnostic
- `@insyte/track/react` — Provider, hooks
- `@insyte/track/vue` — plugin Vue 3
- `@insyte/track/providers` — apenas os providers

## Licença

MIT
