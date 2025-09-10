import sqlite3 from "sqlite3";
import { BaseConnector } from "./base-connector";

export class SQLiteConnector extends BaseConnector {
  private db?: sqlite3.Database;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbPath = this.config.url.replace("sqlite://", "");
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to SQLite: ${err.message}`));
          return;
        }
        resolve();
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async query<T = any>(
    sql: string,
    params: any[] = []
  ): Promise<{
    data: T[];
    metadata: { totalRows: number; executionTime: number; query: string };
  }> {
    if (!this.db) throw new Error("Database not connected");

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      this.db?.all(sql, params, (err, rows) => {
        if (err) {
          reject(new Error(`Query execution failed: ${err.message}`));
          return;
        }

        const executionTime = Date.now() - startTime;
        const totalRows = Array.isArray(rows) ? rows.length : 0;

        resolve({
          data: rows as T[],
          metadata: {
            totalRows,
            executionTime,
            query: sql,
          },
        });
      });
    });
  }

  async getTables(): Promise<string[]> {
    const result = await this.query(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    return result.data.map((row: any) => row.name);
  }
}
