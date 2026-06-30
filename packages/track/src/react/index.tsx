"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnalyticsClient, createAnalytics } from "../core/analytics-client";
import type { ConsentCategory, ConsentState } from "../types";
import type {
  AnalyticsProperties,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";

const AnalyticsContext = createContext<AnalyticsClient | null>(null);

export interface AnalyticsProviderProps extends CreateAnalyticsOptions {
  children: ReactNode;
  autoInit?: boolean;
  autoPageView?: boolean;
}

export function AnalyticsProvider({
  children,
  autoInit = true,
  autoPageView = false,
  waitForConsent = false,
  ...options
}: AnalyticsProviderProps) {
  const clientRef = useRef<AnalyticsClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = createAnalytics({ ...options, waitForConsent });
  }

  useEffect(() => {
    if (!autoInit || !clientRef.current) {
      return;
    }

    if (waitForConsent) {
      return;
    }

    let cleanup: (() => void) | undefined;

    void clientRef.current.init().then(() => {
      if (autoPageView && clientRef.current) {
        cleanup = clientRef.current.setupAutoPageView();
      }
    });

    return () => cleanup?.();
  }, [autoInit, autoPageView, waitForConsent]);

  return (
    <AnalyticsContext.Provider value={clientRef.current}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsClient {
  const client = useContext(AnalyticsContext);

  if (!client) {
    throw new Error(
      "[@insyte/track/react] useAnalytics must be used within an AnalyticsProvider",
    );
  }

  return client;
}

export function useTrack() {
  const client = useAnalytics();

  return useCallback(
    (event: string, properties?: AnalyticsProperties, options?: TrackOptions) => {
      client.track(event, properties, options);
    },
    [client],
  );
}

export function usePageView(properties?: PageProperties, options?: TrackOptions) {
  const client = useAnalytics();
  const serialized = JSON.stringify({ properties, options });

  useEffect(() => {
    client.page(properties, options);
  }, [client, serialized]);
}

export function useIdentify(userId?: string, traits?: UserTraits, options?: TrackOptions) {
  const client = useAnalytics();
  const serialized = JSON.stringify({ userId, traits, options });

  useEffect(() => {
    if (!userId) {
      return;
    }
    client.identify(userId, traits, options);
  }, [client, serialized, userId]);
}

export function useConsent() {
  const client = useAnalytics();
  const [consent, setConsent] = useState<ConsentState>(() =>
    client.getConsentManager().getConsent(),
  );

  useEffect(() => {
    return client.getConsentManager().onConsentChange(setConsent);
  }, [client]);

  const grantConsent = useCallback(
    (categories: ConsentCategory[] | ConsentState) => {
      const next = client.grantConsent(categories);
      void client.init().then(() => {
        client.setupAutoPageView();
      });
      return next;
    },
    [client],
  );

  const denyConsent = useCallback(
    (categories?: ConsentCategory[]) => client.denyConsent(categories),
    [client],
  );

  return {
    consent,
    grantConsent,
    denyConsent,
    hasAnalyticsConsent: Boolean(consent.analytics),
    hasMarketingConsent: Boolean(consent.marketing),
  };
}

export interface ConsentBannerProps {
  title?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  className?: string;
  onAccept?: (consent: ConsentState) => void;
  onReject?: (consent: ConsentState) => void;
}

export function ConsentBanner({
  title = "This site uses cookies",
  description = "We use analytics to improve your experience. You can accept or decline tracking.",
  acceptLabel = "Accept",
  rejectLabel = "Decline",
  className,
  onAccept,
  onReject,
}: ConsentBannerProps) {
  const { consent, grantConsent, denyConsent } = useConsent();

  if (consent.analytics) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        gap: "12px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        background: "#111827",
        color: "#f9fafb",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
      }}
      role="dialog"
      aria-live="polite"
    >
      <div>
        <strong style={{ display: "block", marginBottom: 4 }}>{title}</strong>
        <span style={{ fontSize: 14, opacity: 0.85 }}>{description}</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => {
            const next = denyConsent(["analytics", "marketing"]);
            onReject?.(next);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #4b5563",
            background: "transparent",
            color: "#f9fafb",
            cursor: "pointer",
          }}
        >
          {rejectLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = grantConsent(["analytics", "marketing"]);
            onAccept?.(next);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  );
}

export { AnalyticsClient, createAnalytics };
export type {
  AnalyticsProperties,
  AnalyticsProvider as AnalyticsProviderInterface,
  ConsentCategory,
  ConsentState,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";
