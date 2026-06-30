export type AnalyticsPrimitive = string | number | boolean | null | undefined;

export type AnalyticsProperties = Record<
  string,
  AnalyticsPrimitive | AnalyticsPrimitive[]
>;

export interface PageProperties extends AnalyticsProperties {
  path?: string;
  url?: string;
  title?: string;
  referrer?: string;
}

export interface UserTraits extends AnalyticsProperties {
  email?: string;
  name?: string;
}

export interface AnalyticsProviderConfig {
  enabled?: boolean;
  debug?: boolean;
}

export interface AnalyticsProvider {
  readonly name: string;
  init(): void | Promise<void>;
  track(event: string, properties?: AnalyticsProperties): void;
  page(properties?: PageProperties): void;
  identify(userId: string, traits?: UserTraits): void;
  reset?(): void;
  setUserProperties?(properties: UserTraits): void;
  isReady?(): boolean;
}

export type ProviderFactory<TConfig extends AnalyticsProviderConfig = AnalyticsProviderConfig> = (
  config: TConfig,
) => AnalyticsProvider;

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
  debug?: boolean;
  autoPageView?: boolean;
}

export interface CreateAnalyticsOptions {
  providers: Array<AnalyticsProvider | ProviderFactory>;
  debug?: boolean;
}

export interface TrackOptions {
  /** Send only to specific providers by name */
  providers?: string[];
}

export interface CustomProviderHandlers {
  init?: () => void | Promise<void>;
  track?: (event: string, properties?: AnalyticsProperties) => void;
  page?: (properties?: PageProperties) => void;
  identify?: (userId: string, traits?: UserTraits) => void;
  reset?: () => void;
  setUserProperties?: (properties: UserTraits) => void;
}

export interface CustomProviderOptions extends AnalyticsProviderConfig {
  name: string;
  handlers: CustomProviderHandlers;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    mixpanel?: {
      init: (token: string, config?: Record<string, unknown>) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string) => void;
      people?: {
        set: (properties: Record<string, unknown>) => void;
      };
      reset: () => void;
    };
    posthog?: {
      init: (token: string, config?: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
      reset: () => void;
    };
    plausible?: (
      event: string,
      options?: { props?: Record<string, unknown>; callback?: () => void },
    ) => void;
    analytics?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
      page: (category?: string, name?: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
      reset: () => void;
    };
    amplitude?: {
      init: (apiKey: string, userId?: string, config?: Record<string, unknown>) => void;
      logEvent: (event: string, properties?: Record<string, unknown>) => void;
      setUserId: (userId: string) => void;
      setUserProperties: (properties: Record<string, unknown>) => void;
      reset: () => void;
    };
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export {};
