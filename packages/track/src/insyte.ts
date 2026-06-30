import { AnalyticsClient, createAnalytics } from "./core/analytics-client";
import { resolveInsyteConfig, type InsyteOptions } from "./config/resolve-config";
import { InsyteError, notInitializedHint } from "./errors";
import type { AnalyticsProperties, PageProperties, TrackOptions, UserTraits } from "./types";

export type { InsyteOptions } from "./config/resolve-config";

/**
 * Insyte SDK client — Resend-style API for analytics.
 *
 * @example
 * ```ts
 * const analytics = new Insyte();
 * await analytics.init();
 * analytics.track("signup_clicked", { plan: "pro" });
 * ```
 */
export class Insyte {
  readonly client: AnalyticsClient;
  private ready = false;
  private autoPageView: boolean;

  constructor(keyOrOptions?: string | InsyteOptions, options?: InsyteOptions) {
    const config = resolveInsyteConfig(keyOrOptions, options);
    this.autoPageView = config.autoPageView ?? false;
    this.client = createAnalytics(config);
  }

  async init(): Promise<this> {
    await this.client.init();

    if (this.autoPageView) {
      this.client.setupAutoPageView();
    }

    this.ready = true;
    return this;
  }

  private assertReady(): void {
    if (!this.ready) {
      throw new InsyteError("NOT_INITIALIZED", "Insyte is not initialized.", notInitializedHint());
    }
  }

  track(event: string, properties?: AnalyticsProperties, options?: TrackOptions): void {
    this.client.track(event, properties, options);
  }

  page(properties?: PageProperties, options?: TrackOptions): void {
    this.client.page(properties, options);
  }

  identify(userId: string, traits?: UserTraits, options?: TrackOptions): void {
    this.client.identify(userId, traits, options);
  }

  reset(options?: TrackOptions): void {
    this.client.reset(options);
  }

  setUserProperties(properties: UserTraits, options?: TrackOptions): void {
    this.client.setUserProperties(properties, options);
  }

  grantConsent(
    ...args: Parameters<AnalyticsClient["grantConsent"]>
  ): ReturnType<AnalyticsClient["grantConsent"]> {
    return this.client.grantConsent(...args);
  }

  denyConsent(
    ...args: Parameters<AnalyticsClient["denyConsent"]>
  ): ReturnType<AnalyticsClient["denyConsent"]> {
    return this.client.denyConsent(...args);
  }

  setupAutoPageView(): () => void {
    return this.client.setupAutoPageView();
  }

  /** @internal */
  _assertReadyForStrictMode(): void {
    this.assertReady();
  }
}

export function createInsyte(keyOrOptions?: string | InsyteOptions, options?: InsyteOptions): Insyte {
  return new Insyte(keyOrOptions, options);
}
