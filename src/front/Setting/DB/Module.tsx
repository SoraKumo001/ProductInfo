import { Adapter } from "@jswf/adapter";
export interface DatabaseInfo {
  connect: boolean;
  database: string;
  size: number;
  server: string;
}
export interface DATABASE_CONFIG {
  REMOTEDB_HOST: string;
  REMOTEDB_PORT: number;
  REMOTEDB_DATABASE: string;
  REMOTEDB_USER: number;
  REMOTEDB_PASSWORD?: string;
}
export class DatabaseModule {
  adapter: Adapter;
  constructor(adapter: Adapter) {
    this.adapter = adapter;
  }
  public getInfo(): Promise<DatabaseInfo> {
    return this.adapter.exec("RemoteDB.getInfo");
  }
  public getConfig(): Promise<DATABASE_CONFIG> {
    return this.adapter.exec("RemoteDB.getConfig");
  }
  public setConfig(config: DATABASE_CONFIG): Promise<boolean> {
    return this.adapter.exec("RemoteDB.setConfig", config);
  }
}
