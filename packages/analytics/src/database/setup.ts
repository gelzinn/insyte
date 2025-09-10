import type { BaseConnector } from "../connectors/base-connector";
import { SQLiteConnector } from "../connectors/sqlite-connector";

export async function setupDatabase(
  type: "mysql" | "postgresql" | "sqlite" | "mongodb",
  url: string,
  customTableNames?: {
    pageviews?: string;
    userInfo?: string;
    trafficSources?: string;
    events?: string;
  }
): Promise<void> {
  if (type !== "sqlite") {
    throw new Error(
      `Unsupported database type: ${type}. Only SQLite is supported in demo version.`
    );
  }

  const connector: BaseConnector = new SQLiteConnector({ type: "sqlite", url });

  await connector.connect();

  const tableNames = {
    pageviews: customTableNames?.pageviews || "pageviews",
    userInfo: customTableNames?.userInfo || "user_info",
    trafficSources: customTableNames?.trafficSources || "traffic_sources",
    events: customTableNames?.events || "events",
  };

  const tables = [
    `CREATE TABLE IF NOT EXISTS ${tableNames.pageviews} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      url TEXT NOT NULL,
      path VARCHAR(500) NOT NULL,
      hostname VARCHAR(255) NOT NULL,
      referrer TEXT,
      timestamp DATETIME NOT NULL,
      duration INTEGER,
      is_exit BOOLEAN DEFAULT FALSE,
      is_bounce BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS ${tableNames.userInfo} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id VARCHAR(255) NOT NULL UNIQUE,
      user_id VARCHAR(255),
      user_agent TEXT,
      device_type VARCHAR(50),
      device_brand VARCHAR(100),
      device_model VARCHAR(100),
      browser_name VARCHAR(100),
      browser_version VARCHAR(50),
      os_name VARCHAR(100),
      os_version VARCHAR(50),
      country VARCHAR(100),
      region VARCHAR(100),
      city VARCHAR(100),
      timezone VARCHAR(100),
      language VARCHAR(10),
      ip VARCHAR(45),
      first_visit DATETIME NOT NULL,
      last_visit DATETIME NOT NULL,
      visit_count INTEGER DEFAULT 1,
      is_new_user BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS ${tableNames.trafficSources} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      referrer TEXT,
      search_engine VARCHAR(100),
      search_term TEXT,
      social_network VARCHAR(100),
      campaign_name VARCHAR(255),
      utm_source VARCHAR(255),
      utm_medium VARCHAR(255),
      utm_campaign VARCHAR(255),
      utm_term VARCHAR(255),
      utm_content VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES ${tableNames.userInfo}(session_id)
    )`,

    `CREATE TABLE IF NOT EXISTS ${tableNames.events} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      event_type VARCHAR(100) NOT NULL,
      event_data TEXT,
      url TEXT,
      timestamp DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE INDEX IF NOT EXISTS idx_${tableNames.pageviews}_session ON ${tableNames.pageviews}(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.pageviews}_timestamp ON ${tableNames.pageviews}(timestamp)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.pageviews}_url ON ${tableNames.pageviews}(url)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.pageviews}_hostname ON ${tableNames.pageviews}(hostname)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.userInfo}_session ON ${tableNames.userInfo}(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.userInfo}_user ON ${tableNames.userInfo}(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.trafficSources}_session ON ${tableNames.trafficSources}(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.events}_session ON ${tableNames.events}(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_${tableNames.events}_timestamp ON ${tableNames.events}(timestamp)`,
  ];

  for (const tableSQL of tables) {
    try {
      await connector.query(tableSQL);
    } catch (error) {
      console.error("Database table creation error:", error);
      console.error("SQL:", tableSQL);
      throw error;
    }
  }

  await connector.disconnect();
  console.log("Database setup completed successfully");
}

export async function checkDatabaseSetup(
  type: "mysql" | "postgresql" | "sqlite" | "mongodb",
  url: string,
  customTableNames?: {
    pageviews?: string;
    userInfo?: string;
    trafficSources?: string;
    events?: string;
  }
): Promise<boolean> {
  if (type !== "sqlite") {
    return false;
  }

  try {
    const connector: BaseConnector = new SQLiteConnector({
      type: "sqlite",
      url,
    });

    await connector.connect();

    const tableNames = {
      pageviews: customTableNames?.pageviews || "pageviews",
      userInfo: customTableNames?.userInfo || "user_info",
      trafficSources: customTableNames?.trafficSources || "traffic_sources",
      events: customTableNames?.events || "events",
    };

    const result = await connector.query(
      `
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN (?, ?, ?, ?)
    `,
      [
        tableNames.pageviews,
        tableNames.userInfo,
        tableNames.trafficSources,
        tableNames.events,
      ]
    );

    await connector.disconnect();

    return result.data.length >= 4;
  } catch {
    return false;
  }
}
