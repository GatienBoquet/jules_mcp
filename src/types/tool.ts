import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";

export type ToolHandler<TParams, TClient> = (
  params: TParams,
  client: TClient
) => Promise<CallToolResult>;

/**
 * Tool definition following
 * Schema is a ZodRawShape (the shape object passed to z.object())
 * which the MCP SDK converts to JSON Schema internally.
 */
export interface ToolDefinition<TParams = any, TClient = any> {
  name: string;
  description: string;
  schema: z.ZodRawShape;
  handler: ToolHandler<TParams, TClient>;
}
