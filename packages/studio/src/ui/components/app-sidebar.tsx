import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
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
        <div className="px-2">
          <div className="font-semibold">Insyte Studio</div>
          <div className="text-xs text-muted-foreground">Local analytics database</div>
        </div>
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
