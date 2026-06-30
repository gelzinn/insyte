import type { WebAnalyticsEngine } from "insyte";

export interface IngestPayload {
  type: "pageview" | "page_exit" | "track" | "identify";
  sessionId: string;
  userId?: string;
  event?: string;
  url?: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
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
  timestamp?: string;
}

export async function handleIngest(
  engine: WebAnalyticsEngine,
  payload: IngestPayload,
): Promise<{ success: boolean; message: string }> {
  const userAgent = payload.userAgent ?? "InsyteStudio/1.0";
  const url = payload.url ?? "http://localhost/";

  switch (payload.type) {
    case "pageview":
      await engine.trackPageView({
        sessionId: payload.sessionId,
        userId: payload.userId,
        url,
        referrer: payload.referrer,
        userAgent,
        ip: payload.ip,
        utmParams: payload.utmParams,
      });
      return { success: true, message: "Pageview ingested" };

    case "page_exit":
      if (payload.url && payload.duration !== undefined) {
        await engine.trackPageExit(payload.sessionId, payload.url, payload.duration);
      }
      return { success: true, message: "Page exit ingested" };

    case "track":
      await engine.trackCustomEvent(
        {
          name: payload.event ?? "track",
          category: payload.provider,
          customParameters: {
            ...payload.properties,
            provider: payload.provider,
          },
        },
        {
          sessionId: payload.sessionId,
          userId: payload.userId,
          url: payload.url,
          referrer: payload.referrer,
          userAgent,
        },
      );
      return { success: true, message: "Event ingested" };

    case "identify":
      await engine.trackCustomEvent(
        {
          name: "identify",
          customParameters: {
            userId: payload.userId,
            traits: payload.properties,
            provider: payload.provider,
          },
        },
        {
          sessionId: payload.sessionId,
          userId: payload.userId,
          url: payload.url,
          referrer: payload.referrer,
          userAgent,
        },
      );
      return { success: true, message: "Identify ingested" };

    default:
      return { success: false, message: "Unknown ingest type" };
  }
}
