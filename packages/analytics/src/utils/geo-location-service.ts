import type { LocationInfo } from "../types";

export class GeoLocationService {
  private cache = new Map<string, LocationInfo>();

  async getLocation(ip: string): Promise<LocationInfo> {
    if (this.cache.has(ip)) {
      return this.cache.get(ip) ?? this.getFallbackLocation();
    }

    try {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=country,regionName,city,timezone`
      );

      if (!response.ok) {
        return this.getFallbackLocation();
      }

      const data = (await response.json()) as any;

      const location: LocationInfo = {
        country: data.country || undefined,
        region: data.regionName || undefined,
        city: data.city || undefined,
        timezone: data.timezone || undefined,
        language: this.detectLanguage(data.country),
      };

      this.cache.set(ip, location);
      setTimeout(() => this.cache.delete(ip), 24 * 60 * 60 * 1000);

      return location;
    } catch (error) {
      console.warn(`Failed to get location for IP ${ip}:`, error);
      return this.getFallbackLocation();
    }
  }

  private getFallbackLocation(): LocationInfo {
    return {
      country: "Unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en",
    };
  }

  private detectLanguage(country?: string): string {
    if (!country) return "en";

    const languageMap: Record<string, string> = {
      Brazil: "pt-BR",
      Portugal: "pt-PT",
      Spain: "es",
      France: "fr",
      Germany: "de",
      Italy: "it",
      Japan: "ja",
      China: "zh",
      Russia: "ru",
      "United Kingdom": "en-GB",
      "United States": "en-US",
      Canada: "en-CA",
      Australia: "en-AU",
      India: "hi",
      Mexico: "es-MX",
      Argentina: "es-AR",
      Colombia: "es-CO",
      Chile: "es-CL",
    };

    return languageMap[country] || "en";
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0,
    };
  }
}
