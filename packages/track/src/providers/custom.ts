import type {
  AnalyticsProperties,
  AnalyticsProvider,
  CustomProviderHandlers,
  CustomProviderOptions,
  PageProperties,
  UserTraits,
} from "../types";
import { debugLog } from "../utils";

export function createCustomProvider(options: CustomProviderOptions): AnalyticsProvider {
  const { name, handlers, enabled = true, debug = false } = options;

  const invoke = <T extends keyof CustomProviderHandlers>(
    method: T,
    ...args: Parameters<NonNullable<CustomProviderHandlers[T]>>
  ): void => {
    const handler = handlers[method];
    if (!handler) {
      return;
    }

    try {
      (handler as (...handlerArgs: unknown[]) => void)(...args);
      debugLog(debug, name, `${String(method)} called`, args);
    } catch (error) {
      console.error(`[@insyte/track:${name}] Error in ${String(method)}`, error);
    }
  };

  return {
    name,
    async init() {
      if (!enabled) {
        return;
      }
      await invoke("init");
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }
      invoke("track", event, properties);
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }
      invoke("page", properties);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }
      invoke("identify", userId, traits);
    },
    reset() {
      if (!enabled) {
        return;
      }
      invoke("reset");
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }
      invoke("setUserProperties", properties);
    },
  };
}
