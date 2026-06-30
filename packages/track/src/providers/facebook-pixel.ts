import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, isBrowser, loadScript } from "../utils";

export interface FacebookPixelConfig extends AnalyticsProviderConfig {
  pixelId: string;
}

export function facebookPixel(config: FacebookPixelConfig): AnalyticsProvider {
  const { pixelId, enabled = true, debug = false } = config;
  const name = "facebook-pixel";

  const fbq = (...args: unknown[]) => {
    if (!isBrowser()) {
      return;
    }
    window.fbq?.(...args);
  };

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      if (!window.fbq) {
        const n = function fbq(...args: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (n as any).callMethod ? (n as any).callMethod(...args) : (n as any).queue.push(args);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        n.queue = [];
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        window.fbq = n;
      }

      await loadScript("https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", pixelId);
      fbq("track", "PageView");
      debugLog(debug, name, "initialized", { pixelId });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      fbq("trackCustom", event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(_properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      fbq("track", "PageView");
      debugLog(debug, name, "page");
    },
    identify(_userId: string, _traits?: UserTraits) {
      debugLog(debug, name, "identify skipped — use Advanced Matching via Facebook Pixel config");
    },
  };
}
