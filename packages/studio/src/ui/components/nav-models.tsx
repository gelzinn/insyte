import type { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ModelId } from "@/lib/models";

interface NavModelsProps {
  items: Array<{
    id: ModelId;
    label: string;
    icon: LucideIcon;
    count?: number;
  }>;
  activeId: ModelId;
  onSelect: (id: ModelId) => void;
}

export function NavModels({ items, activeId, onSelect }: NavModelsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Browse</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              isActive={activeId === item.id}
              tooltip={item.label}
              onClick={() => onSelect(item.id)}
            >
              <item.icon />
              <span className="truncate">{item.label}</span>
            </SidebarMenuButton>
            {item.count !== undefined ? (
              <SidebarMenuBadge>{item.count.toLocaleString()}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
