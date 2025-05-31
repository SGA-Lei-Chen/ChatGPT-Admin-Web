import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

import chat from "./chat";

const app = new Hono()
  .use(
    describeRoute({
      tags: ["User"],
    })
  )
  .route("/chat", chat);

export default app;
