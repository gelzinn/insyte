import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { ConsentState } from "../types";

export interface AnalyticsScriptDefinition {
  id: string;
  src?: string;
  inline?: string;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
  attributes?: Record<string, string>;
}

export interface AnalyticsScriptsConfig {
  googleAnalytics?: { measurementId: string };
  plausible?: { domain: string; apiHost?: string };
  clarity?: { projectId: string };
  hotjar?: { siteId: number | string; version?: number };
}

export function getAnalyticsScriptDefinitions(
  config: AnalyticsScriptsConfig,
): AnalyticsScriptDefinition[] {
  const scripts: AnalyticsScriptDefinition[] = [];

  if (config.googleAnalytics?.measurementId) {
    const id = config.googleAnalytics.measurementId;
    scripts.push(
      {
        id: "insyte-ga-loader",
        src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
        strategy: "afterInteractive",
      },
      {
        id: "insyte-ga-init",
        inline: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { send_page_view: false });
        `,
        strategy: "afterInteractive",
      },
    );
  }

  if (config.plausible?.domain) {
    const apiHost = (config.plausible.apiHost ?? "https://plausible.io").replace(/\/$/, "");
    scripts.push({
      id: "insyte-plausible",
      src: `${apiHost}/js/script.js`,
      strategy: "afterInteractive",
      attributes: { "data-domain": config.plausible.domain },
    });
  }

  if (config.clarity?.projectId) {
    scripts.push({
      id: "insyte-clarity",
      inline: `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${config.clarity.projectId}");
      `,
      strategy: "afterInteractive",
    });
  }

  if (config.hotjar?.siteId) {
    const version = config.hotjar.version ?? 6;
    scripts.push({
      id: "insyte-hotjar",
      inline: `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${config.hotjar.siteId},hjsv:${version}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
      strategy: "afterInteractive",
    });
  }

  return scripts;
}

export function renderAnalyticsHeadScripts(config: AnalyticsScriptsConfig): string {
  return getAnalyticsScriptDefinitions(config)
    .filter((script) => script.inline)
    .map((script) => `<script id="${script.id}">${script.inline}</script>`)
    .join("\n");
}

export interface ConsentMiddlewareOptions {
  cookieName?: string;
  requiredCategories?: Array<keyof ConsentState>;
  allowPaths?: string[];
  redirectTo?: string;
}

export function parseConsentCookie(
  cookieValue: string | undefined,
): ConsentState | null {
  if (!cookieValue) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as ConsentState;
  } catch {
    return null;
  }
}

export function hasRequiredConsent(
  consent: ConsentState | null,
  requiredCategories: Array<keyof ConsentState> = ["analytics"],
): boolean {
  if (!consent) {
    return false;
  }

  return requiredCategories.every((category) => {
    if (category === "necessary") {
      return true;
    }
    return Boolean(consent[category]);
  });
}

export function createConsentMiddleware(options: ConsentMiddlewareOptions = {}) {
  const cookieName = options.cookieName ?? "insyte-consent";
  const requiredCategories = options.requiredCategories ?? ["analytics"];
  const allowPaths = options.allowPaths ?? ["/privacy", "/cookies", "/api/"];

  return function consentMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (allowPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const consent = parseConsentCookie(request.cookies.get(cookieName)?.value);
    const allowed = hasRequiredConsent(consent, requiredCategories);

    const response = NextResponse.next();
    response.headers.set("x-insyte-analytics-consent", allowed ? "granted" : "denied");

    if (consent) {
      response.headers.set("x-insyte-analytics-consent-state", JSON.stringify(consent));
    }

    if (!allowed && options.redirectTo && pathname === options.redirectTo) {
      return response;
    }

    return response;
  };
}

export type { ConsentState };
