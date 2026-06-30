import { createCustomProvider, insyte } from "@insyte/track";
import { AnalyticsProvider, ConsentBanner } from "@insyte/track/react";

const demoProvider = createCustomProvider({
  name: "demo-console",
  debug: import.meta.env.DEV,
  handlers: {
    track: (event, properties) => {
      console.info("[@insyte/track demo]", event, properties);
    },
    page: (properties) => {
      console.info("[@insyte/track demo] pageview", properties);
    },
  },
});

const studioUrl =
  import.meta.env.VITE_INSYTE_STUDIO_URL ??
  (import.meta.env.DEV ? "http://127.0.0.1:5555" : undefined);

const providers = [demoProvider];

if (studioUrl) {
  providers.push(insyte({ studioUrl, debug: import.meta.env.DEV }));
}

export function AppAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider
      autoInit={false}
      autoPageView
      waitForConsent
      debug={import.meta.env.DEV}
      consent={{
        storage: "localStorage",
        storageKey: "insyte-consent",
        defaultConsent: { necessary: true, analytics: false, marketing: false },
      }}
      providers={providers}
    >
      {children}
      <ConsentBanner title="Analytics cookies" />
    </AnalyticsProvider>
  );
}
