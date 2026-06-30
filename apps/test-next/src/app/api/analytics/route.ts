import { NextRequest, NextResponse } from "next/server";

const studioUrl =
  process.env.INSYTE_STUDIO_URL ??
  process.env.NEXT_PUBLIC_INSYTE_STUDIO_URL ??
  "http://127.0.0.1:5555";

const mockData = {
  bounceRate: {
    bounceRate: 23.5,
    totalSessions: 45,
    bouncedSessions: 11,
    averageSessionDuration: 185,
  },
  pageAnalytics: [
    {
      url: "http://localhost:3000/",
      path: "/",
      title: "Analytics Dashboard",
      views: 120,
      uniqueViews: 85,
      averageTimeOnPage: 45,
      bounceRate: 15.2,
      exitRate: 8.3,
      entrances: 45,
      topReferrers: [],
      topSources: [],
    },
    {
      url: "http://localhost:3000/product/1",
      path: "/product/1",
      title: "Product 1",
      views: 78,
      uniqueViews: 65,
      averageTimeOnPage: 120,
      bounceRate: 28.1,
      exitRate: 12.5,
      entrances: 32,
      topReferrers: [],
      topSources: [],
    },
  ],
  trafficSources: [
    { source: "direct", count: 45, percentage: 35.4 },
    { source: "organic", count: 32, percentage: 25.2 },
    { source: "social", count: 28, percentage: 22.0 },
    { source: "referral", count: 22, percentage: 17.4 },
  ],
  campaigns: [
    {
      campaignName: "summer_sale",
      source: "facebook",
      medium: "social",
      sessions: 28,
      bounceRate: 18.5,
    },
  ],
  realTime: {
    activeUsers: 12,
    pageViewsPerMinute: 8,
    topPages: [
      { url: "/", views: 45 },
      { url: "/product/1", views: 23 },
    ],
  },
};

async function fetchStudioJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${studioUrl}${path}`, {
      ...init,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action } = data;

    switch (action) {
      case "trackPageView":
      case "trackPageExit": {
        const tracked = await fetchStudioJson("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (tracked) {
          return NextResponse.json(tracked);
        }

        console.log(`Analytics action (${action}):`, data);
        return NextResponse.json({
          success: true,
          message: `${action} tracked (mock fallback)`,
          data,
        });
      }

      case "getBounceRate": {
        const bounceRate = await fetchStudioJson<typeof mockData.bounceRate>("/api/bounce-rate");
        return NextResponse.json(bounceRate ?? mockData.bounceRate);
      }

      case "getPageAnalytics": {
        const pageviews = await fetchStudioJson<{ aggregated: typeof mockData.pageAnalytics }>(
          "/api/pageviews",
        );
        return NextResponse.json(pageviews?.aggregated ?? mockData.pageAnalytics);
      }

      case "getTrafficSources": {
        const traffic = await fetchStudioJson<{ sources: typeof mockData.trafficSources }>(
          "/api/traffic",
        );
        return NextResponse.json(traffic?.sources ?? mockData.trafficSources);
      }

      case "getCampaignAnalytics": {
        const traffic = await fetchStudioJson<{ campaigns: typeof mockData.campaigns }>(
          "/api/traffic",
        );
        return NextResponse.json(traffic?.campaigns ?? mockData.campaigns);
      }

      case "getRealTimeAnalytics": {
        const live = await fetchStudioJson<typeof mockData.realTime>("/api/live");
        return NextResponse.json(live ?? mockData.realTime);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const live = await fetchStudioJson<typeof mockData.realTime>("/api/live");
    return NextResponse.json(live ?? mockData.realTime);
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
