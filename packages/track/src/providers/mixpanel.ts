import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface MixpanelConfig extends AnalyticsProviderConfig {
  token: string;
  apiHost?: string;
}

export function mixpanel(config: MixpanelConfig): AnalyticsProvider {
  const { token, enabled = true, debug = false, apiHost } = config;
  const name = "mixpanel";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript("https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js");

      window.mixpanel?.init(token, {
        debug,
        ...(apiHost ? { api_host: apiHost } : {}),
      });
      debugLog(debug, name, "initialized");
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.mixpanel?.track(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      window.mixpanel?.track("Page View", pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      window.mixpanel?.identify(userId);
      if (traits) {
        window.mixpanel?.people?.set(traits);
      }
      debugLog(debug, name, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }
      window.mixpanel?.reset();
      debugLog(debug, name, "reset");
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }
      window.mixpanel?.people?.set(properties);
      debugLog(debug, name, "setUserProperties", properties);
    },
  };
}
