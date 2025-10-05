const API_BASE = "https://jules.googleapis.com/v1alpha";

export interface JulesClientOptions {
  apiKey: string;
}

export interface ListSourcesParams {
  pageSize?: number;
  pageToken?: string;
}

export interface CreateSessionParams {
  prompt: string;
  source: string;
  title?: string;
  startingBranch?: string;
  requirePlanApproval?: boolean;
}

export interface ListSessionsParams {
  pageSize?: number;
  pageToken?: string;
}

export interface ApprovePlanParams {
  sessionId: string;
}

export interface SendMessageParams {
  sessionId: string;
  prompt: string;
}

export interface ListActivitiesParams {
  sessionId: string;
  pageSize?: number;
  pageToken?: string;
}

export class JulesClient {
  private readonly apiKey: string;

  constructor(options: JulesClientOptions) {
    this.apiKey = options.apiKey;
  }

  async listSources(params: ListSourcesParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params.pageToken) searchParams.set("pageToken", params.pageToken);
    return this.request(`/sources${serializeQuery(searchParams)}`);
  }

  async createSession(params: CreateSessionParams) {
    const body = {
      prompt: params.prompt,
      sourceContext: {
        source: params.source,
        githubRepoContext: {
          startingBranch: params.startingBranch || "main",
        },
      },
      title: params.title,
      requirePlanApproval: params.requirePlanApproval ?? false,
    };

    return this.request("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async listSessions(params: ListSessionsParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params.pageToken) searchParams.set("pageToken", params.pageToken);
    return this.request(`/sessions${serializeQuery(searchParams)}`);
  }

  async approvePlan(params: ApprovePlanParams) {
    await this.request(
      `/sessions/${encodeURIComponent(params.sessionId)}:approvePlan`,
      {
        method: "POST",
      }
    );
    return { ok: true };
  }

  async sendMessage(params: SendMessageParams) {
    await this.request(
      `/sessions/${encodeURIComponent(params.sessionId)}:sendMessage`,
      {
        method: "POST",
        body: JSON.stringify({ prompt: params.prompt }),
      }
    );
    return {
      sent: true,
      note: "Check activities for the agent's response.",
    };
  }

  async listActivities(params: ListActivitiesParams) {
    const searchParams = new URLSearchParams();
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params.pageToken) searchParams.set("pageToken", params.pageToken);
    const path = `/sessions/${encodeURIComponent(
      params.sessionId
    )}/activities${serializeQuery(searchParams)}`;
    return this.request(path);
  }

  private async request<T = unknown>(
    path: string,
    init?: RequestInit
  ): Promise<T | null> {
    const response = await fetch(`${API_BASE}${normalizePath(path)}`, {
      ...init,
      headers: {
        "X-Goog-Api-Key": this.apiKey,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Jules API ${response.status} ${response.statusText} — ${text}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    return (await response.json()) as T;
  }
}

function serializeQuery(params: URLSearchParams) {
  const query = params.toString();
  return query ? `?${query}` : "";
}

function normalizePath(path: string) {
  return path.replace(/\+/g, "/");
}
