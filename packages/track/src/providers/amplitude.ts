import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface AmplitudeConfig extends AnalyticsProviderConfig {
  apiKey: string;
  serverUrl?: string;
}

export function amplitude(config: AmplitudeConfig): AnalyticsProvider {
  const { apiKey, enabled = true, debug = false, serverUrl } = config;
  const name = "amplitude";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript("https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz");

      window.amplitude?.init(apiKey, undefined, {
        ...(serverUrl ? { serverUrl } : {}),
      });
      debugLog(debug, name, "initialized");
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.amplitude?.logEvent(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      window.amplitude?.logEvent("Page Viewed", pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      window.amplitude?.setUserId(userId);
      if (traits) {
        window.amplitude?.setUserProperties(traits);
      }
      debugLog(debug, name, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }
      window.amplitude?.reset();
      debugLog(debug, name, "reset");
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }
      window.amplitude?.setUserProperties(properties);
      debugLog(debug, name, "setUserProperties", properties);
    },
  };
}
