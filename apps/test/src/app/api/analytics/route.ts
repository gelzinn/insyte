import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      url: "http://localhost:3000/produto/1",
      path: "/produto/1",
      title: "Produto 1",
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
      { url: "/produto/1", views: 23 },
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, ...payload } = data;

    switch (action) {
      case "trackPageView":
        console.log("Page view tracked:", payload);
        return NextResponse.json({
          success: true,
          message: "Page view tracked (mock)",
          data: payload,
        });

      case "trackPageExit":
        console.log("Page exit tracked:", payload);
        return NextResponse.json({
          success: true,
          message: "Page exit tracked (mock)",
          data: payload,
        });

      case "getBounceRate":
        return NextResponse.json(mockData.bounceRate);

      case "getPageAnalytics":
        return NextResponse.json(mockData.pageAnalytics);

      case "getTrafficSources":
        return NextResponse.json(mockData.trafficSources);

      case "getCampaignAnalytics":
        return NextResponse.json(mockData.campaigns);

      case "getRealTimeAnalytics":
        return NextResponse.json(mockData.realTime);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json(mockData.realTime);
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
