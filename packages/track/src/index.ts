export {
  AnalyticsClient,
  ConsentManager,
  createAnalytics,
  createConsentManager,
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
  ConsentCategory,
  ConsentManagerLike,
  ConsentOptions,
  ConsentState,
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
  heap,
  hotjar,
  insyte,
  mixpanel,
  plausible,
  posthog,
  rudderstack,
  segment,
} from "./providers";

export type {
  AmplitudeConfig,
  ClarityConfig,
  FacebookPixelConfig,
  GoogleAnalyticsConfig,
  HeapConfig,
  HotjarConfig,
  InsyteConfig,
  MixpanelConfig,
  PlausibleConfig,
  PostHogConfig,
  RudderStackConfig,
  SegmentConfig,
} from "./providers";

export {
  allConsentCategories,
  DEFAULT_PROVIDER_CATEGORIES,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from "./consent";

export { getCurrentPageProperties, isBrowser, loadScript } from "./utils";
