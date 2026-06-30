import { createCustomProvider } from "@insyte/track";
import { provideInsyteAnalytics } from "@insyte/track/angular";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";

const demoProvider = createCustomProvider({
  name: "demo-console",
  handlers: {
    track: (event, properties) => {
      console.info("[@insyte/track demo]", event, properties);
    },
    page: (properties) => {
      console.info("[@insyte/track demo] pageview", properties);
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    ...provideInsyteAnalytics({
      autoInit: false,
      autoPageView: true,
      waitForConsent: true,
      consent: {
        storage: "localStorage",
        storageKey: "insyte-consent",
        defaultConsent: { necessary: true, analytics: false, marketing: false },
      },
      providers: [demoProvider],
    }),
  ],
};
