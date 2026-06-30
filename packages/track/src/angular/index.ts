import { APP_INITIALIZER, Injectable, inject, InjectionToken, type Provider } from "@angular/core";
import { AnalyticsClient, createAnalytics } from "../core/analytics-client";
import type {
  AnalyticsProperties,
  ConsentCategory,
  ConsentState,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";

export interface InsyteAnalyticsConfig extends CreateAnalyticsOptions {
  autoInit?: boolean;
  autoPageView?: boolean;
}

export const INSYTE_ANALYTICS_CONFIG = new InjectionToken<InsyteAnalyticsConfig>(
  "INSYTE_ANALYTICS_CONFIG",
);

@Injectable({ providedIn: "root" })
export class InsyteAnalyticsService {
  private readonly config = inject(INSYTE_ANALYTICS_CONFIG, { optional: true });
  private client: AnalyticsClient | null = null;
  private initPromise: Promise<void> | null = null;

  private getOrCreateClient(): AnalyticsClient {
    if (!this.client) {
      if (!this.config) {
        throw new Error(
          "[@insyte/track/angular] InsyteAnalyticsService requires provideInsyteAnalytics() in app config.",
        );
      }
      this.client = createAnalytics({
        providers: this.config.providers,
        debug: this.config.debug,
        consent: this.config.consent,
        waitForConsent: this.config.waitForConsent,
      });
    }
    return this.client;
  }

  async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    const client = this.getOrCreateClient();

    this.initPromise = (async () => {
      await client.init();

      if (this.config?.autoPageView) {
        client.setupAutoPageView();
      }
    })();

    return this.initPromise;
  }

  track(event: string, properties?: AnalyticsProperties, options?: TrackOptions): void {
    this.getOrCreateClient().track(event, properties, options);
  }

  page(properties?: PageProperties, options?: TrackOptions): void {
    this.getOrCreateClient().page(properties, options);
  }

  identify(userId: string, traits?: UserTraits, options?: TrackOptions): void {
    this.getOrCreateClient().identify(userId, traits, options);
  }

  reset(options?: TrackOptions): void {
    this.getOrCreateClient().reset(options);
  }

  setUserProperties(properties: UserTraits, options?: TrackOptions): void {
    this.getOrCreateClient().setUserProperties(properties, options);
  }

  grantConsent(categories: ConsentCategory[] | ConsentState): ConsentState {
    return this.getOrCreateClient().grantConsent(categories);
  }

  denyConsent(categories?: ConsentCategory[]): ConsentState {
    return this.getOrCreateClient().denyConsent(categories);
  }

  getConsent(): ConsentState {
    return this.getOrCreateClient().getConsentManager().getConsent();
  }

  getClient(): AnalyticsClient {
    return this.getOrCreateClient();
  }
}

export function provideInsyteAnalytics(config: InsyteAnalyticsConfig): Provider[] {
  const providers: Provider[] = [{ provide: INSYTE_ANALYTICS_CONFIG, useValue: config }];

  if (config.autoInit !== false) {
    providers.push({
      provide: APP_INITIALIZER,
      useFactory: (analytics: InsyteAnalyticsService) => () => analytics.initialize(),
      deps: [InsyteAnalyticsService],
      multi: true,
    });
  }

  return providers;
}

export { AnalyticsClient, createAnalytics };
export type {
  AnalyticsProperties,
  ConsentCategory,
  ConsentState,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";
