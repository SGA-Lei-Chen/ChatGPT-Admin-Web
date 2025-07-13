import { createFactory } from "hono/factory";
import type { AuthSession } from "./lib/auth";
import type { DataBase } from "./lib/database";
import { authGuard, authMiddleware } from "./middleware/auth";

export const appFactory = createFactory<{
  Variables: {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
  };
}>({
  initApp: (app) => {
    app.use(authMiddleware);
  },
});