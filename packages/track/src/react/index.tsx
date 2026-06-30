"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { AnalyticsClient, createAnalytics } from "../core/analytics-client";
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
  ...options
}: AnalyticsProviderProps) {
  const clientRef = useRef<AnalyticsClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = createAnalytics(options);
  }

  useEffect(() => {
    if (!autoInit || !clientRef.current) {
      return;
    }

    let cleanup: (() => void) | undefined;

    void clientRef.current.init().then(() => {
      if (autoPageView && clientRef.current) {
        cleanup = clientRef.current.setupAutoPageView();
      }
    });

    return () => cleanup?.();
  }, [autoInit, autoPageView]);

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

export { AnalyticsClient, createAnalytics };
export type {
  AnalyticsProperties,
  AnalyticsProvider as AnalyticsProviderInterface,
  CreateAnalyticsOptions,
  PageProperties,
  TrackOptions,
  UserTraits,
} from "../types";
