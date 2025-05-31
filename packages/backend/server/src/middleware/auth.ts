import type { Session } from "@server/lib/auth";
import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler<{
  Variables: {
    user: Session["user"] | null;
    session: Session["session"] | null;
  };
}> = async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const authGuard =
  (
    role: "user" | "admin",
  ): MiddlewareHandler<{
    Variables: {
      user: Session["user"];
      session: Session["session"];
    };
  }> =>
  async (c, next) => {
    const user = c.var.user;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (role === "admin" && user.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    return next();
  };
