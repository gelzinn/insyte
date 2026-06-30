import { useEffect, useState } from "react";
import { fetchJson } from "./api";

type Page = "overview" | "pageviews" | "events" | "traffic" | "live";

interface Overview {
  totalPageviews: number;
  totalEvents: number;
  uniqueSessions: number;
  uniqueUsers: number;
}

interface LiveData {
  activeUsers: number;
  pageViewsPerMinute: number;
  topPages: Array<{ url: string; views: number }>;
}

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pageviews, setPageviews] = useState<{ recent: unknown[]; aggregated: unknown[] } | null>(null);
  const [events, setEvents] = useState<{ events: unknown[] } | null>(null);
  const [traffic, setTraffic] = useState<{ sources: unknown[]; campaigns: unknown[] } | null>(null);
  const [live, setLive] = useState<LiveData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (page === "overview") {
          setOverview(await fetchJson<Overview>("/api/overview"));
        } else if (page === "pageviews") {
          setPageviews(await fetchJson("/api/pageviews"));
        } else if (page === "events") {
          setEvents(await fetchJson("/api/events"));
        } else if (page === "traffic") {
          setTraffic(await fetchJson("/api/traffic"));
        } else if (page === "live") {
          setLive(await fetchJson<LiveData>("/api/live"));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    const interval = page === "live" ? setInterval(load, 5000) : undefined;
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [page]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Insyte Studio</div>
        <div className="brand-sub">Local analytics dashboard</div>
        <nav className="nav">
          {(
            [
              ["overview", "Overview"],
              ["pageviews", "Pageviews"],
              ["events", "Events"],
              ["traffic", "Traffic"],
              ["live", "Live"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {page === "overview" && (
          <>
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">Unified metrics from your local analytics database</p>
          </>
        )}
        {page === "pageviews" && (
          <>
            <h1 className="page-title">Pageviews</h1>
            <p className="page-subtitle">Recent pageviews and aggregated page performance</p>
          </>
        )}
        {page === "events" && (
          <>
            <h1 className="page-title">Events</h1>
            <p className="page-subtitle">Custom events collected from your apps</p>
          </>
        )}
        {page === "traffic" && (
          <>
            <h1 className="page-title">Traffic</h1>
            <p className="page-subtitle">Sources and campaign attribution</p>
          </>
        )}
        {page === "live" && (
          <>
            <h1 className="page-title">Live</h1>
            <p className="page-subtitle">Real-time activity (refreshes every 5s)</p>
          </>
        )}

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && page === "overview" && overview && (
          <div className="stats-grid">
            <StatCard label="Pageviews" value={overview.totalPageviews} />
            <StatCard label="Events" value={overview.totalEvents} />
            <StatCard label="Sessions" value={overview.uniqueSessions} />
            <StatCard label="Users" value={overview.uniqueUsers} />
          </div>
        )}

        {!loading && !error && page === "pageviews" && pageviews && (
          <div className="grid-2">
            <TableSection title="Recent pageviews" rows={pageviews.recent as Record<string, unknown>[]} columns={["path", "url", "sessionId", "timestamp"]} />
            <TableSection title="Top pages" rows={pageviews.aggregated as Record<string, unknown>[]} columns={["path", "views", "uniqueViews", "bounceRate"]} />
          </div>
        )}

        {!loading && !error && page === "events" && events && (
          <TableSection title="Recent events" rows={events.events as Record<string, unknown>[]} columns={["eventType", "sessionId", "url", "timestamp"]} />
        )}

        {!loading && !error && page === "traffic" && traffic && (
          <div className="grid-2">
            <TableSection title="Traffic sources" rows={traffic.sources as Record<string, unknown>[]} columns={["source", "count", "percentage"]} />
            <TableSection title="Campaigns" rows={traffic.campaigns as Record<string, unknown>[]} columns={["campaignName", "source", "medium", "sessions"]} />
          </div>
        )}

        {!loading && !error && page === "live" && live && (
          <>
            <div className="stats-grid">
              <StatCard label="Active users" value={live.activeUsers} />
              <StatCard label="Pageviews / min" value={live.pageViewsPerMinute} />
            </div>
            <TableSection title="Top pages (last hour)" rows={live.topPages as Record<string, unknown>[]} columns={["url", "views"]} />
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value.toLocaleString()}</div>
    </div>
  );
}

function TableSection({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  return (
    <section>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="muted">
                  No data yet. Send events to <span className="mono">/ingest</span>.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column} className="mono">
                      {formatCell(row[column])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
