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
            <SidebarMenuButton size="lg" className="h-auto py-2" tooltip={database}>
              <Database />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Database</span>
                <span className="truncate text-xs text-muted-foreground">
                  {databaseName(database)}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-auto py-2" onClick={cycleTheme}>
              <ThemeIcon />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Theme</span>
                <span className="truncate text-xs text-muted-foreground">{themeMode}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
