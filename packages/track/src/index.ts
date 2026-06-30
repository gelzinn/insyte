export {
  AnalyticsClient,
  createAnalytics,
  getAnalytics,
  identify,
  initAnalytics,
  page,
  reset,
  setUserProperties,
  setupAnalytics,
  track,
} from "./core/analytics-client";

export type {
  AnalyticsConfig,
  AnalyticsPrimitive,
  AnalyticsProperties,
  AnalyticsProvider,
  AnalyticsProviderConfig,
  CreateAnalyticsOptions,
  CustomProviderHandlers,
  CustomProviderOptions,
  PageProperties,
  ProviderFactory,
  TrackOptions,
  UserTraits,
} from "./types";

export {
  amplitude,
  clarity,
  createCustomProvider,
  facebookPixel,
  googleAnalytics,
  mixpanel,
  plausible,
  posthog,
  segment,
} from "./providers";

export type {
  AmplitudeConfig,
  ClarityConfig,
  FacebookPixelConfig,
  GoogleAnalyticsConfig,
  MixpanelConfig,
  PlausibleConfig,
  PostHogConfig,
  SegmentConfig,
} from "./providers";

export { getCurrentPageProperties, isBrowser, loadScript } from "./utils";
