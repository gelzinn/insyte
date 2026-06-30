import type {
  AnalyticsProvider,
  AnalyticsProviderConfig,
  AnalyticsProperties,
  PageProperties,
  UserTraits,
} from "../types";
import { debugLog, isBrowser, loadScript } from "../utils";

export interface HotjarConfig extends AnalyticsProviderConfig {
  siteId: number | string;
  version?: number;
}

interface HotjarFn {
  (...args: unknown[]): void;
  q?: unknown[];
}

declare global {
  interface Window {
    hj?: HotjarFn;
    _hjSettings?: { hjid: number | string; hjsv: number };
  }
}

export function hotjar(config: HotjarConfig): AnalyticsProvider {
  const { siteId, enabled = true, debug = false, version = 6 } = config;
  const name = "hotjar";

  const hj = (...args: unknown[]) => {
    if (!isBrowser()) {
      return;
    }

    const fn = window.hj as HotjarFn | undefined;
    if (typeof fn === "function") {
      fn(...args);
      return;
    }

    window.hj = function hotjarQueue(...innerArgs: unknown[]) {
      window.hj!.q = window.hj!.q ?? [];
      window.hj!.q!.push(innerArgs);
    };
    window.hj(...args);
  };

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      window._hjSettings = { hjid: siteId, hjsv: version };
      await loadScript(`https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`);
      debugLog(debug, name, "initialized", { siteId });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      hj("event", event);
      if (properties) {
        hj("tagRecording", [event, JSON.stringify(properties)]);
      }
      debugLog(debug, name, "track", { event, properties });
    },
    page(_properties?: PageProperties) {
      debugLog(debug, name, "page handled automatically by Hotjar session recording");
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      hj("identify", userId, traits ?? {});
      debugLog(debug, name, "identify", { userId, traits });
    },
  };
}
