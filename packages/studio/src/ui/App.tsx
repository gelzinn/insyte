import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "./api";

type ModelId = "overview" | "pageviews" | "events" | "traffic" | "live";

interface Status {
  database: string;
  counts: {
    pageviews: number;
    events: number;
    sessions: number;
    users: number;
  };
}

interface Overview {
  totalPageviews: number;
  totalEvents: number;
  uniqueSessions: number;
  uniqueUsers: number;
}

const MODELS: Array<{ id: ModelId; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "◆" },
  { id: "pageviews", label: "pageviews", icon: "▤" },
  { id: "events", label: "events", icon: "⚡" },
  { id: "traffic", label: "traffic_sources", icon: "↗" },
  { id: "live", label: "live", icon: "●" },
];

export default function App() {
  const [model, setModel] = useState<ModelId>("pageviews");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [secondaryRows, setSecondaryRows] = useState<Record<string, unknown>[]>([]);
  const [secondaryColumns, setSecondaryColumns] = useState<string[]>([]);
  const [secondaryTitle, setSecondaryTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextStatus = await fetchJson<Status>("/api/status");
      setStatus(nextStatus);

      if (model === "overview") {
        setOverview(await fetchJson<Overview>("/api/overview"));
        setRows([]);
        setColumns([]);
        setSecondaryRows([]);
        return;
      }

      if (model === "pageviews") {
        const data = await fetchJson<{ recent: Record<string, unknown>[]; aggregated: Record<string, unknown>[] }>(
          "/api/pageviews",
        );
        setRows(data.recent);
        setColumns(["path", "url", "sessionId", "referrer", "duration", "timestamp"]);
        setSecondaryTitle("Top pages");
        setSecondaryRows(data.aggregated);
        setSecondaryColumns(["path", "views", "uniqueViews", "bounceRate", "exitRate"]);
        return;
      }

      if (model === "events") {
        const data = await fetchJson<{ events: Record<string, unknown>[] }>("/api/events");
        setRows(data.events);
        setColumns(["eventType", "sessionId", "userId", "url", "timestamp"]);
        setSecondaryRows([]);
        return;
      }

      if (model === "traffic") {
        const data = await fetchJson<{ sources: Record<string, unknown>[]; campaigns: Record<string, unknown>[] }>(
          "/api/traffic",
        );
        setRows(data.sources);
        setColumns(["source", "count", "percentage"]);
        setSecondaryTitle("Campaigns");
        setSecondaryRows(data.campaigns);
        setSecondaryColumns(["campaignName", "source", "medium", "sessions"]);
        return;
      }

      if (model === "live") {
        const data = await fetchJson<{ activeUsers: number; pageViewsPerMinute: number; topPages: Record<string, unknown>[] }>(
          "/api/live",
        );
        setOverview({
          totalPageviews: data.pageViewsPerMinute,
          totalEvents: data.activeUsers,
          uniqueSessions: 0,
          uniqueUsers: data.activeUsers,
        });
        setRows(data.topPages);
        setColumns(["url", "views"]);
        setSecondaryRows([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [model]);

  useEffect(() => {
    setSelected(null);
    void load();
    const interval = model === "live" ? setInterval(load, 5000) : undefined;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [load, model]);

  const filteredRows = useMemo(() => {
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, filter]);

  const modelCounts: Record<ModelId, number> = {
    overview: 0,
    pageviews: status?.counts.pageviews ?? 0,
    events: status?.counts.events ?? 0,
    traffic: status?.counts.sessions ?? 0,
    live: status?.counts.sessions ?? 0,
  };

  const currentModel = MODELS.find((m) => m.id === model)!;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-row">
            <div className="logo-mark">in</div>
            <div className="logo-title">Insyte Studio</div>
          </div>
          <div className="logo-sub">Browse your local analytics database</div>
        </div>

        <div className="search-box">
          <input
            type="search"
            placeholder="Search records..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="models-label">Models</div>
        <nav className="model-list">
          {MODELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`model-btn ${model === item.id ? "active" : ""}`}
              onClick={() => setModel(item.id)}
            >
              <span className="model-name">
                <span className="model-icon">{item.icon}</span>
                {item.label}
              </span>
              {item.id !== "overview" ? (
                <span className="model-count">{modelCounts[item.id].toLocaleString()}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">{status?.database ?? "Connecting..."}</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">
            {model === "live" && <span className="live-dot" style={{ display: "inline-block", marginRight: 8 }} />}
            {currentModel.label}
          </div>
          <div className="topbar-actions">
            <button type="button" className="btn" onClick={() => void load()}>
              Refresh
            </button>
          </div>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}
        {loading ? <div className="loading-bar">Loading records...</div> : null}

        <div className={`workspace ${selected ? "with-detail" : ""}`}>
          <div className="content">
            {!loading && model === "overview" && overview ? (
              <>
                <div className="overview-grid">
                  <MetricCard label="Pageviews" value={overview.totalPageviews} />
                  <MetricCard label="Events" value={overview.totalEvents} />
                  <MetricCard label="Sessions" value={overview.uniqueSessions} />
                  <MetricCard label="Users" value={overview.uniqueUsers} />
                </div>
                <EmptyHint />
              </>
            ) : null}

            {!loading && model === "live" && overview ? (
              <>
                <div className="overview-grid">
                  <MetricCard label="Active users" value={overview.uniqueUsers} />
                  <MetricCard label="Pageviews / min" value={overview.totalPageviews} />
                </div>
                <DataTable
                  title={`${filteredRows.length} records`}
                  rows={filteredRows}
                  columns={columns}
                  selected={selected}
                  onSelect={setSelected}
                />
              </>
            ) : null}

            {!loading && model !== "overview" && model !== "live" ? (
              <div className={secondaryRows.length ? "split-panels" : undefined}>
                <DataTable
                  title={`${filteredRows.length} records`}
                  rows={filteredRows}
                  columns={columns}
                  selected={selected}
                  onSelect={setSelected}
                  emptyLabel={model}
                />
                {secondaryRows.length ? (
                  <DataTable
                    title={secondaryTitle}
                    rows={secondaryRows}
                    columns={secondaryColumns}
                    selected={null}
                    onSelect={() => undefined}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          {selected ? (
            <aside className="detail-panel">
              <h3>Record details</h3>
              {Object.entries(selected).map(([key, value]) => (
                <div key={key} className="detail-row">
                  <div className="detail-key">{key}</div>
                  <div className="detail-value">{formatCell(value)}</div>
                </div>
              ))}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value.toLocaleString()}</div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="empty-state">
      <h2>No events yet</h2>
      <p>Install the SDK, run your app, and events will appear here automatically in development.</p>
      <p>
        <code>bun add @insyte/track</code> · <code>npx insyte studio</code>
      </p>
    </div>
  );
}

function DataTable({
  title,
  rows,
  columns,
  selected,
  onSelect,
  emptyLabel,
}: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
  selected: Record<string, unknown> | null;
  onSelect: (row: Record<string, unknown>) => void;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <h2>No {emptyLabel ?? "records"} yet</h2>
        <p>Send analytics from your app using the Insyte SDK.</p>
        <p>
          <code>analytics.track("button_clicked")</code>
        </p>
      </div>
    );
  }

  return (
    <div className="table-panel">
      <div className="table-toolbar">
        <span>{title}</span>
        <span>{columns.length} fields</span>
      </div>
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
            {rows.map((row, index) => (
              <tr
                key={index}
                className={selected === row ? "selected" : ""}
                onClick={() => onSelect(row)}
              >
                {columns.map((column) => (
                  <td key={column} className="cell-mono">
                    {formatCell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}
