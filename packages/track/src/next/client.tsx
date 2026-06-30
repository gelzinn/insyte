"use client";

import Script from "next/script";
import { getAnalyticsScriptDefinitions, type AnalyticsScriptsConfig } from "../next/index";

export interface AnalyticsScriptsProps extends AnalyticsScriptsConfig {
  enabled?: boolean;
}

export function AnalyticsScripts({ enabled = true, ...config }: AnalyticsScriptsProps) {
  if (!enabled) {
    return null;
  }

  const scripts = getAnalyticsScriptDefinitions(config);

  return (
    <>
      {scripts.map((script) =>
        script.src ? (
          <Script
            key={script.id}
            id={script.id}
            src={script.src}
            strategy={script.strategy ?? "afterInteractive"}
            {...(script.attributes ?? {})}
          />
        ) : (
          <Script
            key={script.id}
            id={script.id}
            strategy={script.strategy ?? "afterInteractive"}
            dangerouslySetInnerHTML={{ __html: script.inline ?? "" }}
          />
        ),
      )}
    </>
  );
}

export {
  createConsentMiddleware,
  getAnalyticsScriptDefinitions,
  hasRequiredConsent,
  parseConsentCookie,
  renderAnalyticsHeadScripts,
} from "../next/index";

export type { AnalyticsScriptDefinition, AnalyticsScriptsConfig, ConsentMiddlewareOptions } from "../next/index";
