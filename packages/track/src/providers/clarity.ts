import type { AnalyticsProvider, AnalyticsProviderConfig, AnalyticsProperties, PageProperties, UserTraits } from "../types";
import { debugLog, isBrowser, loadScript } from "../utils";

export interface ClarityConfig extends AnalyticsProviderConfig {
  projectId: string;
}

export function clarity(config: ClarityConfig): AnalyticsProvider {
  const { projectId, enabled = true, debug = false } = config;
  const name = "clarity";

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      window.clarity =
        window.clarity ??
        function clarity(...args: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((window as any).clarity.q = (window as any).clarity.q ?? []).push(args);
        };

      await loadScript(`https://www.clarity.ms/tag/${projectId}`);
      debugLog(debug, name, "initialized", { projectId });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      window.clarity?.("event", event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(_properties?: PageProperties) {
      debugLog(debug, name, "page handled automatically by Clarity");
    },
    identify(userId: string, _traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      window.clarity?.("identify", userId);
      debugLog(debug, name, "identify", { userId });
    },
  };
}
