import type {
  JulesClient,
  ListActivitiesParams,
} from "../client/jules-client.js";
import {
  listActivitiesSchema,
  listActivitiesValidator,
} from "../schemas/index.js";
import type { ToolDefinition } from "../types/tool.js";

export const listActivitiesTool: ToolDefinition<
  ListActivitiesParams,
  JulesClient
> = {
  name: "jules_list_activities",
  description:
    "List session activities - GET /v1alpha/sessions/{id}/activities",
  schema: listActivitiesSchema,
  handler: async (params, client) => {
    // Validate input parameters with Zod
    const validated = listActivitiesValidator.parse(params);

    const data = await client.listActivities(validated);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
