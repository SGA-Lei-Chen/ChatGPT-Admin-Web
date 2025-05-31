import * as Sentry from "@sentry/react";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});
// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
