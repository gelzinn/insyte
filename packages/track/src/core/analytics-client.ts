import type { ConsentManager } from "../consent/consent-manager";
import type {
  AnalyticsProperties,
  AnalyticsProvider,
  ConsentCategory,
  ConsentManagerLike,
  ConsentOptions,
  ConsentState,
  CreateAnalyticsOptions,
  PageProperties,
  ProviderFactory,
  TrackOptions,
  UserTraits,
} from "../types";
import { ConsentManager as ConsentManagerClass, createConsentManager } from "../consent/consent-manager";
import { debugLog, getCurrentPageProperties, isBrowser } from "../utils";

function isConsentManager(value: ConsentOptions | ConsentManagerLike | undefined): value is ConsentManagerLike {
  return Boolean(
    value &&
      typeof value === "object" &&
      "getConsent" in value &&
      typeof value.getConsent === "function",
  );
}

type QueuedCall =
  | { type: "track"; event: string; properties?: AnalyticsProperties; options?: TrackOptions }
  | { type: "page"; properties?: PageProperties; options?: TrackOptions }
  | { type: "identify"; userId: string; traits?: UserTraits; options?: TrackOptions }
  | { type: "reset"; options?: TrackOptions }
  | { type: "setUserProperties"; properties: UserTraits; options?: TrackOptions };

export class AnalyticsClient {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private debug: boolean;
  private consentManager: ConsentManagerLike;
  private waitForConsent: boolean;
  private queue: QueuedCall[] = [];
  private autoPageViewCleanup?: () => void;
  private pendingAutoPageView = false;
  private consentUnsubscribe?: () => void;

  constructor(options: CreateAnalyticsOptions) {
    this.debug = options.debug ?? false;
    this.waitForConsent = options.waitForConsent ?? false;
    this.consentManager = isConsentManager(options.consent)
      ? options.consent
      : createConsentManager(options.consent);

    this.providers = options.providers.map((provider) =>
      typeof provider === "function" ? provider({ enabled: true }) : provider,
    );

    this.consentUnsubscribe = this.consentManager.onConsentChange(() => {
      void this.syncProvidersWithConsent();
    });
  }

  getConsentManager(): ConsentManagerLike {
    return this.consentManager;
  }

  hasConsent(category: ConsentCategory = "analytics"): boolean {
    return this.consentManager.hasCategory(category);
  }

  grantConsent(categories: ConsentCategory[] | ConsentState): ConsentState {
    const consent = this.consentManager.grantConsent(categories);
    void this.syncProvidersWithConsent();
    return consent;
  }

  denyConsent(categories?: ConsentCategory[]): ConsentState {
    const consent = this.consentManager.denyConsent(categories);
    void this.syncProvidersWithConsent();
    return consent;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.waitForConsent && !this.consentManager.hasCategory("analytics")) {
      debugLog(this.debug, "core", "waiting for consent before initializing providers");
      return;
    }

    await this.initializeAllowedProviders();
  }

  track(event: string, properties?: AnalyticsProperties, options?: TrackOptions): void {
    if (!this.initialized) {
      this.queue.push({ type: "track", event, properties, options });
      return;
    }

    this.forEachProvider(options?.providers, (provider) => {
      provider.track(event, properties);
    });
    debugLog(this.debug, "core", "track", { event, properties, options });
  }

  page(properties?: PageProperties, options?: TrackOptions): void {
    if (!this.initialized) {
      this.queue.push({ type: "page", properties, options });
      return;
    }

    const pageData = { ...getCurrentPageProperties(), ...properties };
    this.forEachProvider(options?.providers, (provider) => {
      provider.page(pageData);
    });
    debugLog(this.debug, "core", "page", { pageData, options });
  }

  identify(userId: string, traits?: UserTraits, options?: TrackOptions): void {
    if (!this.initialized) {
      this.queue.push({ type: "identify", userId, traits, options });
      return;
    }

    this.forEachProvider(options?.providers, (provider) => {
      provider.identify(userId, traits);
    });
    debugLog(this.debug, "core", "identify", { userId, traits, options });
  }

  reset(options?: TrackOptions): void {
    if (!this.initialized) {
      this.queue.push({ type: "reset", options });
      return;
    }

    this.forEachProvider(options?.providers, (provider) => {
      provider.reset?.();
    });
    debugLog(this.debug, "core", "reset", options);
  }

  setUserProperties(properties: UserTraits, options?: TrackOptions): void {
    if (!this.initialized) {
      this.queue.push({ type: "setUserProperties", properties, options });
      return;
    }

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

    if (this.initialized && this.consentManager.isProviderAllowed(instance.name)) {
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

    if (!this.initialized) {
      this.pendingAutoPageView = true;
      return () => {
        this.pendingAutoPageView = false;
        this.autoPageViewCleanup?.();
        this.autoPageViewCleanup = undefined;
      };
    }

    return this.startAutoPageView();
  }

  destroy(): void {
    this.consentUnsubscribe?.();
    this.autoPageViewCleanup?.();
    this.autoPageViewCleanup = undefined;
  }

  private async initializeAllowedProviders(): Promise<void> {
    const allowedProviders = this.providers.filter((provider) =>
      this.consentManager.isProviderAllowed(provider.name),
    );

    await Promise.all(
      allowedProviders.map(async (provider) => {
        try {
          await provider.init();
          debugLog(this.debug, "core", `provider ready: ${provider.name}`);
        } catch (error) {
          console.error(`[@insyte/track] Failed to init provider "${provider.name}"`, error);
        }
      }),
    );

    this.initialized = true;
    this.flushQueue();

    if (this.pendingAutoPageView) {
      this.autoPageViewCleanup = this.startAutoPageView();
      this.pendingAutoPageView = false;
    }

    debugLog(this.debug, "core", "allowed providers initialized");
  }

  private async syncProvidersWithConsent(): Promise<void> {
    const hasAnyConsent =
      this.consentManager.hasCategory("analytics") ||
      this.consentManager.hasCategory("marketing") ||
      this.consentManager.hasCategory("preferences");

    if (!hasAnyConsent) {
      this.initialized = false;
      return;
    }

    if (!this.initialized) {
      await this.initializeAllowedProviders();
      return;
    }

    for (const provider of this.providers) {
      if (!this.consentManager.isProviderAllowed(provider.name)) {
        continue;
      }

      if (!provider.isReady?.()) {
        try {
          await provider.init();
        } catch (error) {
          console.error(`[@insyte/track] Failed to init provider "${provider.name}"`, error);
        }
      }
    }
  }

  private flushQueue(): void {
    const pending = [...this.queue];
    this.queue = [];

    for (const call of pending) {
      switch (call.type) {
        case "track":
          this.track(call.event, call.properties, call.options);
          break;
        case "page":
          this.page(call.properties, call.options);
          break;
        case "identify":
          this.identify(call.userId, call.traits, call.options);
          break;
        case "reset":
          this.reset(call.options);
          break;
        case "setUserProperties":
          this.setUserProperties(call.properties, call.options);
          break;
      }
    }
  }

  private startAutoPageView(): () => void {
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
      if (!this.consentManager.isProviderAllowed(provider.name)) {
        continue;
      }

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

export { ConsentManagerClass as ConsentManager, createConsentManager };
