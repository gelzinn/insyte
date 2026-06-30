import type { ConsentCategory, ConsentState } from "../types";

export type { ConsentCategory, ConsentState, ConsentOptions } from "../types";
export { ConsentManager, createConsentManager, DEFAULT_PROVIDER_CATEGORIES } from "./consent-manager";

export function hasAnalyticsConsent(consent: ConsentState): boolean {
  return Boolean(consent.analytics);
}

export function hasMarketingConsent(consent: ConsentState): boolean {
  return Boolean(consent.marketing);
}

export function allConsentCategories(): ConsentCategory[] {
  return ["necessary", "analytics", "marketing", "preferences"];
}
