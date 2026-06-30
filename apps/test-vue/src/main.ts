import { createApp } from "vue";
import { ANALYTICS_INJECTION_KEY, createInsytePlugin } from "@insyte/track/vue";
import App from "./App.vue";
import "./style.css";

const analyticsPlugin = createInsytePlugin({ autoPageView: true });

const app = createApp(App);
app.use(analyticsPlugin);
app.provide(ANALYTICS_INJECTION_KEY, analyticsPlugin.client);
app.mount("#app");
