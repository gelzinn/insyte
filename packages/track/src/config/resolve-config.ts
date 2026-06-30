import { insyte as insyteProvider } from "../providers/insyte";
import type { AnalyticsProvider, ConsentOptions, CreateAnalyticsOptions } from "../types";

export interface InsyteOptions {
  /** Production API key (INSYTE_KEY). Local dev uses INSYTE_DEV instead. */
  key?: string;
  /** Enable local collector + studio defaults (INSYTE_DEV or NODE_ENV=development) */
  dev?: boolean;
  /** Studio ingest URL (INSYTE_STUDIO_URL) */
  studioUrl?: string;
  debug?: boolean;
  /** Set to false to disable consent gating (internal tools) */
  consent?: false | ConsentOptions;
  /** Additional providers (GA4, Mixpanel, etc.) */
  providers?: AnalyticsProvider[];
  autoPageView?: boolean;
}

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[name];
}

function isDevEnvironment(explicit?: boolean): boolean {
  if (explicit !== undefined) {
    return explicit;
  }

  if (readEnv("INSYTE_DEV") === "true" || readEnv("INSYTE_DEV") === "1") {
    return true;
  }

  return readEnv("NODE_ENV") === "development";
}

function resolveStudioUrl(options: InsyteOptions): string {
  return (
    options.studioUrl ??
    readEnv("INSYTE_STUDIO_URL") ??
    readEnv("NEXT_PUBLIC_INSYTE_STUDIO_URL") ??
    readEnv("VITE_INSYTE_STUDIO_URL") ??
    "http://127.0.0.1:5555"
  );
}

export function resolveInsyteConfig(
  keyOrOptions?: string | InsyteOptions,
  maybeOptions?: InsyteOptions,
): CreateAnalyticsOptions & { autoPageView?: boolean } {
  const base: InsyteOptions =
    typeof keyOrOptions === "string"
      ? { ...maybeOptions, key: keyOrOptions }
      : { ...keyOrOptions, ...maybeOptions };

  const dev = isDevEnvironment(base.dev);
  const studioUrl = resolveStudioUrl(base);
  const providers: AnalyticsProvider[] = [...(base.providers ?? [])];

  if (dev || base.key) {
    providers.unshift(
      insyteProvider({
        studioUrl,
        debug: base.debug ?? dev,
        enabled: true,
      }),
    );
  }

  const useConsent = base.consent !== false;
  const waitForConsent = useConsent && !dev;

  const consent: ConsentOptions | undefined = useConsent
    ? {
        storageKey: "insyte-consent",
        storage: "localStorage",
        defaultConsent: dev
          ? { necessary: true, analytics: true, marketing: false, preferences: false }
          : { necessary: true, analytics: false, marketing: false, preferences: false },
        ...(typeof base.consent === "object" ? base.consent : {}),
      }
    : undefined;

  return {
    providers,
    debug: base.debug ?? dev,
    consent,
    waitForConsent,
    autoPageView: base.autoPageView ?? false,
  };
}

export function resolveInsyteKey(keyOrOptions?: string | InsyteOptions): string | undefined {
  if (typeof keyOrOptions === "string") {
    return keyOrOptions;
  }

  return keyOrOptions?.key ?? readEnv("INSYTE_KEY");
}
