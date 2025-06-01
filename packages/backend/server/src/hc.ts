import { hc } from "hono/client";
import type { routes } from ".";
import type admin from "./routes/admin";
import type user from "./routes/user";

// import type
// assign the client to a variable to calculate the type when compiling
const client = hc<typeof routes>("/api");
export type Client = typeof client;
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof routes>(...args);

const adminClient = hc<typeof admin>("/api/admin");
type AdminClient = typeof adminClient;
export const adminClientWithType = (
  ...args: Parameters<typeof hc>
): AdminClient => hc<typeof admin>(...args);

const userClient = hc<typeof user>("/api/user");
type UserClient = typeof userClient;
export const userClientWithType = (
  ...args: Parameters<typeof hc>
): UserClient => hc<typeof user>(...args);
