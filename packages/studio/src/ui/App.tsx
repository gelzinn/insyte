import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "./api";
import {
  DataTable,
  EmptyOverview,
  RecordDetailPanel,
} from "@/components/data-table";
import { MetricCards } from "@/components/metric-cards";
import { LiveIndicator, ModelSidebar, MODELS, type ModelId } from "@/components/model-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
        const data = await fetchJson<{
          recent: Record<string, unknown>[];
          aggregated: Record<string, unknown>[];
        }>("/api/pageviews");
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
        const data = await fetchJson<{
          sources: Record<string, unknown>[];
          campaigns: Record<string, unknown>[];
        }>("/api/traffic");
        setRows(data.sources);
        setColumns(["source", "count", "percentage"]);
        setSecondaryTitle("Campaigns");
        setSecondaryRows(data.campaigns);
        setSecondaryColumns(["campaignName", "source", "medium", "sessions"]);
        return;
      }

      if (model === "live") {
        const data = await fetchJson<{
          activeUsers: number;
          pageViewsPerMinute: number;
          topPages: Record<string, unknown>[];
        }>("/api/live");
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
    <div className="flex min-h-screen bg-background">
      <ModelSidebar
        model={model}
        onModelChange={setModel}
        filter={filter}
        onFilterChange={setFilter}
        counts={modelCounts}
        database={status?.database}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            {model === "live" ? <LiveIndicator /> : null}
            <h1 className="text-base font-semibold">{currentModel.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </header>

        {error ? (
          <div className="mx-6 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-auto p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : null}

            {!loading && model === "overview" && overview ? (
              <div className="space-y-6">
                <MetricCards
                  items={[
                    { label: "Pageviews", value: overview.totalPageviews },
                    { label: "Events", value: overview.totalEvents },
                    { label: "Sessions", value: overview.uniqueSessions },
                    { label: "Users", value: overview.uniqueUsers },
                  ]}
                />
                {overview.totalPageviews === 0 && overview.totalEvents === 0 ? (
                  <EmptyOverview />
                ) : null}
              </div>
            ) : null}

            {!loading && model === "live" && overview ? (
              <div className="space-y-6">
                <MetricCards
                  items={[
                    { label: "Active users", value: overview.uniqueUsers },
                    { label: "Pageviews / min", value: overview.totalPageviews },
                  ]}
                />
                <DataTable
                  title={`${filteredRows.length} records`}
                  description="Top pages in the last hour"
                  rows={filteredRows}
                  columns={columns}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>
            ) : null}

            {!loading && model !== "overview" && model !== "live" ? (
              <div className={secondaryRows.length ? "grid gap-6 xl:grid-cols-2" : "space-y-6"}>
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
          </main>

          {selected ? (
            <RecordDetailPanel record={selected} onClose={() => setSelected(null)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
