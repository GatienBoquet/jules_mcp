import type { JulesClient } from "../client/jules-client.js";

export interface ResourceDefinition {
  name: string;
  uri: string;
  handler: (
    uri: URL,
    client: JulesClient
  ) => Promise<{
    contents: Array<{
      uri: string;
      mimeType: string;
      text: string;
    }>;
  }>;
}

export const resources: ResourceDefinition[] = [
  {
    name: "jules://sessions/{id}/activities",
    uri: "jules://sessions/{id}/activities",
    handler: async (uri, client) => {
      const match = uri.pathname.match(/\/sessions\/([^/]+)\/activities/);
      if (!match) throw new Error("Invalid URI format");
      const id = match[1];
      const data = await client.listActivities({ sessionId: id, pageSize: 30 });
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  },
  {
    name: "jules://sources",
    uri: "jules://sources",
    handler: async (uri, client) => {
      const data = await client.listSources({});
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  },
];
