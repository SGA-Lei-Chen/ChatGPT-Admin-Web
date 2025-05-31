import { createFactory } from "hono/factory";
import type { Session } from "./lib/auth";
import type { DataBase } from "./lib/database";
import { authMiddleware } from "./middleware/auth";

export const appFactory = createFactory<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
    db: DataBase;
  };
}>({
  initApp: (app) => {
    app.use(authMiddleware);
  },
});
