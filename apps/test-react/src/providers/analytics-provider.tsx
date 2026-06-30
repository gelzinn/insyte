import { InsyteProvider } from "@insyte/track/react";

export function AppAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <InsyteProvider autoPageView>{children}</InsyteProvider>;
}
