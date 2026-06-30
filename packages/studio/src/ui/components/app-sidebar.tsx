import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { NavModels } from "@/components/nav-models";
import { NavSecondary } from "@/components/nav-secondary";
import { SidebarResizeRail } from "@/components/sidebar-resize-rail";
import { MODELS, type ModelId } from "@/lib/models";

export const LEFT_SIDEBAR_DEFAULT_WIDTH = 256;
export const LEFT_SIDEBAR_MIN_WIDTH = 256;
export const LEFT_SIDEBAR_MAX_WIDTH = 480;

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  counts: Record<ModelId, number>;
  database?: string;
  width: number;
  onWidthChange: (width: number) => void;
}

export function AppSidebar({
  model,
  onModelChange,
  counts,
  database,
  width,
  onWidthChange,
  ...props
}: AppSidebarProps) {
  const { open } = useSidebar();
  const navItems = MODELS.map((item) => ({
    ...item,
    count: item.id === "overview" ? undefined : counts[item.id],
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="px-2 py-1">
          <div className="font-semibold">Insyte Studio</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavModels items={navItems} activeId={model} onSelect={onModelChange} />
        <NavSecondary database={database} className="mt-auto" />
      </SidebarContent>
      {open ? (
        <SidebarResizeRail
          side="left"
          width={width}
          minWidth={LEFT_SIDEBAR_MIN_WIDTH}
          maxWidth={LEFT_SIDEBAR_MAX_WIDTH}
          onWidthChange={onWidthChange}
        />
      ) : null}
    </Sidebar>
  );
}
