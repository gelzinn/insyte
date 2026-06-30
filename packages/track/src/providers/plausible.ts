import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface PlausibleConfig extends AnalyticsProviderConfig {
  domain: string;
  apiHost?: string;
}

export function plausible(config: PlausibleConfig): AnalyticsProvider {
  const { domain, enabled = true, debug = false, apiHost = "https://plausible.io" } = config;
  const name = "plausible";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      await loadScript(`${apiHost.replace(/\/$/, "")}/js/script.js`, {
        "data-domain": domain,
      });
      debugLog(debug, name, "initialized", { domain });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.plausible?.(event, { props: properties });
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      window.plausible?.("pageview", { props: pageData });
      debugLog(debug, name, "page", pageData);
    },
    identify(_userId: string, _traits?: UserTraits) {
      debugLog(debug, name, "identify skipped — Plausible is privacy-first and does not support user identification");
    },
  };
}
