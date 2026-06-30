import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface SegmentConfig extends AnalyticsProviderConfig {
  writeKey: string;
  cdnUrl?: string;
}

export function segment(config: SegmentConfig): AnalyticsProvider {
  const { writeKey, enabled = true, debug = false, cdnUrl = "https://cdn.segment.com" } = config;
  const name = "segment";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript(`${cdnUrl.replace(/\/$/, "")}/analytics.js/v1/${writeKey}/analytics.min.js`);
      debugLog(debug, name, "initialized");
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.analytics?.track(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      window.analytics?.page(undefined, undefined, pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      window.analytics?.identify(userId, traits);
      debugLog(debug, name, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }
      window.analytics?.reset();
      debugLog(debug, name, "reset");
    },
  };
}
