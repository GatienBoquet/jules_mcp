import type {
  JulesClient,
  CreateSessionParams,
  ListSessionsParams,
  ApprovePlanParams,
  SendMessageParams,
} from "../client/jules-client.js";
import {
  createSessionSchema,
  createSessionValidator,
  listSessionsSchema,
  listSessionsValidator,
  approvePlanSchema,
  approvePlanValidator,
  sendMessageSchema,
  sendMessageValidator,
} from "../schemas/index.js";
import type { ToolDefinition } from "../types/tool.js";

export const createSessionTool: ToolDefinition<
  CreateSessionParams,
  JulesClient
> = {
  name: "jules_create_session",
  description: "Create Jules session - POST /v1alpha/sessions",
  schema: createSessionSchema,
  handler: async (params, client) => {
    // Validate input parameters with Zod
    const validated = createSessionValidator.parse(params);

    const data = await client.createSession(validated);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const listSessionsTool: ToolDefinition<ListSessionsParams, JulesClient> =
  {
    name: "jules_list_sessions",
    description: "List Jules sessions - GET /v1alpha/sessions",
    schema: listSessionsSchema,
    handler: async (params, client) => {
      // Validate input parameters with Zod
      const validated = listSessionsValidator.parse(params);

      const data = await client.listSessions(validated);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  };

export const approvePlanTool: ToolDefinition<ApprovePlanParams, JulesClient> = {
  name: "jules_approve_plan",
  description: "Approve latest plan - POST /v1alpha/sessions/{id}:approvePlan",
  schema: approvePlanSchema,
  handler: async (params, client) => {
    // Validate input parameters with Zod
    const validated = approvePlanValidator.parse(params);

    const data = await client.approvePlan(validated);
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
    };
  },
};

export const sendMessageTool: ToolDefinition<SendMessageParams, JulesClient> = {
  name: "jules_send_message",
  description:
    "Send a message to the agent - POST /v1alpha/sessions/{id}:sendMessage",
  schema: sendMessageSchema,
  handler: async (params, client) => {
    // Validate input parameters with Zod
    const validated = sendMessageValidator.parse(params);

    const data = await client.sendMessage(validated);
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
    };
  },
};
