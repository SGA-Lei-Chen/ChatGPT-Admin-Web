import "dotenv/config";
import "zod-openapi/extend";
import "./lib/plugins/sentry";

/* Server */
import type { Server as HttpServer } from "node:http";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";

/* API Documentation */
import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";

/* Middleware */
import { sentry } from "@hono/sentry";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ulid } from "ulid";
import connInfoMiddleware from "./middleware/conn-info";
import loggerMiddleware from "./middleware/logger";

/* Error */
import { DatabaseError } from "pg";
import BizError, { BizCodeEnum } from "./error";

/* Business Routes */
import commonRouter from "./routes/common";


/* Context Extension */
import type { ConnInfo } from "hono/conninfo";
import type { Redis } from "ioredis";
import type { Logger } from "winston";
import type { AuthInstance } from "./lib/auth";
import type { CloudDataBase, TenantDataBase } from "./lib/db";
import type CacheKey from "./lib/db/cache/key";
// import { inngestHandler } from "./queues";

declare module "hono" {
  interface ContextVariableMap {
    tenantId: string;
    db: TenantDataBase | CloudDataBase;
    cache: Redis;
    cacheKey: CacheKey;
    auth: AuthInstance;
    logger: Logger;
    connInfo: ConnInfo & { ip: string };
  }
}

const app = new Hono().basePath("/api");
/* Error Handle */
app.onError((err, c) => {
  if (err instanceof BizError) {
    return c.json(
      {
        code: err.code,
        message: err.message,
      },
      err.statusCode as ContentfulStatusCode,
    );
  }
  if (err instanceof DatabaseError) {
    return c.json(
      {
        code: BizCodeEnum.DatabaseError,
        message: err.code,
      },
      500,
    );
  }
  console.error(err);
  return c.json(
    {
      message: "Internal Server Error",
    },
    500,
  );
});

/* 
================
== Middleware == 
================
*/
// 1. CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Upgrade-Insecure-Requests",
    ],
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);
// 2. Request ID
app.use(
  requestId({
    generator: () => ulid(),
  }),
);
// 3. Monitor
if (process.env.SENTRY_DSN) {
  app.use(
    sentry({
      dsn: process.env.SENTRY_DSN,
    }),
  );
}
// 4. Connection Info
app.use(connInfoMiddleware);
// 5. Logger
app.use(loggerMiddleware);

 
/* 
==============
=== Routes ===
==============
*/
// 1. Task Queue
// app.on(["GET", "PUT", "POST"], "/inngest", inngestHandler);
// 2. Authentication
app.on(["POST", "GET"], "/auth/:path{.+}", (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});
// 3. Business Routes
export const routes = new Hono()
  .route("/", commonRouter) // health check 和一些公开设置

app.route("/", routes);

// 4. API Documentation
app.get(
  "/docs",
  apiReference({
    theme: "saturn",
    spec: { url: "/openapi" },
  }),
);
app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "AChat API",
        version: "4.0.0",
      },
      servers: [
        { url: "http://localhost:3001", description: "Local Server" },
      ],
    },
  }),
);

const run = async () => {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const server = serve({ fetch: app.fetch, port }, ({ address, port }) => {
    console.log(`Server is running on ${address}:${port}...`);
    showRoutes(app);
  });
  // setupSocketIOServer(server as HttpServer);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
