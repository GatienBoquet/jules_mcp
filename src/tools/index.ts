import type { JulesClient } from "../client/jules-client.js";
import type { ToolDefinition } from "../types/tool.js";
import { listSourcesTool } from "./sources.js";
import {
  createSessionTool,
  listSessionsTool,
  approvePlanTool,
  sendMessageTool,
} from "./sessions.js";
import { listActivitiesTool } from "./activities.js";

export const tools: Array<ToolDefinition<any, JulesClient>> = [
  listSourcesTool,
  createSessionTool,
  listSessionsTool,
  approvePlanTool,
  sendMessageTool,
  listActivitiesTool,
];
