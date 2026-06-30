import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppAnalyticsProvider } from "./providers/analytics-provider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppAnalyticsProvider>
      <App />
    </AppAnalyticsProvider>
  </StrictMode>,
);
