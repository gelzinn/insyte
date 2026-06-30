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
  { id: "pageviews", label: "Pageviews", icon: Eye },
  { id: "events", label: "Events", icon: MousePointerClick },
  { id: "traffic", label: "Traffic", icon: BarChart3 },
  { id: "live", label: "Live", icon: Radio },
];

export function getModelLabel(id: ModelId): string {
  return MODELS.find((model) => model.id === id)?.label ?? id;
}
