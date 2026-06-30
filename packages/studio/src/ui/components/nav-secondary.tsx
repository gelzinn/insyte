import * as React from "react";
import { Database, Moon, Monitor, Sun } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";

interface NavSecondaryProps {
  database?: string;
}

export function NavSecondary({ database, ...props }: NavSecondaryProps & React.ComponentProps<typeof SidebarGroup>) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const ThemeIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const themeLabel =
    theme === "system" ? "System theme" : theme === "dark" ? "Dark mode" : "Light mode";

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" className="h-auto py-2">
              <Database />
              <span className="break-all text-xs leading-relaxed">
                {database ?? "Connecting..."}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" onClick={cycleTheme} tooltip={themeLabel}>
              <ThemeIcon />
              <span>{themeLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
