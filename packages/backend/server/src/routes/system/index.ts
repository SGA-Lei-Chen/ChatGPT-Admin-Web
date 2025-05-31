import { Hono } from "hono";

import health from "./health";
import setup from "./setup";

const app = new Hono().route("/", health).route("/setup", setup);

export default app;
