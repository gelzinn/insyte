import type {
  AnalyticsProvider,
  AnalyticsProviderConfig,
  AnalyticsProperties,
  PageProperties,
  UserTraits,
} from "../types";
import { debugLog, getCurrentPageProperties, isBrowser, loadScript } from "../utils";

export interface HeapConfig extends AnalyticsProviderConfig {
  appId: string;
}

interface HeapClient {
  load: (appId: string) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  resetIdentity: () => void;
  addUserProperties: (properties: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    heap?: HeapClient;
  }
}

export function heap(config: HeapConfig): AnalyticsProvider {
  const { appId, enabled = true, debug = false } = config;
  const name = "heap";

  const getHeap = (): HeapClient | undefined => {
    if (!isBrowser()) {
      return undefined;
    }
    return window.heap as HeapClient | undefined;
  };

  return {
    name,
    async init() {
      if (!enabled || !isBrowser()) {
        return;
      }

      window.heap = window.heap ?? ({} as HeapClient);
      const heapClient = window.heap;

      heapClient.load =
        heapClient.load ??
        function heapLoad(id: string) {
          void loadScript(`https://cdn.heapanalytics.com/js/heap-${id}.js`);
        };

      heapClient.load(appId);
      debugLog(debug, name, "initialized", { appId });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      getHeap()?.track(event, properties);
      debugLog(debug, name, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      const pageData = { ...getCurrentPageProperties(), ...properties };
      getHeap()?.track("Pageview", pageData);
      debugLog(debug, name, "page", pageData);
    },
    identify(userId: string, _traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      getHeap()?.identify(userId);
      debugLog(debug, name, "identify", { userId });
    },
    reset() {
      if (!enabled) {
        return;
      }
      getHeap()?.resetIdentity();
      debugLog(debug, name, "reset");
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }
      getHeap()?.addUserProperties(properties);
      debugLog(debug, name, "setUserProperties", properties);
    },
  };
}
