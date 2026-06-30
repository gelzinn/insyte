import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "./api";
import { AppSidebar } from "@/components/app-sidebar";
import {
  DataTable,
  EmptyOverview,
  RecordDetailPanel,
} from "@/components/data-table";
import { LiveIndicator } from "@/components/live-indicator";
import { MetricCards } from "@/components/metric-cards";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MODELS, type ModelId } from "@/lib/models";

interface Status {
  database: string;
  counts: {
    pageviews: number;
    events: number;
    sessions: number;
  };
}

interface Overview {
  totalPageviews: number;
  totalEvents: number;
  uniqueSessions: number;
}

interface LiveOverview {
  pageViewsPerMinute: number;
}

function ContentSkeleton() {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function ContentSpinner() {
  return (
    <div className="flex min-h-[320px] items-center justify-center pt-4">
      <RefreshCw className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  const [model, setModel] = useState<ModelId>("pageviews");
  const [filter, setFilter] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedModel, setLoadedModel] = useState<ModelId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [liveOverview, setLiveOverview] = useState<LiveOverview | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [secondaryRows, setSecondaryRows] = useState<Record<string, unknown>[]>([]);
  const [secondaryColumns, setSecondaryColumns] = useState<string[]>([]);
  const [secondaryTitle, setSecondaryTitle] = useState("");

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      if (!silent && !initialLoading) {
        setRefreshing(true);
      }

      setError(null);

      try {
        const nextStatus = await fetchJson<
          Status & { counts: Status["counts"] & { users?: number } }
        >("/api/status");
        setStatus({
          database: nextStatus.database,
          counts: {
            pageviews: nextStatus.counts.pageviews,
            events: nextStatus.counts.events,
            sessions: nextStatus.counts.sessions,
          },
        });

        if (model === "overview") {
          const data = await fetchJson<Overview & { uniqueUsers?: number }>("/api/overview");
          setOverview({
            totalPageviews: data.totalPageviews,
            totalEvents: data.totalEvents,
            uniqueSessions: data.uniqueSessions,
          });
          setLiveOverview(null);
          setRows([]);
          setColumns([]);
          setSecondaryRows([]);
        } else if (model === "pageviews") {
          const data = await fetchJson<{
            recent: Record<string, unknown>[];
            aggregated: Record<string, unknown>[];
          }>("/api/pageviews");
          setOverview(null);
          setLiveOverview(null);
          setRows(data.recent);
          setColumns(["path", "url", "sessionId", "referrer", "duration", "timestamp"]);
          setSecondaryTitle("Top pages");
          setSecondaryRows(data.aggregated);
          setSecondaryColumns(["path", "views", "uniqueViews", "bounceRate", "exitRate"]);
        } else if (model === "events") {
          const data = await fetchJson<{ events: Record<string, unknown>[] }>("/api/events");
          setOverview(null);
          setLiveOverview(null);
          setRows(data.events);
          setColumns(["eventType", "sessionId", "url", "timestamp"]);
          setSecondaryRows([]);
        } else if (model === "traffic") {
          const data = await fetchJson<{
            sources: Record<string, unknown>[];
            campaigns: Record<string, unknown>[];
          }>("/api/traffic");
          setOverview(null);
          setLiveOverview(null);
          setRows(data.sources);
          setColumns(["source", "count", "percentage"]);
          setSecondaryTitle("Campaigns");
          setSecondaryRows(data.campaigns);
          setSecondaryColumns(["campaignName", "source", "medium", "sessions"]);
        } else if (model === "live") {
          const data = await fetchJson<{
            activeUsers: number;
            pageViewsPerMinute: number;
            topPages: Record<string, unknown>[];
          }>("/api/live");
          setOverview(null);
          setLiveOverview({ pageViewsPerMinute: data.pageViewsPerMinute });
          setRows(data.topPages);
          setColumns(["url", "views"]);
          setSecondaryRows([]);
        }

        setLoadedModel(model);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setInitialLoading(false);
        if (!silent) {
          setRefreshing(false);
        }
      }
    },
    [initialLoading, loadedModel, model],
  );

  useEffect(() => {
    setSelected(null);
    void load();
    const interval = model === "live" ? setInterval(() => void load({ silent: true }), 5000) : undefined;
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
  const isNavigating = loadedModel !== null && loadedModel !== model;
  const isBackgroundRefresh = refreshing && loadedModel === model;
  const showInitialSkeleton = initialLoading;
  const showNavigationSpinner = !initialLoading && isNavigating;
  const showContent = loadedModel === model && !initialLoading;

  function renderContent() {
    if (loadedModel === "overview" && overview) {
      return (
        <div className="space-y-6 pt-4">
          <MetricCards
            items={[
              { label: "Page views", value: overview.totalPageviews },
              { label: "Events", value: overview.totalEvents },
              { label: "Sessions", value: overview.uniqueSessions },
            ]}
          />
          {overview.totalPageviews === 0 && overview.totalEvents === 0 ? <EmptyOverview /> : null}
        </div>
      );
    }

    if (loadedModel === "live" && liveOverview) {
      return (
        <div className="space-y-6 pt-4">
          <MetricCards
            items={[{ label: "Page views / min", value: liveOverview.pageViewsPerMinute }]}
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
      );
    }

    if (loadedModel && loadedModel !== "overview" && loadedModel !== "live") {
      return (
        <div
          className={
            secondaryRows.length ? "grid gap-6 pt-4 xl:grid-cols-2" : "space-y-6 pt-4"
          }
        >
          <DataTable
            title={`${filteredRows.length} records`}
            rows={filteredRows}
            columns={columns}
            selected={selected}
            onSelect={setSelected}
            emptyLabel={MODELS.find((m) => m.id === loadedModel)?.label}
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
      );
    }

    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        model={model}
        onModelChange={setModel}
        filter={filter}
        onFilterChange={setFilter}
        counts={modelCounts}
        database={status?.database}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <span className="text-muted-foreground">Insyte Studio</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    {model === "live" ? <LiveIndicator /> : null}
                    {currentModel.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={refreshing || isNavigating}
            >
              <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
              Refresh
            </Button>
          </div>
        </header>

        {error ? (
          <div className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1 overflow-auto p-4 pt-0">
            {showInitialSkeleton ? <ContentSkeleton /> : null}
            {showNavigationSpinner ? <ContentSpinner /> : null}
            {showContent ? (
              <div
                className={cn(
                  "transition-opacity duration-200",
                  isBackgroundRefresh && "pointer-events-none opacity-60",
                )}
              >
                {renderContent()}
              </div>
            ) : null}
          </div>

          {selected ? (
            <RecordDetailPanel record={selected} onClose={() => setSelected(null)} />
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
