import { appFactory } from "@server/factory";
import { authGuard } from "@server/middleware/auth";
import { describeRoute } from "hono-openapi";
import { accepts } from "hono/accepts";

const app = appFactory
  .createApp()
  .use(authGuard("admin"))
  .get(
    "/health",
    describeRoute({
      description: "Update a message",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "ok",
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                },
              },
            },
          },
        },
      },
    }),
    (c) => {
      const accept = accepts(c, {
        header: "Accept",
        supports: ["text/plain", "application/json"],
        default: "text/plain",
      });
      if (accept === "application/json") {
        return c.json({
          status: "ok",
        });
      }
      return c.text("ok");
    }
  );

export default app;
