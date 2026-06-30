import * as React from "react";
import { Database, Moon, Monitor, Sun } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider";

interface NavSecondaryProps {
  database?: string;
}

function databaseName(path?: string): string {
  if (!path) return "Connecting…";
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

export function NavSecondary({
  database,
  ...props
}: NavSecondaryProps & React.ComponentProps<typeof SidebarGroup>) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const ThemeIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const themeMode =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-2" tooltip={database}>
              <Database className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Database</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {databaseName(database)}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="gap-2" onClick={cycleTheme}>
              <ThemeIcon className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Theme</span>
              <span className="shrink-0 text-xs text-muted-foreground">{themeMode}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
