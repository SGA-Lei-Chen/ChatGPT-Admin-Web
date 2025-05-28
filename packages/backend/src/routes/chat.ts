import { appFactory } from "@server/factory";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { stream } from "hono/streaming";

// import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry } from "ai";

export const registry = createProviderRegistry({
  // register provider with prefix and default setup:
  anthropic,

  // register provider with prefix and custom setup:
  //   openai: createOpenAI({
  //     apiKey: process.env.OPENAI_API_KEY,
  //   }),
});
const app = appFactory
  .createApp()
  .get("/chat/conversation", (c) => {
    return c.json({
      status: "ok",
    });
  })
  .post("/chat", async (c) => {
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      prompt: "Invent a new holiday and describe its traditions.",
    });

    // Mark the response as a v1 data stream:
    c.header("X-Vercel-AI-Data-Stream", "v1");
    // c.header("Content-Type", "text/plain; charset=utf-8");

    return stream(c, (stream) => stream.pipe(result.toDataStream()));
  });
export default app;
