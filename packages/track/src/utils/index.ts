const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

export async function loadScript(
  src: string,
  attributes?: Record<string, string>,
): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        script.setAttribute(key, value);
      }
    }

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export function getCurrentPageProperties(): {
  path: string;
  url: string;
  title: string;
  referrer: string;
} {
  if (!isBrowser()) {
    return { path: "", url: "", title: "", referrer: "" };
  }

  return {
    path: window.location.pathname,
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
  };
}

export function debugLog(enabled: boolean, provider: string, message: string, data?: unknown): void {
  if (!enabled) {
    return;
  }

  if (data !== undefined) {
    console.debug(`[@insyte/track:${provider}] ${message}`, data);
    return;
  }

  console.debug(`[@insyte/track:${provider}] ${message}`);
}

export { isBrowser };
