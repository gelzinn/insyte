import { BaseConnector } from "./base-connector";

export class PostgreSQLConnector extends BaseConnector {
  async connect(): Promise<void> {
    throw new Error("PostgreSQL connector not implemented in demo version");
  }

  async disconnect(): Promise<void> {
    // Implementation
  }

  async query<T = any>(
    sql: string,
    params?: any[]
  ): Promise<{
    data: T[];
    metadata: { totalRows: number; executionTime: number; query: string };
  }> {
    throw new Error("PostgreSQL connector not implemented in demo version");
  }

  async getTables(): Promise<string[]> {
    throw new Error("PostgreSQL connector not implemented in demo version");
  }
}
