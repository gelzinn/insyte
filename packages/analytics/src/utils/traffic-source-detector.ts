import type { TrafficSource, UTMParams } from "../types";

export class TrafficSourceDetector {
  private readonly searchEngines = {
    google: [
      "google.com",
      "google.co.uk",
      "google.ca",
      "google.com.au",
      "google.de",
      "google.fr",
      "google.it",
      "google.es",
      "google.pt",
      "google.nl",
      "google.be",
      "google.se",
      "google.no",
      "google.fi",
      "google.dk",
      "google.pl",
      "google.cz",
      "google.sk",
      "google.hu",
      "google.ro",
      "google.bg",
      "google.rs",
      "google.hr",
      "google.si",
      "google.mk",
      "google.me",
      "google.ba",
      "google.al",
      "google.gr",
      "google.tr",
      "google.ru",
      "google.ua",
      "google.by",
      "google.kz",
      "google.uz",
      "google.tm",
      "google.tj",
      "google.kg",
      "google.az",
      "google.am",
      "google.ge",
      "google.md",
      "google.lt",
      "google.lv",
      "google.ee",
      "google.ie",
      "google.ch",
      "google.at",
      "google.is",
      "google.li",
      "google.lu",
      "google.mc",
      "google.ad",
      "google.sm",
      "google.va",
      "google.mt",
      "google.cy",
      "google.com.cy",
      "google.com.mt",
      "google.com.tr",
      "google.com.gr",
      "google.com.ru",
      "google.com.ua",
    ],
    bing: [
      "bing.com",
      "bing.co.uk",
      "bing.ca",
      "bing.com.au",
      "bing.de",
      "bing.fr",
      "bing.it",
      "bing.es",
      "bing.pt",
      "bing.nl",
      "bing.be",
      "bing.se",
      "bing.no",
      "bing.fi",
      "bing.dk",
      "bing.pl",
      "bing.cz",
      "bing.sk",
      "bing.hu",
      "bing.ro",
      "bing.bg",
      "bing.rs",
      "bing.hr",
      "bing.si",
      "bing.mk",
      "bing.me",
      "bing.ba",
      "bing.al",
      "bing.gr",
      "bing.tr",
    ],
    yahoo: [
      "yahoo.com",
      "yahoo.co.uk",
      "yahoo.ca",
      "yahoo.com.au",
      "yahoo.de",
      "yahoo.fr",
      "yahoo.it",
      "yahoo.es",
      "yahoo.pt",
      "yahoo.nl",
      "yahoo.be",
      "yahoo.se",
      "yahoo.no",
      "yahoo.fi",
      "yahoo.dk",
      "yahoo.pl",
      "yahoo.cz",
      "yahoo.sk",
      "yahoo.hu",
      "yahoo.ro",
      "yahoo.bg",
      "yahoo.rs",
      "yahoo.hr",
      "yahoo.si",
      "yahoo.mk",
      "yahoo.me",
      "yahoo.ba",
      "yahoo.al",
      "yahoo.gr",
      "yahoo.tr",
    ],
    duckduckgo: ["duckduckgo.com"],
    yandex: ["yandex.ru", "yandex.com"],
    baidu: ["baidu.com"],
    naver: ["naver.com"],
    seznam: ["seznam.cz"],
  };

  private readonly socialNetworks = {
    facebook: ["facebook.com", "fb.com", "m.facebook.com", "l.facebook.com"],
    twitter: ["twitter.com", "x.com", "t.co"],
    instagram: ["instagram.com", "instagr.am"],
    linkedin: ["linkedin.com", "lnkd.in"],
    youtube: ["youtube.com", "youtu.be"],
    tiktok: ["tiktok.com", "vm.tiktok.com"],
    pinterest: ["pinterest.com", "pin.it"],
    reddit: ["reddit.com", "redd.it"],
    whatsapp: ["whatsapp.com", "wa.me"],
    telegram: ["telegram.org", "t.me"],
    discord: ["discord.com", "discord.gg"],
    twitch: ["twitch.tv"],
    snapchat: ["snapchat.com"],
  };

