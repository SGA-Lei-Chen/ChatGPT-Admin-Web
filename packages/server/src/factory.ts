import { createFactory } from "hono/factory";
import type { Session } from "./lib/auth";
import type { CloudDataBase, TenantDataBase } from "./lib/db";
import { authGuard, authMiddleware } from "./middleware/auth";
import tenantMiddleware, { contentMiddleware } from "./middleware/tenant";

export const appFactory = createFactory<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
    db: TenantDataBase;
  };
}>({
  initApp: (app) => {
    app.use(tenantMiddleware);
    app.use(authMiddleware);
  },
});

export const webhookFactory = createFactory<{
  Variables: {
    db: TenantDataBase;
  };
}>({
  initApp: (app) => {
    app.use(tenantMiddleware);
  },
});

export const dashFactory = createFactory<{
  Variables: {
    user: Session["user"];
    session: Session["session"];
    db: TenantDataBase;
  };
}>({
  initApp: (app) => {
    app.use(tenantMiddleware);
    app.use(authMiddleware);
    app.use(authGuard("admin"));
  },
});

export const cloudFactory = createFactory<{
  Variables: {
    user: Session["user"];
    session: Session["session"];
    db: CloudDataBase;
  };
}>({
  initApp: (app) => {
    app.use(contentMiddleware);
    app.use(authMiddleware);
    app.use(authGuard("user"));
  },
});
