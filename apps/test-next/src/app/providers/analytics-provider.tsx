"use client";

import { createCustomProvider, googleAnalytics } from "@insyte/track";
import { AnalyticsProvider, ConsentBanner } from "@insyte/track/react";

const demoProvider = createCustomProvider({
  name: "demo-console",
  debug: process.env.NODE_ENV === "development",
  handlers: {
    track: (event, properties) => {
      console.info("[demo analytics]", event, properties);
    },
    page: (properties) => {
      console.info("[demo analytics] pageview", properties);
    },
  },
});

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function AppAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const providers = [demoProvider];

  if (gaMeasurementId) {
    providers.unshift(
      googleAnalytics({
        measurementId: gaMeasurementId,
        sendPageView: false,
      }),
    );
  }

  return (
    <AnalyticsProvider
      autoInit={false}
      autoPageView
      waitForConsent
      debug={process.env.NODE_ENV === "development"}
      consent={{
        storage: "cookie",
        storageKey: "insyte-consent",
        defaultConsent: { necessary: true, analytics: false, marketing: false },
      }}
      providers={providers}
    >
      {children}
      <ConsentBanner />
    </AnalyticsProvider>
  );
}
