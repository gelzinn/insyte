export abstract class BaseConnector {
  constructor(
    protected config: {
      type: string
      url: string
      options?: Record<string, any>
    }
  ) {}

  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract query<T = any>(
    sql: string,
    params?: any[]
  ): Promise<{
    data: T[]
    metadata: { totalRows: number; executionTime: number; query: string }
  }>
  abstract getTables(): Promise<string[]>
}
