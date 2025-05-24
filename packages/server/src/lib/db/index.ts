import type { SiteSecret } from "@achat/db/cloud-schema";
import * as cloudSchema from "@achat/db/cloud-schema";
import * as tenantSchema from "@achat/db/schema";
import { tenantSecretCache } from "@server/config/secret";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg, { type PoolConfig } from "pg";

type TenantDataBase = ReturnType<typeof drizzle<typeof tenantSchema>>;
type CloudDataBase = ReturnType<typeof drizzle<typeof cloudSchema>>;

/**
 * 租户数据库连接池管理器
 * 用于管理多租户系统中每个租户的数据库连接池和数据库实例
 * 每个租户都有自己独立的连接池和数据库实例
 */
class TenantDatabasePoolManager {
  private readonly config: PoolConfig;
  private pools: Record<string, pg.Pool>;
  private dbInstances: Record<string, TenantDataBase>;
  private static instance: TenantDatabasePoolManager;

  public static getInstance(config: PoolConfig): TenantDatabasePoolManager {
    if (!TenantDatabasePoolManager.instance) {
      TenantDatabasePoolManager.instance = new TenantDatabasePoolManager(
        config,
      );
    }
    return TenantDatabasePoolManager.instance;
  }

  private constructor(initConfig: PoolConfig) {
    if (initConfig.connectionString) {
      const url = new URL(initConfig.connectionString);
      const [user, password] =
        url.username && url.password ? [url.username, url.password] : [];
      const database = url.pathname.slice(1); // Remove leading slash
      const host = url.hostname;
      const port = url.port ? Number.parseInt(url.port) : undefined;
      this.config = {
        user,
        password,
        database,
        host,
        port,
      };
    } else {
      this.config = initConfig;
    }
    this.pools = {}; // 存储租户的连接池
    this.dbInstances = {}; // 存储每个租户的 db 实例
  }

  async getSiteSecret(tenantId: number): Promise<SiteSecret> {
    const secret = tenantSecretCache.get(tenantId);
    if (secret) {
      return secret;
    }
    const cloudDb = this.getCloudDbInstance();
    const site = await cloudDb
      .select({
        id: cloudSchema.site.id,
        secret: cloudSchema.site.secret,
      })
      .from(cloudSchema.site)
      .where(eq(cloudSchema.site.id, tenantId));
    if (site.length > 0) {
      tenantSecretCache.set(tenantId, site[0].secret);
      return site[0].secret;
    }
    throw new Error("Tenant not found");
  }

  /**
   * 为特定 schema 创建一个连接池
   * @param schema schema 名称
   * @returns 特定 schema 的连接池
   */
  private createPool(schema: string, extraConfig?: PoolConfig): pg.Pool {
    if (this.pools[schema]) {
      return this.pools[schema];
    }
    const pool = new pg.Pool(
      extraConfig
        ? {
            ...this.config,
            ...extraConfig,
          }
        : this.config,
    );
    this.pools[schema] = pool;
    return pool;
  }

  /**
   * 获取特定 schema 的连接池
   * @param schema schema 名称
   * @returns 特定 schema 的连接池
   */
  private getPool(schema: string, extraConfig?: PoolConfig): pg.Pool {
    const pool = this.pools[schema];
    if (!pool) {
      return this.createPool(schema, extraConfig);
    }
    return pool;
  }

  /**
   * 为特定租户创建一个 db 实例
   * @param tenantId 租户 id
   * @returns 租户的 db 实例
   */
  private async createTenantDbInstance(
    tenantId: number,
  ): Promise<TenantDataBase> {
    const secret = await this.getSiteSecret(tenantId);
    if (!secret) {
      throw new Error("Tenant not found");
    }
    const pool = this.getPool(`tenant_${tenantId}`, secret.database);
    return drizzle(pool, {
      schema: tenantSchema,
    });
  }

  /**
   * 创建 SaaS Cloud 数据库实例
   * @returns SaaS Cloud 数据库实例
   */
  private createCloudDbInstance(): CloudDataBase {
    const pool = this.getPool("cloud");
    return drizzle(pool, {
      schema: cloudSchema,
    });
  }

  /**
   * 获取 SaaS Cloud 数据库实例
   * @returns SaaS Cloud 数据库实例
   */
  getCloudDbInstance(): CloudDataBase {
    return this.createCloudDbInstance();
  }

  /**
   * 获取特定租户的 db 实例
   * @param tenantId 租户 id
   * @returns 租户的 db 实例
   */
  async getTenantDbInstance(tenantId: number): Promise<TenantDataBase> {
    const db = this.dbInstances[tenantId];
    if (!db) {
      const newDb = await this.createTenantDbInstance(tenantId);
      this.dbInstances[tenantId] = newDb;
      return newDb;
    }
    return db;
  }

  /**
   * 关闭所有连接池
   */
  closeAllPools(): void {
    for (const schema of Object.keys(this.pools)) {
      this.pools[schema].end();
    }
    console.log("All pools closed");
  }
}

const tenantDatabasePoolManager = TenantDatabasePoolManager.getInstance({
  connectionString: process.env.DATABASE_URL,
});

export type { TenantDataBase, CloudDataBase };
export default tenantDatabasePoolManager;
