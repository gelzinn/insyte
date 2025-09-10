export interface PageView {
  id?: string;
  sessionId: string;
  userId?: string;
  url: string;
  path: string;
  hostname: string;
  referrer?: string;
  timestamp: Date;
  duration?: number; // em segundos
  isExit?: boolean;
  isBounce?: boolean;
}

export interface UserInfo {
  sessionId: string;
  userId?: string;
  userAgent: string;
  device: DeviceInfo;
  browser: BrowserInfo;
  os: OSInfo;
  location: LocationInfo;
  ip?: string;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  isNewUser: boolean;
}

export interface DeviceInfo {
  type:
    | "desktop"
    | "mobile"
    | "tablet"
    | "smartwatch"
    | "tv"
    | "console"
    | "unknown";
  brand?: string;
  model?: string;
  screenResolution?: string;
  viewportSize?: string;
}

export interface BrowserInfo {
  name: string;
  version: string;
  engine?: string;
}

export interface OSInfo {
  name: string;
  version: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  language?: string;
}

export interface TrafficSource {
  type:
    | "direct"
    | "organic"
    | "referral"
    | "social"
    | "email"
    | "paid"
    | "unknown";
  referrer?: string;
  searchEngine?: string;
  searchTerm?: string;
  socialNetwork?: string;
  campaign?: UTMParams;
}

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface BounceRate {
  totalSessions: number;
  bouncedSessions: number;
  bounceRate: number; // em %
  averageSessionDuration: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PageAnalytics {
  url: string;
  path: string;
  hostname: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  entrances: number;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  topSources: Array<{
    source: TrafficSource["type"];
    count: number;
  }>;
}

export interface CampaignAnalytics {
  campaignName: string;
  source: string;
  medium: string;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  conversionRate?: number;
  revenue?: number;
  cost?: number;
  roi?: number;
}

export interface RealTimeAnalytics {
  activeUsers: number;
  pageViewsPerMinute: number;
  topPages: Array<{
    url: string;
    views: number;
  }>;
  topSources: Array<{
    source: string;
    count: number;
  }>;
  geographic: Array<{
    country: string;
    users: number;
  }>;
}

export interface DatabaseOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionTimeout?: number;
  queryTimeout?: number;
  poolSize?: number;
}

export interface AggregationOptions {
  groupBy?: string[];
  having?: Record<string, any>;
  orderBy?: Record<string, "ASC" | "DESC">;
  limit?: number;
  offset?: number;
}

export type DatabaseType =
  | "mysql"
  | "postgresql"
  | "sqlite"
  | "mongodb"
  | "redis";

export interface QueryResult<T = any> {
  data: T[];
  metadata: {
    totalRows: number;
    executionTime: number;
    query: string;
  };
}

export interface AnalyticsResult<T = any> {
  result: T;
  metadata: {
    executionTime: number;
    dataSource: string;
    timestamp: Date;
  };
}

export interface ReportConfig {
  title: string;
  description?: string;
  queries: AnalyticsQuery[];
}

export interface AnalyticsQuery {
  name: string;
  sql?: string;
  aggregation?: AggregationConfig;
  type: "count" | "sum" | "avg" | "min" | "max" | "distinct" | "custom";
}

export interface AggregationConfig {
  field: string;
  operation: "count" | "sum" | "avg" | "min" | "max";
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

export interface AnalyticsConfig {
  database: {
    type: "mysql" | "postgresql" | "sqlite" | "mongodb";
    url: string;
    options?: Record<string, any>;
  };
  tracking: {
    sessionTimeout: number; // em minutos
    enableRealTime: boolean;
    enableGeolocation: boolean;
    enableUTMTracking: boolean;
    excludedPaths: string[]; // paths que não devem ser rastreados
  };
  tables?: {
    pageviews?: string;
    userInfo?: string;
    trafficSources?: string;
    events?: string;
  };
}

export interface AnalyticsEvent {
  type: "pageview" | "event" | "conversion" | "error";
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  url?: string;
  referrer?: string;
}

export interface CustomEvent {
  name: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface EventTrigger {
  name: string;
  conditions: {
    url?: string | RegExp;
    referrer?: string | RegExp;
    userAgent?: string | RegExp;
    customCondition?: (data: any) => boolean;
  };
  event: CustomEvent;
}
