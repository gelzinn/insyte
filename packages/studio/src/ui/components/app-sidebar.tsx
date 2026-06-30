import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavModels } from "@/components/nav-models";
import { NavSecondary } from "@/components/nav-secondary";
import { MODELS, type ModelId } from "@/lib/models";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  model: ModelId;
  onModelChange: (model: ModelId) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  counts: Record<ModelId, number>;
  database?: string;
}

export function AppSidebar({
  model,
  onModelChange,
  filter,
  onFilterChange,
  counts,
  database,
  ...props
}: AppSidebarProps) {
  const navItems = MODELS.map((item) => ({
    ...item,
    count: item.id === "overview" ? undefined : counts[item.id],
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                in
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Insyte Studio</span>
                <span className="truncate text-xs text-muted-foreground">
                  Local analytics database
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarInput
          type="search"
          placeholder="Search records..."
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavModels items={navItems} activeId={model} onSelect={onModelChange} />
        <NavSecondary database={database} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
