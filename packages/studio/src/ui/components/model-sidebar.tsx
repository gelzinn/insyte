import {
  Activity,
  BarChart3,
  Database,
  Eye,
  LayoutDashboard,
  MousePointerClick,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ModelId = "overview" | "pageviews" | "events" | "traffic" | "live";

export const MODELS: Array<{ id: ModelId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pageviews", label: "pageviews", icon: Eye },
  { id: "events", label: "events", icon: MousePointerClick },
  { id: "traffic", label: "traffic_sources", icon: BarChart3 },
  { id: "live", label: "live", icon: Radio },
];

interface ModelSidebarProps {
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  counts: Record<ModelId, number>;
  database?: string;
}

export function ModelSidebar({
  model,
  onModelChange,
  filter,
  onFilterChange,
  counts,
  database,
}: ModelSidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            in
          </div>
          <div>
            <div className="font-semibold">Insyte Studio</div>
            <div className="text-xs text-muted-foreground">Local analytics database</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <Input
          type="search"
          placeholder="Search records..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-background/60"
        />
      </div>

      <Separator />

      <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Models
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-1 pb-4">
          {MODELS.map((item) => {
            const Icon = item.icon;
            const active = model === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onModelChange(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 opacity-70" />
                  <span className={cn(active && "font-medium")}>{item.label}</span>
                </span>
                {item.id !== "overview" ? (
                  <Badge variant={active ? "default" : "muted"} className="min-w-7 justify-center">
                    {counts[item.id].toLocaleString()}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="flex items-start gap-2 p-4 text-[11px] leading-relaxed text-muted-foreground">
        <Database className="mt-0.5 size-3.5 shrink-0" />
        <span className="break-all">{database ?? "Connecting..."}</span>
      </div>
    </aside>
  );
}

export function LiveIndicator() {
  return (
    <span className="relative flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
    </span>
  );
}

export function OverviewIcon() {
  return <Activity className="size-4 text-muted-foreground" />;
}
