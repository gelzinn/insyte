import type { ModelId } from "@/lib/models";

interface StudioContextInput {
  model: ModelId;
  modelLabel: string;
  filter: string;
  overview?: {
    totalPageviews: number;
    totalEvents: number;
    uniqueSessions: number;
  } | null;
  liveOverview?: { pageViewsPerMinute: number } | null;
  counts?: {
    pageviews: number;
    events: number;
    sessions: number;
  };
  columns: string[];
  rows: Record<string, unknown>[];
  secondaryTitle?: string;
  secondaryRows?: Record<string, unknown>[];
  selectedRecord?: Record<string, unknown> | null;
}

export function buildStudioContext(input: StudioContextInput): string {
  return JSON.stringify(
    {
      currentView: input.modelLabel,
      viewId: input.model,
      activeFilter: input.filter || null,
      overview: input.overview,
      live: input.liveOverview,
      counts: input.counts,
      visibleColumns: input.columns,
      visibleRecords: input.rows.slice(0, 15),
      secondaryTable: input.secondaryTitle
        ? {
            title: input.secondaryTitle,
            records: (input.secondaryRows ?? []).slice(0, 10),
          }
        : null,
      selectedRecord: input.selectedRecord ?? null,
    },
    null,
    2,
  );
}
