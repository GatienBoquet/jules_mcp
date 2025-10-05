import { z } from "zod";

/**
 * Base pagination fields for list operations
 */
const paginationFields = {
  pageSize: z
    .number()
    .int("Page size must be an integer")
    .min(1, "Page size must be at least 1")
    .max(100, "Page size cannot exceed 100")
    .optional()
    .describe("Number of items per page (max 100)"),
  pageToken: z
    .string()
    .min(1, "Page token cannot be empty")
    .optional()
    .describe("Token for pagination"),
};

/**
 * Schema shape for listing Jules sources
 * GET /v1alpha/sources
 */
export const listSourcesSchema = paginationFields;
export const listSourcesValidator = z.object(paginationFields);

/**
 * Schema shape for listing Jules sessions
 * GET /v1alpha/sessions
 */
export const listSessionsSchema = paginationFields;
export const listSessionsValidator = z.object(paginationFields);

/**
 * Schema shape for creating a new Jules session
 * POST /v1alpha/sessions
 */
export const createSessionSchema = {
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(10000, "Prompt is too long (max 10000 characters)")
    .describe("The task prompt for Jules"),
  source: z
    .string()
    .regex(
      /^sources\/github\/[\w-]+\/[\w.-]+$/,
      "Invalid source format. Expected: sources/github/owner/repo"
    )
    .describe('Source path, e.g., "sources/github/owner/repo"'),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title is too long (max 200 characters)")
    .optional()
    .describe("Optional session title"),
  startingBranch: z
    .string()
    .min(1, "Branch name cannot be empty")
    .max(255, "Branch name is too long")
    .regex(
      /^[\w.\-/]+$/,
      "Invalid branch name. Use only alphanumeric characters, dots, dashes, and slashes"
    )
    .default("main")
    .describe("Git branch to start from (default: main)"),
  requirePlanApproval: z
    .boolean()
    .default(false)
    .describe("Whether to require plan approval before execution"),
};
export const createSessionValidator = z.object(createSessionSchema);

/**
 * Schema shape for approving a session plan
 * POST /v1alpha/sessions/{id}:approvePlan
 */
export const approvePlanSchema = {
  sessionId: z
    .string()
    .min(1, "Session ID cannot be empty")
    .regex(
      /^sessions\/[\w-]+$/,
      "Invalid session ID format. Expected: sessions/{id}"
    )
    .describe("The session ID to approve the plan for"),
};
export const approvePlanValidator = z.object(approvePlanSchema);

/**
 * Schema shape for sending a message to a session
 * POST /v1alpha/sessions/{id}:sendMessage
 */
export const sendMessageSchema = {
  sessionId: z
    .string()
    .min(1, "Session ID cannot be empty")
    .regex(
      /^sessions\/[\w-]+$/,
      "Invalid session ID format. Expected: sessions/{id}"
    )
    .describe("The session ID to send the message to"),
  prompt: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message is too long (max 10000 characters)")
    .describe("The message to send to the agent"),
};
export const sendMessageValidator = z.object(sendMessageSchema);

/**
 * Schema shape for listing session activities
 * GET /v1alpha/sessions/{id}/activities
 */
export const listActivitiesSchema = {
  sessionId: z
    .string()
    .min(1, "Session ID cannot be empty")
    .regex(
      /^sessions\/[\w-]+$/,
      "Invalid session ID format. Expected: sessions/{id}"
    )
    .describe("The session ID to list activities for"),
  ...paginationFields,
};
export const listActivitiesValidator = z.object(listActivitiesSchema);
