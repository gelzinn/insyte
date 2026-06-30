import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;
  const label =
    theme === "system" ? "System theme" : theme === "dark" ? "Dark mode" : "Light mode";

  return (
    <Button variant="outline" size="icon" onClick={cycleTheme} title={label} aria-label={label}>
      <Icon className="size-4" />
    </Button>
  );
}
