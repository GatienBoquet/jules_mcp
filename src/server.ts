import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ZodError } from "zod";
import { JulesClient } from "./client/jules-client.js";
import { tools } from "./tools/index.js";
import { resources } from "./resources/index.js";

// ---- Minimal logging (stderr only) ----
const log = (...args: unknown[]) => console.error("[jules-mcp]", ...args);

// ---- Client setup ----
function createClient() {
  const apiKey = process.env.JULES_API_KEY;
  if (!apiKey) throw new Error("Missing JULES_API_KEY env var");
  return new JulesClient({ apiKey });
}

const client = createClient();

// ---- MCP server with tools/resources ----
const server = new McpServer({ name: "jules-mcp", version: "0.3.0" });

log(`Registering ${tools.length} tools...`);
for (const tool of tools) {
  log(`  - ${tool.name}`);
  server.tool(tool.name, tool.description, tool.schema, async (params: any) => {
    try {
      log(`Executing tool: ${tool.name}`);
      const result = await tool.handler(params, client);
      log(`Tool ${tool.name} completed successfully`);
      return result;
    } catch (error) {
      // Handle Zod validation errors with user-friendly messages
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => {
          const path = err.path.join(".");
          return `  - ${path ? `${path}: ` : ""}${err.message}`;
        });

        const formattedError = [
          `❌ Validation Error in ${tool.name}:`,
          "",
          ...errorMessages,
          "",
          "Please check your input parameters and try again.",
        ].join("\n");

        log(`VALIDATION ERROR in tool ${tool.name}:`, formattedError);

        return {
          content: [{ type: "text", text: formattedError }],
          isError: true,
        };
      }

      log(`ERROR in tool ${tool.name}:`, error);
      throw error;
    }
  });
}

log(`Registering ${resources.length} resources...`);
for (const resource of resources) {
  log(`  - ${resource.name} (${resource.uri})`);
  server.resource(resource.name, resource.uri, async (uri) => {
    try {
      log(`Fetching resource: ${resource.name} (${uri})`);
      const result = await resource.handler(uri, client);
      log(`Resource ${resource.name} fetched successfully`);
      return result;
    } catch (error) {
      log(`ERROR in resource ${resource.name}:`, error);
      throw error;
    }
  });
}

// ---- HTTP app (Streamable HTTP only) ----
const app = express();

// Basic Origin check (tweak ALLOWED_ORIGINS if needed)
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || "null,http://localhost"
).split(",");
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "null";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).send("Forbidden Origin");
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Vary", "Origin");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Logging middleware for all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  log(`[${req.method}] ${req.url}`);
  log("Headers:", JSON.stringify(req.headers, null, 2));
  log("Content-Type:", req.headers["content-type"]);
  log("Accept:", req.headers["accept"]);

  // Set Accept header if not present or doesn't include required types
  if (!req.headers.accept || !req.headers.accept.includes("application/json")) {
    req.headers.accept = req.headers.accept
      ? `${req.headers.accept},application/json,text/event-stream`
      : "application/json,text/event-stream";
    log("Modified Accept header to:", req.headers.accept);
  }

  next();
});

app.use(express.json());

// Log parsed body for all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  log("Body type:", typeof req.body);
  log("Body constructor:", req.body?.constructor?.name);
  log("Body keys:", req.body ? Object.keys(req.body).slice(0, 10) : "none");
  log("Body sample:", JSON.stringify(req.body).slice(0, 200));
  next();
});

// Create transport once and connect server to it
// Using stateless mode (sessionIdGenerator: undefined) for better Cursor compatibility
const transport = new StreamableHTTPServerTransport({
  enableJsonResponse: true,
  sessionIdGenerator: undefined,
});

log("Connecting server to transport...");
await server.connect(transport);
log("Server connected and ready!");

// Streamable HTTP endpoint (handle both /mcp and / for compatibility)
app.all(["/mcp", "/"], async (req: Request, res: Response) => {
  try {
    log("Handling request with connected transport...");
    await transport.handleRequest(req as any, res as any, req.body as any);
    log("Request handled successfully");
  } catch (error) {
    log("ERROR in handler:", error);
    if (error instanceof Error) {
      log("Error name:", error.name);
      log("Error message:", error.message);
      log("Error stack:", error.stack);
    }
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

const PORT = parseInt(process.env.PORT || "3323", 10);
const HOST = process.env.HOST || "127.0.0.1";
app
  .listen(PORT, HOST, () => {
    log(`Server on http://${HOST}:${PORT} (Streamable HTTP: /mcp)`);
  })
  .on("error", (err: unknown) => {
    log("Server error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (e: unknown) => log("unhandledRejection", e));
process.on("uncaughtException", (e: unknown) => log("uncaughtException", e));
