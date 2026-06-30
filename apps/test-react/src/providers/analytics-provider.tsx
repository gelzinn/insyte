import { createCustomProvider } from "@insyte/track";
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
      providers={[demoProvider]}
    >
      {children}
      <ConsentBanner title="Cookies de analytics" />
    </AnalyticsProvider>
  );
}
