import type { BaseConnector } from "../connectors/base-connector";
import { SQLiteConnector } from "../connectors/sqlite-connector";
import type {
  AnalyticsConfig,
  AnalyticsOverview,
  BounceRate,
  CampaignAnalytics,
  CustomEvent,
  EventTrigger,
  PageAnalytics,
  PageView,
  RealTimeAnalytics,
  RecentEvent,
  RecentPageview,
  TrafficSource,
  UserInfo,
  UTMParams,
} from "../types";
import { GeoLocationService } from "../utils/geo-location-service";
import { TrafficSourceDetector } from "../utils/traffic-source-detector";
import { UserAgentParser } from "../utils/user-agent-parser";

export class WebAnalyticsEngine {
  private connector?: BaseConnector;
  private userAgentParser: UserAgentParser;
  private geoService: GeoLocationService;
  private trafficDetector: TrafficSourceDetector;
  private config: AnalyticsConfig;
  private eventTriggers: EventTrigger[] = [];

  private get tableNames() {
    return {
      pageviews: this.config.tables?.pageviews || "pageviews",
      userInfo: this.config.tables?.userInfo || "user_info",
      trafficSources: this.config.tables?.trafficSources || "traffic_sources",
      events: this.config.tables?.events || "events",
    };
  }

  /**
   * Initializes the WebAnalyticsEngine with the provided configuration.
   *
   * @param config The analytics configuration object containing database settings, tracking options, and table names.
   */
  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.userAgentParser = new UserAgentParser();
    this.geoService = new GeoLocationService();
    this.trafficDetector = new TrafficSourceDetector();

