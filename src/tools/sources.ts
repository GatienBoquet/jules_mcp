import type { JulesClient, ListSourcesParams } from "../client/jules-client.js";
import { listSourcesSchema, listSourcesValidator } from "../schemas/index.js";
import type { ToolDefinition } from "../types/tool.js";

export const listSourcesTool: ToolDefinition<ListSourcesParams, JulesClient> = {
  name: "jules_list_sources",
  description: "List Jules sources - GET /v1alpha/sources",
  schema: listSourcesSchema,
  handler: async (params, client) => {
    // Validate input parameters with Zod
    const validated = listSourcesValidator.parse(params);

    const data = await client.listSources(validated);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
};
