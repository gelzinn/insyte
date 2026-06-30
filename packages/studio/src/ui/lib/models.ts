import {
  BarChart3,
  Eye,
  LayoutDashboard,
  MousePointerClick,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type ModelId = "overview" | "pageviews" | "events" | "traffic" | "live";

export const MODELS: Array<{ id: ModelId; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "pageviews", label: "pageviews", icon: Eye },
  { id: "events", label: "events", icon: MousePointerClick },
  { id: "traffic", label: "traffic_sources", icon: BarChart3 },
  { id: "live", label: "live", icon: Radio },
];
