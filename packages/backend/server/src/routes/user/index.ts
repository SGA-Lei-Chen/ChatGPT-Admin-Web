import { Hono } from "hono";

import chat from "./chat";

const app = new Hono().route("/chat", chat);

export default app;
