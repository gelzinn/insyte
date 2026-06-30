import type { App } from "vue";
import { AnalyticsClient, createAnalytics } from "../core/analytics-client";
import type {
  AnalyticsProperties,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";

export const ANALYTICS_INJECTION_KEY = Symbol("insyte-analytics");

export interface InsyteAnalyticsPluginOptions extends CreateAnalyticsOptions {
  autoInit?: boolean;
  autoPageView?: boolean;
}

export function createInsyteAnalyticsPlugin(options: InsyteAnalyticsPluginOptions) {
  const { autoInit = true, autoPageView = false, ...clientOptions } = options;
  const client = createAnalytics(clientOptions);
  let cleanupAutoPageView: (() => void) | undefined;

  return {
    install(app: App) {
      app.provide(ANALYTICS_INJECTION_KEY, client);
      app.config.globalProperties.$analytics = client;

      if (autoInit) {
        void client.init().then(() => {
          if (autoPageView) {
            cleanupAutoPageView = client.setupAutoPageView();
          }
        });
      }
    },
    client,
    destroy() {
      cleanupAutoPageView?.();
    },
  };
}

export type InsyteAnalyticsPlugin = ReturnType<typeof createInsyteAnalyticsPlugin>;

declare module "vue" {
  interface ComponentCustomProperties {
    $analytics: AnalyticsClient;
  }
}

export { AnalyticsClient, createAnalytics };
export type {
  AnalyticsProperties,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";

export function useAnalytics(app: App): AnalyticsClient {
  return app.config.globalProperties.$analytics;
}

export const trackEvent = (
  client: AnalyticsClient,
  event: string,
  properties?: AnalyticsProperties,
  options?: TrackOptions,
) => client.track(event, properties, options);

export const trackPage = (
  client: AnalyticsClient,
  properties?: PageProperties,
  options?: TrackOptions,
) => client.page(properties, options);

export const identifyUser = (
  client: AnalyticsClient,
  userId: string,
  traits?: UserTraits,
  options?: TrackOptions,
) => client.identify(userId, traits, options);
