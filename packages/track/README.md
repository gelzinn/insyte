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

### Angular (plugin nativo)

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

## Providers built-in

| Provider | Função | Identificação |
|----------|--------|---------------|
| `googleAnalytics` | GA4 | ✅ |
| `mixpanel` | Mixpanel | ✅ |
| `posthog` | PostHog | ✅ |
| `segment` | Segment | ✅ |
| `amplitude` | Amplitude | ✅ |
| `plausible` | Plausible | ❌ |
| `heap` | Heap | ✅ |
| `rudderstack` | RudderStack | ✅ |
| `hotjar` | Hotjar | ✅ |
| `facebookPixel` | Meta Pixel | ❌ |
| `clarity` | Microsoft Clarity | ✅ |

## Consent / GDPR

Só inicializa providers após consentimento do usuário:

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
    facebookPixel({ pixelId: "123" }), // categoria marketing
  ],
});

// Após o usuário aceitar
analytics.grantConsent(["analytics", "marketing"]);
await analytics.init();
```

React inclui `<ConsentBanner />` e hook `useConsent()`.

## Provider customizado

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

| Export | Descrição |
|--------|-----------|
| `@insyte/track` | Core + consent + providers |
| `@insyte/track/react` | Provider, hooks, ConsentBanner |
| `@insyte/track/vue` | Plugin Vue 3 |
| `@insyte/track/angular` | `InsyteAnalyticsService`, `provideInsyteAnalytics` |
| `@insyte/track/next` | Middleware, script definitions, SSR helpers |
| `@insyte/track/next/client` | `<AnalyticsScripts />` com `next/script` |
| `@insyte/track/providers` | Apenas os providers |

## Licença

MIT
