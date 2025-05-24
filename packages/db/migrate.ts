import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import prompt from "prompt-sync";
import { runCloudMigrate, runTenantMigrate } from "./src/migrate";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const db = drizzle(process.env.DATABASE_URL);

const tenantId =
  process.env.DB_SCHEMA ?? prompt()("Please enter the schema name: ");
if (!tenantId) {
  throw new Error("DB_SCHEMA is not set");
}
if (tenantId === "cloud") {
  await runCloudMigrate(db);
} else {
  await runTenantMigrate(db, tenantId);
}

process.exit(0);
