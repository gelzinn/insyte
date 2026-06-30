import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface PostHogConfig extends AnalyticsProviderConfig {
  apiKey: string;
  apiHost?: string;
  capturePageView?: boolean;
}

export function posthog(config: PostHogConfig): AnalyticsProvider {
  const {
    apiKey,
    enabled = true,
    debug = false,
    apiHost = "https://app.posthog.com",
    capturePageView = false,
  } = config;
  const name = "posthog";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript(`${apiHost.replace(/\/$/, "")}/static/array.js`);

      window.posthog?.init(apiKey, {
        api_host: apiHost,
        capture_pageview: capturePageView,
        loaded: () => debugLog(debug, name, "initialized"),
      });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.posthog?.capture(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      window.posthog?.capture("$pageview", pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      window.posthog?.identify(userId, traits);
      debugLog(debug, name, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }
      window.posthog?.reset();
      debugLog(debug, name, "reset");
    },
  };
}
