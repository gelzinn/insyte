import { createApp } from "vue";
import { createCustomProvider } from "@insyte/track";
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
  providers: [demoProvider],
});

const app = createApp(App);
app.use(analyticsPlugin);
app.provide(ANALYTICS_INJECTION_KEY, analyticsPlugin.client);
app.mount("#app");
