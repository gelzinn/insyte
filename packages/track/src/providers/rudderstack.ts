import type {
  AnalyticsProvider,
  AnalyticsProviderConfig,
  AnalyticsProperties,
  PageProperties,
  UserTraits,
} from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface RudderStackConfig extends AnalyticsProviderConfig {
  writeKey: string;
  dataPlaneUrl: string;
  cdnUrl?: string;
}

interface RudderAnalytics {
  load: (writeKey: string, dataPlaneUrl: string, options?: Record<string, unknown>) => void;
  page: (category?: string, name?: string, properties?: Record<string, unknown>) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

declare global {
  interface Window {
    rudderanalytics?: RudderAnalytics;
  }
}

export function rudderstack(config: RudderStackConfig): AnalyticsProvider {
  const {
    writeKey,
    dataPlaneUrl,
    enabled = true,
    debug = false,
    cdnUrl = "https://cdn.rudderlabs.com",
  } = config;
  const name = "rudderstack";

  const getRudder = (): RudderAnalytics | undefined => {
    if (!isBrowser()) {
      return undefined;
    }
    return window.rudderanalytics;
  };

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript(`${cdnUrl.replace(/\/$/, "")}/v1/rudder-analytics.min.js`);

      const rudder = getRudder();
      rudder?.load(writeKey, dataPlaneUrl, { logLevel: debug ? "DEBUG" : "ERROR" });
      debugLog(debug, name, "initialized", { writeKey, dataPlaneUrl });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      getRudder()?.track(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      getRudder()?.page(undefined, undefined, pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      getRudder()?.identify(userId, traits);
      debugLog(debug, name, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }
      getRudder()?.reset();
      debugLog(debug, name, "reset");
    },
  };
}