  private readonly emailProviders = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "icloud.com",
    "mail.ru",
    "yandex.ru",
    "protonmail.com",
    "aol.com",
  ];

  detect(referrer?: string, utmParams?: UTMParams): TrafficSource {
    if (utmParams?.source || utmParams?.medium || utmParams?.campaign) {
      const result: TrafficSource = {
        type: "paid",
        campaign: utmParams,
      };

      if (referrer) {
        result.referrer = referrer;
      }

      return result;
    }

    if (!referrer) {
      return {
        type: "direct",
      };
    }

    try {
      const referrerUrl = new URL(referrer);
      const hostname = referrerUrl.hostname.toLowerCase();

      for (const [engine, domains] of Object.entries(this.searchEngines)) {
        if (domains.some((domain) => hostname.includes(domain))) {
          const searchTerm = this.extractSearchTerm(referrerUrl, engine);
          const result: TrafficSource = {
            type: "organic",
            referrer,
            searchEngine: engine,
          };

          if (searchTerm) {
            result.searchTerm = searchTerm;
          }

          return result;
        }
      }

      for (const [network, domains] of Object.entries(this.socialNetworks)) {
        if (domains.some((domain) => hostname.includes(domain))) {
          return {
            type: "social",
            referrer,
            socialNetwork: network,
          };
        }
      }

      if (this.emailProviders.some((provider) => hostname.includes(provider))) {
        return {
          type: "email",
          referrer,
        };
      }

      return {
        type: "referral",
        referrer,
      };
    } catch (_error) {
      return {
        type: "unknown",
        referrer,
      };
    }
  }

  private extractSearchTerm(url: URL, engine: string): string | undefined {
    try {
      switch (engine) {
        case "google":
          return url.searchParams.get("q") || undefined;
        case "bing":
          return url.searchParams.get("q") || undefined;
        case "yahoo":
          return url.searchParams.get("p") || undefined;
        case "duckduckgo":
          return url.searchParams.get("q") || undefined;
        case "yandex":
          return url.searchParams.get("text") || undefined;
        case "baidu":
          return url.searchParams.get("wd") || undefined;
        default:
          return url.searchParams.get("q") || undefined;
      }
    } catch {
      return undefined;
    }
  }

  identifyCampaign(utmParams: UTMParams): string | undefined {
    const { source, medium, campaign } = utmParams;

    if (source === "google" && medium === "cpc") {
      return campaign || "Google Ads";
    }

    if (source === "facebook" && medium === "social") {
      return campaign || "Facebook Ads";
    }

    if (source === "newsletter" || medium === "email") {
      return campaign || "Email Marketing";
    }

    if (medium === "affiliate") {
      return campaign || "Affiliate Program";
    }

    if (campaign) {
      return campaign;
    }

    return undefined;
  }

  categorizeCampaign(utmParams: UTMParams): {
    category: "brand" | "performance" | "retargeting" | "awareness" | "unknown";
    priority: "high" | "medium" | "low";
  } {
    const { source, medium, campaign, term } = utmParams;

    if (
      campaign?.toLowerCase().includes("brand") ||
      term?.toLowerCase().includes("brand") ||
      source === "direct"
    ) {
      return { category: "brand", priority: "high" };
    }

    if (
      medium === "cpc" ||
      medium === "ppc" ||
      campaign?.toLowerCase().includes("performance") ||
      campaign?.toLowerCase().includes("conversion")
    ) {
      return { category: "performance", priority: "high" };
    }

    if (
      campaign?.toLowerCase().includes("retarget") ||
      campaign?.toLowerCase().includes("remarketing") ||
      campaign?.toLowerCase().includes("rtg")
    ) {
      return { category: "retargeting", priority: "medium" };
    }

    if (
      medium === "display" ||
      medium === "video" ||
      campaign?.toLowerCase().includes("awareness") ||
      campaign?.toLowerCase().includes("reach")
    ) {
      return { category: "awareness", priority: "low" };
    }

    return { category: "unknown", priority: "medium" };
  }
}
