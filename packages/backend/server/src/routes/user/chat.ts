import { appFactory } from "@server/factory";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { stream } from "hono/streaming";

// import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry } from "ai";
import { describeRoute } from "hono-openapi";

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
  .use(
    describeRoute({
      tags: ["Chat"],
    })
  )
  .get(
    "/conversation",
    describeRoute({
      description: "Get all conversations",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {},
          },
        },
      },
    }),
    (c) => {
      return c.json({
        status: "ok",
      });
    }
  )
  .get(
    "/conversation/:id",
    describeRoute({
      description: "Get a conversation by id ",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {},
          },
        },
      },
    }),
    (c) => {
      return c.json({
        status: "ok",
      });
    }
  )
  .post(
    "/conversation",
    describeRoute({
      description: "Create a new conversation",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {},
          },
        },
      },
    }),
    async (c) => {
      const result = streamText({
        model: anthropic("claude-3-5-sonnet-latest"),
        prompt: "Invent a new holiday and describe its traditions.",
      });

      // Mark the response as a v1 data stream:
      c.header("X-Vercel-AI-Data-Stream", "v1");
      // c.header("Content-Type", "text/plain; charset=utf-8");

      return stream(c, (stream) => stream.pipe(result.toDataStream()));
    }
  )
  .put(
    "/message/:id",
    describeRoute({
      description: "Update a message",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {},
          },
        },
      },
    }),
    async (c) => {
      const id = c.req.param("id");
      return c.json({
        status: "ok",
      });
    }
  )
  .delete(
    "/message/:id",
    describeRoute({
      description: "Delete a message",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {},
          },
        },
      },
    }),
    async (c) => {
      const id = c.req.param("id");
      return c.json({
        status: "ok",
      });
    }
  );
export default app;
