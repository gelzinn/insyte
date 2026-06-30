import type {
  AnalyticsProvider,
  AnalyticsProviderConfig,
  AnalyticsProperties,
  PageProperties,
  UserTraits,
} from "../types";
import { debugLog, getCurrentPageProperties, isBrowser } from "../utils";

export interface InsyteConfig extends AnalyticsProviderConfig {
  /** Insyte Studio URL (default: http://127.0.0.1:5555) */
  studioUrl?: string;
  /** Track page exit duration (default: true) */
  trackPageExit?: boolean;
}

interface IngestPayload {
  type: "pageview" | "page_exit" | "track" | "identify";
  sessionId: string;
  userId?: string;
  event?: string;
  url?: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  duration?: number;
  properties?: Record<string, unknown>;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  provider?: string;
}

const SESSION_KEY = "insyte-session-id";
const USER_KEY = "insyte-user-id";
const PROVIDER_NAME = "insyte";

function getOrCreateSessionId(): string {
  if (!isBrowser()) {
    return `server-${Date.now()}`;
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

function getStoredUserId(): string | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  return localStorage.getItem(USER_KEY) ?? undefined;
}

function storeUserId(userId: string): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(USER_KEY, userId);
}

function clearStoredUserId(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(USER_KEY);
}

function parseUtmParams(url: string): IngestPayload["utmParams"] | undefined {
  try {
    const parsed = new URL(url);
    const source = parsed.searchParams.get("utm_source") ?? undefined;
    const medium = parsed.searchParams.get("utm_medium") ?? undefined;
    const campaign = parsed.searchParams.get("utm_campaign") ?? undefined;
    const term = parsed.searchParams.get("utm_term") ?? undefined;
    const content = parsed.searchParams.get("utm_content") ?? undefined;

    if (!source && !medium && !campaign && !term && !content) {
      return undefined;
    }

    return { source, medium, campaign, term, content };
  } catch {
    return undefined;
  }
}

async function sendIngest(studioUrl: string, payload: IngestPayload): Promise<void> {
  const endpoint = `${studioUrl.replace(/\/$/, "")}/ingest`;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.error(`[@insyte/track:${PROVIDER_NAME}] Failed to send event`, error);
  }
}

export function insyte(config: InsyteConfig = {}): AnalyticsProvider {
  const {
    studioUrl = "http://127.0.0.1:5555",
    enabled = true,
    debug = false,
    trackPageExit = true,
  } = config;

  let pageEnteredAt = 0;
  let currentPageUrl = "";
  let exitListenerAttached = false;

  const sendPageExit = (): void => {
    if (!trackPageExit || !currentPageUrl || !pageEnteredAt) {
      return;
    }

    const duration = Math.round((Date.now() - pageEnteredAt) / 1000);
    void sendIngest(studioUrl, {
      type: "page_exit",
      sessionId: getOrCreateSessionId(),
      url: currentPageUrl,
      duration,
      provider: PROVIDER_NAME,
    });
  };

  const attachExitListener = (): void => {
    if (!isBrowser() || !trackPageExit || exitListenerAttached) {
      return;
    }

    exitListenerAttached = true;
    window.addEventListener("pagehide", sendPageExit);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        sendPageExit();
      }
    });
  };

  return {
    name: PROVIDER_NAME,
    async init() {
      if (!enabled) {
        return;
      }

      attachExitListener();
      debugLog(debug, PROVIDER_NAME, "initialized", { studioUrl });
    },
    track(event: string, properties?: AnalyticsProperties) {
      if (!enabled) {
        return;
      }

      const pageData = getCurrentPageProperties();
      void sendIngest(studioUrl, {
        type: "track",
        sessionId: getOrCreateSessionId(),
        userId: getStoredUserId(),
        event,
        url: pageData.url,
        title: pageData.title,
        referrer: pageData.referrer,
        userAgent: isBrowser() ? navigator.userAgent : undefined,
        properties: properties as Record<string, unknown> | undefined,
        utmParams: pageData.url ? parseUtmParams(pageData.url) : undefined,
        provider: PROVIDER_NAME,
      });
      debugLog(debug, PROVIDER_NAME, "track", { event, properties });
    },
    page(properties?: PageProperties) {
      if (!enabled) {
        return;
      }

      sendPageExit();

      const pageData = { ...getCurrentPageProperties(), ...properties };
      currentPageUrl = pageData.url ?? "";
      pageEnteredAt = Date.now();

      void sendIngest(studioUrl, {
        type: "pageview",
        sessionId: getOrCreateSessionId(),
        userId: getStoredUserId(),
        url: pageData.url,
        title: pageData.title,
        referrer: pageData.referrer,
        userAgent: isBrowser() ? navigator.userAgent : undefined,
        utmParams: pageData.url ? parseUtmParams(pageData.url) : undefined,
        provider: PROVIDER_NAME,
      });
      debugLog(debug, PROVIDER_NAME, "page", pageData);
    },
    identify(userId: string, traits?: UserTraits) {
      if (!enabled) {
        return;
      }

      storeUserId(userId);

      const pageData = getCurrentPageProperties();
      void sendIngest(studioUrl, {
        type: "identify",
        sessionId: getOrCreateSessionId(),
        userId,
        url: pageData.url,
        referrer: pageData.referrer,
        userAgent: isBrowser() ? navigator.userAgent : undefined,
        properties: traits as Record<string, unknown> | undefined,
        provider: PROVIDER_NAME,
      });
      debugLog(debug, PROVIDER_NAME, "identify", { userId, traits });
    },
    reset() {
      if (!enabled) {
        return;
      }

      clearStoredUserId();
      debugLog(debug, PROVIDER_NAME, "reset");
    },
    setUserProperties(properties: UserTraits) {
      if (!enabled) {
        return;
      }

      const userId = getStoredUserId();
      if (!userId) {
        debugLog(debug, PROVIDER_NAME, "setUserProperties skipped — call identify() first");
        return;
      }

      storeUserId(userId);

      const pageData = getCurrentPageProperties();
      void sendIngest(studioUrl, {
        type: "identify",
        sessionId: getOrCreateSessionId(),
        userId,
        url: pageData.url,
        referrer: pageData.referrer,
        userAgent: isBrowser() ? navigator.userAgent : undefined,
        properties: properties as Record<string, unknown> | undefined,
        provider: PROVIDER_NAME,
      });
      debugLog(debug, PROVIDER_NAME, "setUserProperties", properties);
    },
  };
}
