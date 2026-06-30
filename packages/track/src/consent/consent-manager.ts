import type { ConsentCategory, ConsentOptions, ConsentState } from "../types";
import { isBrowser } from "../utils";

export const DEFAULT_PROVIDER_CATEGORIES: Record<string, ConsentCategory> = {
  "google-analytics": "analytics",
  mixpanel: "analytics",
  posthog: "analytics",
  segment: "analytics",
  amplitude: "analytics",
  plausible: "analytics",
  heap: "analytics",
  rudderstack: "analytics",
  hotjar: "analytics",
  clarity: "analytics",
  "facebook-pixel": "marketing",
};

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

type ConsentListener = (consent: ConsentState) => void;

export class ConsentManager {
  private storageKey: string;
  private storage: "localStorage" | "cookie";
  private cookieDomain?: string;
  private cookieMaxAge: number;
  private providerCategories: Record<string, ConsentCategory>;
  private listeners = new Set<ConsentListener>();
  private consent: ConsentState;

  constructor(options: ConsentOptions = {}) {
    this.storageKey = options.storageKey ?? "insyte-consent";
    this.storage = options.storage ?? "localStorage";
    this.cookieDomain = options.cookieDomain;
    this.cookieMaxAge = options.cookieMaxAge ?? 60 * 60 * 24 * 365;
    this.providerCategories = {
      ...DEFAULT_PROVIDER_CATEGORIES,
      ...options.providerCategories,
    };
    this.consent = this.readStoredConsent() ?? {
      ...DEFAULT_CONSENT,
      ...options.defaultConsent,
    };
  }

  getConsent(): ConsentState {
    return { ...this.consent };
  }

  hasCategory(category: ConsentCategory): boolean {
    if (category === "necessary") {
      return true;
    }
    return Boolean(this.consent[category]);
  }

  isProviderAllowed(providerName: string): boolean {
    const category = this.providerCategories[providerName] ?? "analytics";
    return this.hasCategory(category);
  }

  grantConsent(categories: ConsentCategory[] | ConsentState): ConsentState {
    const next =
      Array.isArray(categories)
        ? categories.reduce<ConsentState>(
            (state, category) => ({ ...state, [category]: true }),
            { ...this.consent },
          )
        : { ...this.consent, ...categories, necessary: true };

    this.updateConsent(next);
    return this.getConsent();
  }

  denyConsent(categories?: ConsentCategory[]): ConsentState {
    if (!categories || categories.length === 0) {
      this.updateConsent({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
      return this.getConsent();
    }

    const next = { ...this.consent };
    for (const category of categories) {
      if (category !== "necessary") {
        next[category] = false;
      }
    }

    this.updateConsent(next);
    return this.getConsent();
  }

  onConsentChange(listener: ConsentListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateConsent(next: ConsentState): void {
    this.consent = { ...next, necessary: true };
    this.persistConsent(this.consent);
    for (const listener of this.listeners) {
      listener(this.getConsent());
    }
  }

  private readStoredConsent(): ConsentState | null {
    if (!isBrowser()) {
      return null;
    }

    try {
      const raw =
        this.storage === "cookie"
          ? this.readCookie(this.storageKey)
          : localStorage.getItem(this.storageKey);

      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as ConsentState;
    } catch {
      return null;
    }
  }

  private persistConsent(consent: ConsentState): void {
    if (!isBrowser()) {
      return;
    }

    const serialized = JSON.stringify(consent);

    if (this.storage === "cookie") {
      const domain = this.cookieDomain ? `; domain=${this.cookieDomain}` : "";
      document.cookie = `${this.storageKey}=${encodeURIComponent(serialized)}; path=/; max-age=${this.cookieMaxAge}; SameSite=Lax${domain}`;
      return;
    }

    localStorage.setItem(this.storageKey, serialized);
  }

  private readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export function createConsentManager(options?: ConsentOptions): ConsentManager {
  return new ConsentManager(options);
}
