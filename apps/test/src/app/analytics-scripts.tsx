"use client";

import { AnalyticsScripts } from "@insyte/track/next/client";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function AppAnalyticsScripts() {
  if (!gaMeasurementId && !plausibleDomain) {
    return null;
  }

  return (
    <AnalyticsScripts
      enabled={Boolean(gaMeasurementId || plausibleDomain)}
      googleAnalytics={gaMeasurementId ? { measurementId: gaMeasurementId } : undefined}
      plausible={plausibleDomain ? { domain: plausibleDomain } : undefined}
    />
  );
}
