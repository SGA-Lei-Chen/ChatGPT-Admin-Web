import { appFactory } from "@server/factory";
import { authGuard } from "@server/middleware/auth";

const startTime = Date.now();

const app = appFactory
  .createApp()
  .use(authGuard("admin"))
  .get("/health", (c) => {
    return c.json({
      status: "ok",
      uptime: Date.now() - startTime,
      connInfo: { ip: c.get("connInfo").ip },
    });
  });

export default app;
