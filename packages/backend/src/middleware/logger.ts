import { getLogger } from "@server/lib/logger";
import type { Context, MiddlewareHandler, Next } from "hono";
import type { Logger } from "winston";

const logger = getLogger("server);

// 创建日志中间件
const loggerMiddleware: MiddlewareHandler<{
  Variables: { logger: Logger };
}> = async (c: Context, next: Next) => {
  const start = Date.now();

  c.set("logger", logger);
  logger.initMeta({
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
  });
  try {
    await next();
    const duration = Date.now() - start;

    logger.info("Request succeeded", {
      status: c.res.status,
      duration,
    });
  } catch (error) {
    logger.error("Request failed", {
      error: error instanceof Error ? error.defaultMessage : "Unknown error",
      stack: error instanceof Error ? error.stack : "Unknown stack",
    });
    throw error;
  }
};

export default loggerMiddleware;
