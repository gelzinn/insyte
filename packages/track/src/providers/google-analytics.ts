import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface GoogleAnalyticsConfig extends AnalyticsProviderConfig {
  measurementId: string;
  sendPageView?: boolean;
}

export function googleAnalytics(config: GoogleAnalyticsConfig): AnalyticsProvider {
  const { measurementId, enabled = true, debug = false, sendPageView = true } = config;
  const name = "google-analytics";

  const gtag = (...args: unknown[]) => {
    if (!isBrowser()) {
      return;
    }
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push(args);
    window.gtag?.(...args);
  };

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

      await loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
      gtag("js", new Date());
      gtag("config", measurementId, { send_page_view: sendPageView });
      debugLog(debug, name, "initialized", { measurementId });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      gtag("event", event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      gtag("event", "page_view", pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      gtag("config", measurementId, { user_id: userId, ...traits });
      debugLog(debug, name, "identify", { userId, traits });
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }
      gtag("set", "user_properties", properties);
      debugLog(debug, name, "setUserProperties", properties);
    },
  };
}
