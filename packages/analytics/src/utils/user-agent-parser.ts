import type { BrowserInfo, DeviceInfo, OSInfo } from "../types";

export class UserAgentParser {
  parse(userAgent: string): {
    device: DeviceInfo;
    browser: BrowserInfo;
    os: OSInfo;
  } {
    return {
      device: this.parseDevice(userAgent),
      browser: this.parseBrowser(userAgent),
      os: this.parseOS(userAgent),
    };
  }

  private parseDevice(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        ua
      )
    ) {
      const brand = this.extractMobileBrand(ua);
      const model = this.extractMobileModel(ua);
      const result: DeviceInfo = {
        type: "mobile",
      };

      if (brand) {
        result.brand = brand;
      }

      if (model) {
        result.model = model;
      }

      return result;
    }

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
      const brand = this.extractTabletBrand(ua);
      const model = this.extractTabletModel(ua);
      const result: DeviceInfo = {
        type: "tablet",
      };

      if (brand) {
        result.brand = brand;
      }

      if (model) {
        result.model = model;
      }

      return result;
    }

    return {
      type: "desktop",
    };
  }

  private parseBrowser(userAgent: string): BrowserInfo {
    const ua = userAgent.toLowerCase();

    if (ua.includes("chrome") && !ua.includes("edg")) {
      const version = this.extractVersion(ua, "chrome/");
      return {
        name: "Chrome",
        version,
        engine: "Blink",
      };
    }

    if (ua.includes("edg")) {
      const version = this.extractVersion(ua, "edg/");
      return {
        name: "Edge",
        version,
        engine: "Blink",
      };
    }

    if (ua.includes("firefox")) {
      const version = this.extractVersion(ua, "firefox/");
      return {
        name: "Firefox",
        version,
        engine: "Gecko",
      };
    }

    if (ua.includes("safari") && !ua.includes("chrome")) {
      const version = this.extractVersion(ua, "version/");
      return {
        name: "Safari",
        version,
        engine: "WebKit",
      };
    }

    if (ua.includes("opera") || ua.includes("opr")) {
      const version =
        this.extractVersion(ua, "opr/") || this.extractVersion(ua, "opera/");
      return {
        name: "Opera",
        version,
        engine: "Blink",
      };
    }

    return {
      name: "Unknown",
      version: "Unknown",
    };
  }

  private parseOS(userAgent: string): OSInfo {
    const ua = userAgent.toLowerCase();

    if (ua.includes("windows")) {
      if (ua.includes("windows nt 10.0"))
        return { name: "Windows", version: "10" };
      if (ua.includes("windows nt 6.3"))
        return { name: "Windows", version: "8.1" };
      if (ua.includes("windows nt 6.2"))
        return { name: "Windows", version: "8" };
      if (ua.includes("windows nt 6.1"))
        return { name: "Windows", version: "7" };
      return { name: "Windows", version: "Unknown" };
    }

    if (ua.includes("mac os x")) {
      const version = this.extractVersion(ua, "mac os x ");
      return { name: "macOS", version: version.replace(/_/g, ".") };
    }

    if (ua.includes("linux")) {
      return { name: "Linux", version: "Unknown" };
    }

    if (ua.includes("android")) {
      const version = this.extractVersion(ua, "android ");
      return { name: "Android", version };
    }

    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
      const version =
        this.extractVersion(ua, "os ") || this.extractVersion(ua, "iphone os ");
      return { name: "iOS", version: version.replace(/_/g, ".") };
    }

    return { name: "Unknown", version: "Unknown" };
  }

  private extractVersion(userAgent: string, pattern: string): string {
    const regex = new RegExp(`${pattern}([0-9._]+)`, "i");
    const match = userAgent.match(regex);
    return match ? match[1] : "Unknown";
  }

  private extractMobileBrand(userAgent: string): string | undefined {
    const ua = userAgent.toLowerCase();

    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))
      return "Apple";
    if (ua.includes("samsung")) return "Samsung";
    if (ua.includes("huawei")) return "Huawei";
    if (ua.includes("xiaomi")) return "Xiaomi";
    if (ua.includes("oneplus")) return "OnePlus";
    if (ua.includes("google")) return "Google";
    if (ua.includes("motorola")) return "Motorola";
    if (ua.includes("lg")) return "LG";
    if (ua.includes("sony")) return "Sony";

    return undefined;
  }

  private extractMobileModel(userAgent: string): string | undefined {
    const ua = userAgent.toLowerCase();

    if (ua.includes("iphone")) {
      if (ua.includes("iphone 15")) return "iPhone 15";
      if (ua.includes("iphone 14")) return "iPhone 14";
      if (ua.includes("iphone 13")) return "iPhone 13";
      if (ua.includes("iphone 12")) return "iPhone 12";
      if (ua.includes("iphone 11")) return "iPhone 11";
      return "iPhone";
    }

    if (ua.includes("samsung")) {
      if (ua.includes("sm-g")) return "Galaxy S";
      if (ua.includes("sm-a")) return "Galaxy A";
      if (ua.includes("sm-m")) return "Galaxy M";
      return "Samsung Galaxy";
    }

    return undefined;
  }

  private extractTabletBrand(userAgent: string): string | undefined {
    const ua = userAgent.toLowerCase();

    if (ua.includes("ipad")) return "Apple";
    if (ua.includes("samsung")) return "Samsung";
    if (ua.includes("amazon")) return "Amazon";
    if (ua.includes("lenovo")) return "Lenovo";

    return undefined;
  }

  private extractTabletModel(userAgent: string): string | undefined {
    const ua = userAgent.toLowerCase();

    if (ua.includes("ipad")) {
      if (ua.includes("ipad pro")) return "iPad Pro";
      if (ua.includes("ipad air")) return "iPad Air";
      if (ua.includes("ipad mini")) return "iPad Mini";
      return "iPad";
    }

    if (ua.includes("kindle")) return "Kindle Fire";
    if (ua.includes("nexus")) return "Nexus";

    return undefined;
  }
}
