import { createApp } from "vue";
import { createCustomProvider, insyte } from "@insyte/track";
import { ANALYTICS_INJECTION_KEY, createInsyteAnalyticsPlugin } from "@insyte/track/vue";
import App from "./App.vue";
import "./style.css";

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

const analyticsPlugin = createInsyteAnalyticsPlugin({
  autoInit: false,
  autoPageView: true,
  waitForConsent: true,
  debug: import.meta.env.DEV,
  consent: {
    storage: "localStorage",
    storageKey: "insyte-consent",
    defaultConsent: { necessary: true, analytics: false, marketing: false },
  },
  providers,
});

const app = createApp(App);
app.use(analyticsPlugin);
app.provide(ANALYTICS_INJECTION_KEY, analyticsPlugin.client);
app.mount("#app");
