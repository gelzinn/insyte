"use client";

import { useState, useEffect } from "react";
import { TrackDemoButton } from "./components/track-demo-button";

interface BounceRate {
  bounceRate: number;
  totalSessions: number;
  bouncedSessions: number;
  averageSessionDuration: number;
}

interface PageAnalytics {
  url: string;
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  entrances: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
}

interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

interface CampaignAnalytics {
  campaignName: string;
  source: string;
  medium: string;
  sessions: number;
  bounceRate: number;
}

interface RealTimeAnalytics {
  activeUsers: number;
  pageViewsPerMinute: number;
  topPages: Array<{ url: string; views: number }>;
}

export default function AnalyticsDashboard() {
  const [bounceRate, setBounceRate] = useState<BounceRate | null>(null);
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [realTime, setRealTime] = useState<RealTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [bounceRes, pagesRes, trafficRes, campaignsRes, realTimeRes] =
        await Promise.all([
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getBounceRate" }),
          }),
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getPageAnalytics" }),
          }),
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getTrafficSources" }),
          }),
          fetch("/api/analytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "getCampaignAnalytics" }),
          }),
          fetch("/api/analytics"),
        ]);

      const bounceData = await bounceRes.json();
      const pagesData = await pagesRes.json();
      const trafficData = await trafficRes.json();
      const campaignsData = await campaignsRes.json();
      const realTimeData = await realTimeRes.json();

      setBounceRate(bounceData);
      setPageAnalytics(pagesData);
      setTrafficSources(trafficData);
      setCampaigns(campaignsData);
      setRealTime(realTimeData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Update real-time data every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const simulatePageView = async () => {
    try {
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trackPageView",
          sessionId: `session_${Date.now()}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          url: window.location.href,
          title: document.title,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
          ip: "127.0.0.1",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Page view tracked successfully!");
        fetchAnalytics(); // Refresh data
      }
    } catch (error) {
      console.error("Failed to track page view:", error);
      alert("Failed to track page view");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-gray-600">
                Monitor your website performance in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <TrackDemoButton />
              <button
              onClick={simulatePageView}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Simulate Page View
            </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Stats */}
        {realTime && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realTime.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Page Views/min
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {realTime.pageViewsPerMinute}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📈</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Bounce Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bounceRate
                      ? `${bounceRate.bounceRate.toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
            </div>
            <div className="p-6">
              {pageAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {pageAnalytics.slice(0, 5).map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {page.path}
                        </p>
                        <p className="text-sm text-gray-500">
                          {page.title || "No title"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {page.views} views
                        </p>
                        <p className="text-sm text-gray-500">
                          {page.uniqueViews} unique
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No page data available</p>
              )}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Traffic Sources
              </h3>
            </div>
            <div className="p-6">
              {trafficSources.length > 0 ? (
                <div className="space-y-4">
                  {trafficSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {source.source === "organic"
                            ? "🔍"
                            : source.source === "paid"
                              ? "💰"
                              : source.source === "social"
                                ? "📱"
                                : source.source === "referral"
                                  ? "🔗"
                                  : "🎯"}
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {source.source}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {source.count}
                        </p>
                        <p className="text-sm text-gray-500">
                          {source.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No traffic source data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Campaign Analytics
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source/Medium
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bounce Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {campaign.campaignName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.source}/{campaign.medium}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.sessions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.bounceRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analytics */}
        {bounceRate && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Total Sessions
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {bounceRate.totalSessions}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Bounced Sessions
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {bounceRate.bouncedSessions}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Avg Session Duration
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(bounceRate.averageSessionDuration / 60)}m{" "}
                {Math.floor(bounceRate.averageSessionDuration % 60)}s
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
