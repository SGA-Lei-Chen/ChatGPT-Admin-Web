import * as schema from "@achat/database/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const getDbPool = () => {
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
};

const globalForDB = globalThis as unknown as {
  dbPool: ReturnType<typeof getDbPool> | undefined;
};

const dbPool = globalForDB?.dbPool ?? getDbPool();

const db = drizzle(dbPool, { schema });

export type DataBase = ReturnType<typeof drizzle<typeof schema>>;

if (process.env.NODE_ENV !== "production") {
  globalForDB.dbPool = dbPool;
}

export default db;