    console.log("Analytics library initialized successfully");
  }

  /**
   * Establishes a connection to the configured database.
   *
   * @returns A promise that resolves when the database connection is successfully established.
   * @throws Error if the database connection fails.
   */
  async connect(): Promise<void> {
    this.connector = this.createConnector();
    await this.connector.connect();
  }

  /**
   * Closes the database connection if it exists.
   *
   * @returns A promise that resolves when the database connection is successfully closed.
   */
  async disconnect(): Promise<void> {
    if (this.connector) {
      await this.connector.disconnect();
    }
  }

  /**
   * Creates and returns a database connector based on the configuration.
   *
   * @returns A BaseConnector instance configured for the specified database type.
   * @throws Error if the database type is unsupported (only SQLite is supported in demo version).
   * @private
   */
  private createConnector(): BaseConnector {
    switch (this.config.database.type) {
      case "sqlite":
        return new SQLiteConnector(this.config.database);
      default:
        throw new Error(
          `Unsupported database type: ${this.config.database.type}. Only SQLite is supported in demo version.`
        );
    }
  }

  /**
   * Adds a new event trigger to the analytics engine.
   *
   * @param trigger The EventTrigger object containing conditions and the event to fire when conditions are met.
   */
  addEventTrigger(trigger: EventTrigger): void {
    this.eventTriggers.push(trigger);
  }

  /**
   * Removes an event trigger by its name.
   *
   * @param triggerName The name of the event trigger to remove.
   */
  removeEventTrigger(triggerName: string): void {
    this.eventTriggers = this.eventTriggers.filter(
      (t) => t.name !== triggerName
    );
  }

  /**
   * Retrieves all currently registered event triggers.
   *
   * @returns An array of all EventTrigger objects currently registered with the engine.
   */
  getEventTriggers(): EventTrigger[] {
    return [...this.eventTriggers];
  }

  /**
   * Tracks a custom event with the provided context information.
   *
   * @param event The CustomEvent object containing the event name and associated data.
   * @param context An object containing session information including sessionId, optional userId, URL, referrer, and userAgent.
   * @returns A promise that resolves when the custom event has been successfully tracked.
   * @throws Error if the database is not connected.
   */
  async trackCustomEvent(
    event: CustomEvent,
    context: {
      sessionId: string;
      userId: string | undefined;
      url: string | undefined;
      referrer: string | undefined;
      userAgent: string | undefined;
    }
  ): Promise<void> {
    if (!this.connector) throw new Error("Database not connected");

    const query = `
      INSERT INTO ${this.tableNames.events} (
        session_id, user_id, event_type, event_data, url,
        timestamp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.connector.query(query, [
      context.sessionId,
      context.userId || null,
      event.name,
      JSON.stringify(event),
      context.url || null,
      new Date(),
      new Date(),
    ]);
  }

  /**
   * Tracks a page view event with user information, geolocation, and traffic source detection.
   *
   * @param data An object containing session tracking data including sessionId, optional userId, URL, referrer, userAgent, optional IP, and UTM parameters.
   * @returns A promise that resolves when the page view has been successfully tracked.
   * @throws Error if the database is not connected.
   * @note This method will skip tracking if the URL path matches any excluded paths in the configuration.
   * @note For new users, it automatically creates user info and traffic source records.
   * @note Geolocation data is only collected if enabled in config and IP is provided.
   */
  async trackPageView(data: {
    sessionId: string;
    userId?: string;
    url: string;
    referrer?: string;
    userAgent: string;
    ip?: string;
    utmParams?: UTMParams;
  }): Promise<void> {
    if (!this.connector) throw new Error("Database not connected");

    const timestamp = new Date();
    const parsedUrl = new URL(data.url);
    const path = parsedUrl.pathname;
    const hostname = parsedUrl.hostname;

    if (
      this.config.tracking.excludedPaths.some(
        (excluded) => path.startsWith(excluded) || path === excluded
      )
    ) {
      return;
    }

    const userInfo = await this.userAgentParser.parse(data.userAgent);
    let locationInfo = {};

    if (this.config.tracking.enableGeolocation && data.ip) {
      locationInfo = await this.geoService.getLocation(data.ip);
    }

    const trafficSource = this.trafficDetector.detect(
      data.referrer,
      data.utmParams
    );

    const isNewUser = await this.isNewUser(data.sessionId, data.userId);

    const pageView: PageView = {
      sessionId: data.sessionId,
      url: data.url,
      path,
      hostname,
      timestamp,
      isExit: false,
      isBounce: false,
    };

    if (data.userId) {
      (pageView as any).userId = data.userId;
    }
    if (data.referrer) {
      pageView.referrer = data.referrer;
    }

    await this.savePageView(pageView);

    if (isNewUser) {
      const userInfoData: any = {
        sessionId: data.sessionId,
        userAgent: data.userAgent,
        device: userInfo.device,
        browser: userInfo.browser,
        os: userInfo.os,
        location: locationInfo,
        firstVisit: timestamp,
        lastVisit: timestamp,
        visitCount: 1,
        isNewUser: true,
      };

      if (data.userId) {
        userInfoData.userId = data.userId;
      }
      if (data.ip) {
        userInfoData.ip = data.ip;
      }

      await this.saveUserInfo(userInfoData);
    }

    await this.saveTrafficSource(data.sessionId, trafficSource);

    await this.checkEventTriggers({
      sessionId: data.sessionId,
      userId: data.userId,
      url: data.url,
      referrer: data.referrer,
      userAgent: data.userAgent,
      utmParams: data.utmParams,
      hostname,
      path,
      timestamp,
    });
  }

  /**
   * Tracks a page exit event and updates the duration for the page view.
   *
   * @param sessionId The unique session identifier for the user session.
   * @param url The URL of the page being exited.
   * @param duration The time spent on the page in milliseconds.
   * @returns A promise that resolves when the page exit has been successfully tracked.
   * @throws Error if the database is not connected.
   * @note Updates the most recent page view record for the given session and URL.
   */
  async trackPageExit(
    sessionId: string,
    url: string,
    duration: number
  ): Promise<void> {
    if (!this.connector) throw new Error("Database not connected");

    const query = `
      UPDATE ${this.tableNames.pageviews}
      SET duration = ?, is_exit = true, updated_at = ?
      WHERE session_id = ? AND url = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    await this.connector.query(query, [duration, new Date(), sessionId, url]);
  }

  /**
   * Retrieves page analytics data for all pages or a specific page within an optional time period.
   *
   * @param url Optional URL to filter analytics for a specific page.
   * @param period Optional time period to filter the analytics data.
   * @returns A promise that resolves to an array of PageAnalytics objects containing detailed page performance metrics.
   * @throws Error if the database is not connected.
   * @note Includes top referrers and traffic sources for each page.
   * @note Calculates bounce rate, exit rate, and average time on page automatically.
   */
  async getPageAnalytics(
    url?: string,
    period?: { start: Date; end: Date }
  ): Promise<PageAnalytics[]> {
    if (!this.connector) throw new Error("Database not connected");

    let whereClause = "";
    const params: any[] = [];

    if (period) {
      whereClause = "WHERE timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    if (url) {
      whereClause += whereClause ? " AND " : "WHERE ";
      whereClause += "url = ?";
      params.push(url);
    }

    const query = `
      SELECT
        url,
        path,
        hostname,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_views,
        AVG(duration) as avg_time_on_page,
        SUM(CASE WHEN is_bounce = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as bounce_rate,
        SUM(CASE WHEN is_exit = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as exit_rate,
        SUM(CASE WHEN referrer IS NOT NULL AND referrer != '' THEN 1 ELSE 0 END) as entrances
      FROM ${this.tableNames.pageviews}
      ${whereClause}
      GROUP BY url, path, hostname
      ORDER BY views DESC
    `;

    const result = await this.connector.query(query, params);

    const analytics = await Promise.all(
      result.data.map(async (row: any) => {
        const topReferrers = await this.getTopReferrers(row.url, period);
        const topSources = await this.getTopSources(row.url, period);

        return {
          url: row.url,
          path: row.path,
          hostname: row.hostname,
          views: row.views,
          uniqueViews: row.unique_views,
          averageTimeOnPage: row.avg_time_on_page || 0,
          bounceRate: row.bounce_rate || 0,
          exitRate: row.exit_rate || 0,
          entrances: row.entrances || 0,
          topReferrers,
          topSources,
        } as PageAnalytics;
      })
    );

    return analytics;
  }

  /**
   * Calculates bounce rate metrics for the specified time period or the last 30 days if no period is provided.
   *
   * @param period Optional time period to calculate bounce rate for.
   * @returns A promise that resolves to a BounceRate object containing total sessions, bounced sessions, bounce rate percentage, and average session duration.
   * @throws Error if the database is not connected.
   * @note If no period is specified, defaults to the last 30 days from the current date.
   */
  async getBounceRate(period?: {
    start: Date;
    end: Date;
  }): Promise<BounceRate> {
    if (!this.connector) throw new Error("Database not connected");

    let whereClause = "";
    const params: any[] = [];

    if (period) {
      whereClause = "WHERE timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    const query = `
      SELECT
        COUNT(DISTINCT session_id) as total_sessions,
        SUM(CASE WHEN is_bounce = 1 THEN 1 ELSE 0 END) as bounced_sessions,
        AVG(duration) as avg_session_duration
      FROM ${this.tableNames.pageviews}
      ${whereClause}
    `;

    const result = await this.connector.query(query, params);
    const data = result.data[0];

    const totalSessions = data.total_sessions || 0;
    const bouncedSessions = data.bounced_sessions || 0;
    const bounceRate =
      totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      bouncedSessions,
      bounceRate,
      averageSessionDuration: data.avg_session_duration || 0,
      period: period || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    };
  }

  /**
   * Retrieves traffic source distribution data for the specified time period.
   *
   * @param period Optional time period to filter traffic source data.
   * @returns A promise that resolves to an array of objects containing traffic source type, count, and percentage.
   * @throws Error if the database is not connected.
   * @note Returns empty array if no traffic source data is available or if there's an error.
   */
  async getTrafficSources(period?: {
    start: Date;
    end: Date;
  }): Promise<
    Array<{ source: TrafficSource["type"]; count: number; percentage: number }>
  > {
    if (!this.connector) throw new Error("Database not connected");

    let whereClause = "";
    const params: any[] = [];

    if (period) {
      whereClause = "WHERE timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    const query = `
      SELECT
        type as source,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM ${this.tableNames.trafficSources}
      ${whereClause}
      GROUP BY type
      ORDER BY count DESC
    `;

    try {
      const result = await this.connector.query(query, params);
      return result.data;
    } catch (error) {
      console.warn("No traffic source data available:", error);
      return [];
    }
  }

  /**
   * Retrieves campaign analytics data including campaign names, sources, mediums, and session counts.
   *
   * @param period Optional time period to filter campaign analytics data.
   * @returns A promise that resolves to an array of CampaignAnalytics objects.
   * @throws Error if the database is not connected.
   * @note Only includes campaigns with valid campaign names.
   * @note Returns empty array if no campaign data is available or if there's an error.
   */
  async getCampaignAnalytics(period?: {
    start: Date;
    end: Date;
  }): Promise<CampaignAnalytics[]> {
    if (!this.connector) throw new Error("Database not connected");

    let whereClause = "";
    const params: any[] = [];

    if (period) {
      whereClause = "WHERE pv.timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    let fullWhereClause = whereClause;
    if (whereClause) {
      fullWhereClause +=
        " AND campaign_name IS NOT NULL AND campaign_name != ''";
    } else {
      fullWhereClause =
        "WHERE campaign_name IS NOT NULL AND campaign_name != ''";
    }

    const query = `
      SELECT
        campaign_name,
        utm_source as source,
        utm_medium as medium,
        COUNT(*) as sessions
      FROM ${this.tableNames.trafficSources}
      ${fullWhereClause}
      GROUP BY campaign_name, utm_source, utm_medium
      ORDER BY sessions DESC
    `;

    try {
      const result = await this.connector.query(query, params);
      return result.data.map((row: any) => ({
        campaignName: row.campaign_name || "Unknown",
        source: row.source || "unknown",
        medium: row.medium || "unknown",
        sessions: row.sessions || 0,
        pageViews: row.sessions || 0,
        bounceRate: 0,
      }));
    } catch (error) {
      console.warn("No campaign data available:", error);
      return [];
    }
  }

  /**
   * Retrieves real-time analytics data including active users, page views per minute, and top pages.
   *
   * @returns A promise that resolves to a RealTimeAnalytics object with current activity metrics.
   * @throws Error if the database is not connected.
   * @note Active users are counted from the last 5 minutes.
   * @note Page views per minute are calculated from the last hour.
   * @note Top pages are ranked by views in the last hour, limited to 10 pages.
   */
  async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    if (!this.connector) throw new Error("Database not connected");

    const activeUsersQuery = `
      SELECT COUNT(DISTINCT session_id) as active_users
      FROM ${this.tableNames.pageviews}
      WHERE timestamp >= datetime('now', '-5 minutes')
    `;

    const pageViewsPerMinuteQuery = `
      SELECT COUNT(*) / 60.0 as page_views_per_minute
      FROM ${this.tableNames.pageviews}
      WHERE timestamp >= datetime('now', '-1 hour')
    `;

    const topPagesQuery = `
      SELECT url, COUNT(*) as views
      FROM ${this.tableNames.pageviews}
      WHERE timestamp >= datetime('now', '-1 hour')
      GROUP BY url
      ORDER BY views DESC
      LIMIT 10
    `;

    const [activeUsersResult, pageViewsResult, topPagesResult] =
      await Promise.all([
        this.connector.query(activeUsersQuery),
        this.connector.query(pageViewsPerMinuteQuery),
        this.connector.query(topPagesQuery),
      ]);

    return {
      activeUsers: activeUsersResult.data[0]?.active_users || 0,
      pageViewsPerMinute: Math.round(
        pageViewsResult.data[0]?.page_views_per_minute || 0
      ),
      topPages: topPagesResult.data,
      topSources: [],
      geographic: [],
    };
  }

  async getOverview(period?: { start: Date; end: Date }): Promise<AnalyticsOverview> {
    if (!this.connector) throw new Error("Database not connected");

    const end = period?.end ?? new Date();
    const start = period?.start ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pageviewStats = await this.connector.query(
      `
      SELECT
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT user_id) as unique_users
      FROM ${this.tableNames.pageviews}
      WHERE timestamp BETWEEN ? AND ?
    `,
      [start, end],
    );

    const eventStats = await this.connector.query(
      `
      SELECT COUNT(*) as total_events
      FROM ${this.tableNames.events}
      WHERE timestamp BETWEEN ? AND ?
    `,
      [start, end],
    );

    const pageRow = pageviewStats.data[0] ?? {};
    const eventRow = eventStats.data[0] ?? {};

    return {
      totalPageviews: pageRow.total_pageviews ?? 0,
      totalEvents: eventRow.total_events ?? 0,
      uniqueSessions: pageRow.unique_sessions ?? 0,
      uniqueUsers: pageRow.unique_users ?? 0,
      period: { start, end },
    };
  }

  async getRecentPageviews(limit = 50, offset = 0): Promise<RecentPageview[]> {
    if (!this.connector) throw new Error("Database not connected");

    const result = await this.connector.query(
      `
      SELECT
        id, session_id, user_id, url, path, hostname, referrer,
        timestamp, duration, is_exit, is_bounce
      FROM ${this.tableNames.pageviews}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    return result.data.map((row: Record<string, unknown>) => {
      const pageview: RecentPageview = {
        id: row.id as number,
        sessionId: row.session_id as string,
        url: row.url as string,
        path: row.path as string,
        hostname: row.hostname as string,
        timestamp: new Date(row.timestamp as string),
        isExit: Boolean(row.is_exit),
        isBounce: Boolean(row.is_bounce),
      };

      const userId = row.user_id as string | null | undefined;
      if (userId) {
        pageview.userId = userId;
      }

      const referrer = row.referrer as string | null | undefined;
      if (referrer) {
        pageview.referrer = referrer;
      }

      const duration = row.duration as number | null | undefined;
      if (duration) {
        pageview.duration = duration;
      }

      return pageview;
    });
  }

  async getRecentEvents(limit = 50, offset = 0): Promise<RecentEvent[]> {
    if (!this.connector) throw new Error("Database not connected");

    const result = await this.connector.query(
      `
      SELECT id, session_id, user_id, event_type, event_data, url, timestamp
      FROM ${this.tableNames.events}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    return result.data.map((row: Record<string, unknown>) => {
      let eventData: Record<string, unknown> | undefined;
      if (row.event_data) {
        try {
          eventData = JSON.parse(row.event_data as string) as Record<string, unknown>;
        } catch {
          eventData = undefined;
        }
      }

      const event: RecentEvent = {
        id: row.id as number,
        sessionId: row.session_id as string,
        eventType: row.event_type as string,
        timestamp: new Date(row.timestamp as string),
      };

      const userId = row.user_id as string | null | undefined;
      if (userId) {
        event.userId = userId;
      }

      if (eventData) {
        event.eventData = eventData;
      }

      const url = row.url as string | null | undefined;
      if (url) {
        event.url = url;
      }

      return event;
    });
  }

  /**
   * Evaluates all registered event triggers against the current context and fires matching events.
   *
   * @param context An object containing session and page context information for trigger evaluation.
   * @returns A promise that resolves when all applicable event triggers have been processed.
   * @private
   * @note Supports URL pattern matching (string or RegExp), referrer matching, user agent matching, and custom condition functions.
   */
  private async checkEventTriggers(context: {
    sessionId: string;
    userId: string | undefined;
    url: string;
    referrer: string | undefined;
    userAgent: string;
    utmParams: UTMParams | undefined;
    hostname: string;
    path: string;
    timestamp: Date;
  }): Promise<void> {
    for (const trigger of this.eventTriggers) {
      const { conditions, event } = trigger;

      let shouldTrigger = true;

      if (conditions.url) {
        if (conditions.url instanceof RegExp) {
          shouldTrigger = shouldTrigger && conditions.url.test(context.url);
        } else {
          shouldTrigger = shouldTrigger && context.url.includes(conditions.url);
        }
      }

      if (conditions.referrer) {
        if (conditions.referrer instanceof RegExp) {
          shouldTrigger =
            shouldTrigger && conditions.referrer.test(context.referrer || "");
        } else {
          shouldTrigger =
            shouldTrigger &&
            (context.referrer || "").includes(conditions.referrer);
        }
      }

      if (conditions.userAgent) {
        if (conditions.userAgent instanceof RegExp) {
          shouldTrigger =
            shouldTrigger && conditions.userAgent.test(context.userAgent);
        } else {
          shouldTrigger =
            shouldTrigger && context.userAgent.includes(conditions.userAgent);
        }
      }

      if (conditions.customCondition) {
        shouldTrigger = shouldTrigger && conditions.customCondition(context);
      }

      if (shouldTrigger) {
        await this.trackCustomEvent(event, {
          sessionId: context.sessionId,
          userId: context.userId,
          url: context.url,
          referrer: context.referrer,
          userAgent: context.userAgent,
        });
      }
    }
  }

  /**
   * Determines if the current session/user combination represents a new user.
   *
   * @param sessionId The unique session identifier.
   * @param userId Optional user identifier for authenticated users.
   * @returns A promise that resolves to true if the user is new, false otherwise.
   * @private
   * @note If userId is provided, checks for existing user records by userId; otherwise checks by sessionId.
   * @note Always returns true if database is not connected.
   */
  private async isNewUser(
    sessionId: string,
    userId?: string
  ): Promise<boolean> {
    if (!this.connector) return true;

    let query: string;
    let params: any[];

    if (userId) {
      query = `SELECT COUNT(*) as count FROM ${this.tableNames.userInfo} WHERE user_id = ?`;
      params = [userId];
    } else {
      query = `SELECT COUNT(*) as count FROM ${this.tableNames.userInfo} WHERE session_id = ?`;
      params = [sessionId];
    }

    const result = await this.connector.query(query, params);
    return (result.data[0]?.count || 0) === 0;
  }

  /**
   * Saves a page view record to the database.
   *
   * @param pageView The PageView object containing page view information to save.
   * @returns A promise that resolves when the page view has been successfully saved.
   * @private
   * @note Does nothing if database is not connected.
   */
  private async savePageView(pageView: PageView): Promise<void> {
    if (!this.connector) return;

    const query = `
      INSERT INTO ${this.tableNames.pageviews} (
        session_id, user_id, url, path, hostname, referrer,
        timestamp, duration, is_exit, is_bounce, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.connector.query(query, [
      pageView.sessionId,
      pageView.userId || null,
      pageView.url,
      pageView.path,
      pageView.hostname,
      pageView.referrer || null,
      pageView.timestamp,
      pageView.duration || null,
      pageView.isExit || false,
      pageView.isBounce || false,
      new Date(),
    ]);
  }

  /**
   * Saves or updates user information in the database.
   *
   * @param userInfo The UserInfo object containing user and device information to save.
   * @returns A promise that resolves when the user information has been successfully saved.
   * @private
   * @note Uses INSERT OR REPLACE to handle both new and existing user records.
   * @note Does nothing if database is not connected.
   */
  private async saveUserInfo(userInfo: UserInfo): Promise<void> {
    if (!this.connector) return;

    const query = `
      INSERT OR REPLACE INTO ${this.tableNames.userInfo} (
        session_id, user_id, user_agent, device_type, device_brand,
        device_model, browser_name, browser_version, os_name, os_version,
        country, region, city, timezone, language, ip,
        first_visit, last_visit, visit_count, is_new_user, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.connector.query(query, [
      userInfo.sessionId,
      userInfo.userId || null,
      userInfo.userAgent,
      userInfo.device.type,
      userInfo.device.brand || null,
      userInfo.device.model || null,
      userInfo.browser.name,
      userInfo.browser.version,
      userInfo.os.name,
      userInfo.os.version,
      userInfo.location.country || null,
      userInfo.location.region || null,
      userInfo.location.city || null,
      userInfo.location.timezone || null,
      userInfo.location.language || null,
      userInfo.ip || null,
      userInfo.firstVisit,
      userInfo.lastVisit,
      userInfo.visitCount,
      userInfo.isNewUser,
      new Date(),
    ]);
  }

  /**
   * Saves traffic source information for a session to the database.
   *
   * @param sessionId The unique session identifier.
   * @param trafficSource The TrafficSource object containing source information to save.
   * @returns A promise that resolves when the traffic source has been successfully saved.
   * @private
   * @note Does nothing if database is not connected.
   */
  private async saveTrafficSource(
    sessionId: string,
    trafficSource: TrafficSource
  ): Promise<void> {
    if (!this.connector) return;

    const query = `
      INSERT INTO ${this.tableNames.trafficSources} (
        session_id, type, referrer, search_engine, search_term,
        social_network, campaign_name, utm_source, utm_medium,
        utm_campaign, utm_term, utm_content, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.connector.query(query, [
      sessionId,
      trafficSource.type,
      trafficSource.referrer || null,
      trafficSource.searchEngine || null,
      trafficSource.searchTerm || null,
      trafficSource.socialNetwork || null,
      trafficSource.campaign?.term || null,
      trafficSource.campaign?.source || null,
      trafficSource.campaign?.medium || null,
      trafficSource.campaign?.campaign || null,
      trafficSource.campaign?.term || null,
      trafficSource.campaign?.content || null,
      new Date(),
    ]);
  }

  /**
   * Retrieves the top referrers for a specific page within an optional time period.
   *
   * @param url The URL of the page to get referrers for.
   * @param period Optional time period to filter referrer data.
   * @returns A promise that resolves to an array of objects containing referrer URLs and their view counts.
   * @private
   * @note Only includes referrers that are not null or empty.
   * @note Limited to top 5 referrers ordered by view count.
   * @note Returns empty array if database is not connected.
   */
  private async getTopReferrers(
    url: string,
    period?: { start: Date; end: Date }
  ): Promise<Array<{ referrer: string; count: number }>> {
    if (!this.connector) return [];

    let whereClause = "WHERE url = ?";
    const params: any[] = [url];

    if (period) {
      whereClause += " AND timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    const query = `
      SELECT referrer, COUNT(*) as count
      FROM ${this.tableNames.pageviews}
      ${whereClause}
      AND referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 5
    `;

    const result = await this.connector.query(query, params);
    return result.data;
  }

  /**
   * Retrieves the top traffic sources for a specific page within an optional time period.
   *
   * @param url The URL of the page to get traffic sources for.
   * @param period Optional time period to filter traffic source data.
   * @returns A promise that resolves to an array of objects containing traffic source types and their counts.
   * @private
   * @note Joins pageviews and traffic_sources tables to correlate data.
   * @note Limited to top 5 sources ordered by count.
   * @note Returns empty array if database is not connected or if there's an error.
   */
  private async getTopSources(
    url: string,
    period?: { start: Date; end: Date }
  ): Promise<Array<{ source: TrafficSource["type"]; count: number }>> {
    if (!this.connector) return [];

    let whereClause = "WHERE pv.url = ?";
    const params: any[] = [url];

    if (period) {
      whereClause += " AND pv.timestamp BETWEEN ? AND ?";
      params.push(period.start, period.end);
    }

    const query = `
      SELECT ts.type as source, COUNT(*) as count
      FROM ${this.tableNames.pageviews} pv
      JOIN ${this.tableNames.trafficSources} ts ON pv.session_id = ts.session_id
      ${whereClause}
      GROUP BY ts.type
      ORDER BY count DESC
      LIMIT 5
    `;

    try {
      const result = await this.connector.query(query, params);
      return result.data;
    } catch (error) {
      console.warn(`No traffic source data for page ${url}:`, error);
      return [];
    }
  }
}
