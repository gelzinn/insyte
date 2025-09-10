import { BaseConnector } from "./base-connector";

export class MongoDBConnector extends BaseConnector {
  async connect(): Promise<void> {
    throw new Error("MongoDB connector not implemented in demo version");
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
    throw new Error("MongoDB connector not implemented in demo version");
  }

  async getTables(): Promise<string[]> {
    throw new Error("MongoDB connector not implemented in demo version");
  }
}
