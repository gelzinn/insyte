import type {
  AnalyticsProperties,
  AnalyticsProvider,
  CreateAnalyticsOptions,
  PageProperties,
  ProviderFactory,
  TrackOptions,
  UserTraits,
} from "../types";
import { debugLog, getCurrentPageProperties, isBrowser } from "../utils";

export class AnalyticsClient {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private debug: boolean;

  constructor(options: CreateAnalyticsOptions) {
    this.debug = options.debug ?? false;
    this.providers = options.providers.map((provider) =>
      typeof provider === "function" ? provider({ enabled: true }) : provider,
    );
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          await provider.init();
          debugLog(this.debug, "core", `provider ready: ${provider.name}`);
        } catch (error) {
          console.error(`[@insyte/track] Failed to init provider "${provider.name}"`, error);
        }
      }),
    );

    this.initialized = true;
    debugLog(this.debug, "core", "all providers initialized");
  }

  track(event: string, properties?: AnalyticsProperties, options?: TrackOptions): void {
    this.forEachProvider(options?.providers, (provider) => {
      provider.track(event, properties);
    });
    debugLog(this.debug, "core", "track", { event, properties, options });
  }

  page(properties?: PageProperties, options?: TrackOptions): void {
    const pageData = { ...getCurrentPageProperties(), ...properties };
    this.forEachProvider(options?.providers, (provider) => {
      provider.page(pageData);
    });
    debugLog(this.debug, "core", "page", { pageData, options });
  }

  identify(userId: string, traits?: UserTraits, options?: TrackOptions): void {
    this.forEachProvider(options?.providers, (provider) => {
      provider.identify(userId, traits);
    });
    debugLog(this.debug, "core", "identify", { userId, traits, options });
  }

  reset(options?: TrackOptions): void {
    this.forEachProvider(options?.providers, (provider) => {
      provider.reset?.();
    });
    debugLog(this.debug, "core", "reset", options);
  }

  setUserProperties(properties: UserTraits, options?: TrackOptions): void {
    this.forEachProvider(options?.providers, (provider) => {
      provider.setUserProperties?.(properties);
    });
    debugLog(this.debug, "core", "setUserProperties", { properties, options });
  }

  getProviders(): AnalyticsProvider[] {
    return [...this.providers];
  }

  addProvider(provider: AnalyticsProvider | ProviderFactory): void {
    const instance = typeof provider === "function" ? provider({ enabled: true }) : provider;
    this.providers.push(instance);

    if (this.initialized) {
      void Promise.resolve(instance.init()).catch((error: unknown) => {
        console.error(`[@insyte/track] Failed to init provider "${instance.name}"`, error);
      });
    }
  }

  removeProvider(name: string): void {
    this.providers = this.providers.filter((provider) => provider.name !== name);
  }

  setupAutoPageView(): () => void {
    if (!isBrowser()) {
      return () => undefined;
    }

    const trackCurrentPage = () => this.page();

    trackCurrentPage();

    const onPopState = () => trackCurrentPage();
    window.addEventListener("popstate", onPopState);

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      trackCurrentPage();
    };

    history.replaceState = (...args) => {
      originalReplaceState(...args);
      trackCurrentPage();
    };

    return () => {
      window.removeEventListener("popstate", onPopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }

  private forEachProvider(
    providerNames: string[] | undefined,
    callback: (provider: AnalyticsProvider) => void,
  ): void {
    const targets = providerNames?.length
      ? this.providers.filter((provider) => providerNames.includes(provider.name))
      : this.providers;

    for (const provider of targets) {
      try {
        callback(provider);
      } catch (error) {
        console.error(`[@insyte/track] Error in provider "${provider.name}"`, error);
      }
    }
  }
}

export function createAnalytics(options: CreateAnalyticsOptions): AnalyticsClient {
  return new AnalyticsClient(options);
}

let defaultClient: AnalyticsClient | null = null;

export function initAnalytics(options: CreateAnalyticsOptions): AnalyticsClient {
  defaultClient = createAnalytics(options);
  return defaultClient;
}

export function getAnalytics(): AnalyticsClient {
  if (!defaultClient) {
    throw new Error(
      "[@insyte/track] Analytics not initialized. Call initAnalytics() or createAnalytics() first.",
    );
  }
  return defaultClient;
}

export async function setupAnalytics(
  options: CreateAnalyticsOptions & { autoPageView?: boolean },
): Promise<AnalyticsClient> {
  const client = initAnalytics(options);
  await client.init();

  if (options.autoPageView) {
    client.setupAutoPageView();
  }

  return client;
}

export const track = (
  event: string,
  properties?: AnalyticsProperties,
  options?: TrackOptions,
): void => getAnalytics().track(event, properties, options);

export const page = (properties?: PageProperties, options?: TrackOptions): void =>
  getAnalytics().page(properties, options);

export const identify = (
  userId: string,
  traits?: UserTraits,
  options?: TrackOptions,
): void => getAnalytics().identify(userId, traits, options);

export const reset = (options?: TrackOptions): void => getAnalytics().reset(options);

export const setUserProperties = (properties: UserTraits, options?: TrackOptions): void =>
  getAnalytics().setUserProperties(properties, options);
