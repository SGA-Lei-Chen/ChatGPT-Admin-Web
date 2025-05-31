import { appFactory } from "@server/factory";

const startTime = Date.now();

const app = appFactory.createApp().get("/setup", (c) => {
  return c.json({
    status: "ok",
    uptime: Date.now() - startTime,
    connInfo: { ip: c.get("connInfo").ip },
  });
});

export default app;
