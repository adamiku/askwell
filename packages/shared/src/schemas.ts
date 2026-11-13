import { z } from "zod";
import {
  KNOWLEDGE_FILE_EXTENSIONS,
  KNOWLEDGE_FILE_TYPES,
  KNOWLEDGE_STATUSES,
  KNOWLEDGE_TYPES,
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_KNOWLEDGE_FILE_BYTES,
  MAX_PASTE_TEXT_CHARS,
  PUBLIC_KEY_PREFIX,
} from "./constants";
import { PLANS, WIDGET_ANIMATIONS, WIDGET_POSITIONS } from "./plans";

// Shared pieces ----------------------------------------------------------------

export const planSchema = z.enum(PLANS);
export const publicKeySchema = z.string().startsWith(PUBLIC_KEY_PREFIX).max(128);
export const idSchema = z.uuid();
const timestampSchema = z.string();
const projectNameSchema = z.string().trim().min(1).max(80);

export const widgetConfigSchema = z.object({
  buttonColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable(),
  position: z.enum(WIDGET_POSITIONS),
  label: z.string().trim().min(1).max(40).nullable(),
  animation: z.enum(WIDGET_ANIMATIONS),
  headerText: z.string().trim().min(1).max(80).nullable(),
  showBadge: z.boolean(),
});
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

/** What a Free project gets: defaults plus the badge. */
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  buttonColor: null,
  position: "bottom-right",
  label: null,
  animation: "fade",
  headerText: null,
  showBadge: true,
};

export const projectSchema = z.object({
  id: idSchema,
  name: z.string(),
  publicKey: publicKeySchema,
  messagesUsed: z.number().int().min(0),
  periodStart: timestampSchema,
  createdAt: timestampSchema,
});
export type Project = z.infer<typeof projectSchema>;

export const knowledgeSourceSchema = z.object({
  id: idSchema,
  title: z.string(),
  type: z.enum(KNOWLEDGE_TYPES),
  status: z.enum(KNOWLEDGE_STATUSES),
  createdAt: timestampSchema,
});
export type KnowledgeSource = z.infer<typeof knowledgeSourceSchema>;

export const okSchema = z.object({ ok: z.literal(true) });
export type Ok = z.infer<typeof okSchema>;

/** Path params shared by the `:id` routes. */
export const idParamsSchema = z.object({ id: idSchema });
export type IdParams = z.infer<typeof idParamsSchema>;

// Public routes ----------------------------------------------------------------

/** GET /api/widget/config */
export const widgetConfigInputSchema = z.object({ key: publicKeySchema });
export type WidgetConfigInput = z.infer<typeof widgetConfigInputSchema>;
export const widgetConfigOutputSchema = widgetConfigSchema;
export type WidgetConfigOutput = WidgetConfig;

/** POST /api/widget/chat */
export const widgetChatInputSchema = z.object({
  key: publicKeySchema,
  visitorId: z.string().min(1).max(128),
  conversationId: idSchema.optional(),
  message: z.string().trim().min(1).max(MAX_CHAT_MESSAGE_LENGTH),
});
export type WidgetChatInput = z.infer<typeof widgetChatInputSchema>;
export const widgetChatOutputSchema = z.object({
  conversationId: idSchema,
  reply: z.string(),
});
export type WidgetChatOutput = z.infer<typeof widgetChatOutputSchema>;

// Owner routes: projects -------------------------------------------------------

/** GET /api/projects */
export const listProjectsOutputSchema = z.object({ projects: z.array(projectSchema) });
export type ListProjectsOutput = z.infer<typeof listProjectsOutputSchema>;

/** POST /api/projects */
export const createProjectInputSchema = z.object({ name: projectNameSchema });
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export const createProjectOutputSchema = z.object({ project: projectSchema });
export type CreateProjectOutput = z.infer<typeof createProjectOutputSchema>;

/** PATCH /api/projects/:id (rename) */
export const updateProjectInputSchema = z.object({ name: projectNameSchema });
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export const updateProjectOutputSchema = createProjectOutputSchema;
export type UpdateProjectOutput = CreateProjectOutput;

/** DELETE /api/projects/:id */
export const deleteProjectOutputSchema = okSchema;
export type DeleteProjectOutput = Ok;

// Owner routes: knowledge ------------------------------------------------------

/** POST /api/projects/:id/knowledge (paste text) */
export const pasteKnowledgeInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(MAX_PASTE_TEXT_CHARS),
});
export type PasteKnowledgeInput = z.infer<typeof pasteKnowledgeInputSchema>;
export const pasteKnowledgeOutputSchema = z.object({ source: knowledgeSourceSchema });
export type PasteKnowledgeOutput = z.infer<typeof pasteKnowledgeOutputSchema>;

const allowedExtensions = KNOWLEDGE_FILE_TYPES.map((t) => KNOWLEDGE_FILE_EXTENSIONS[t]);

/** POST /api/projects/:id/knowledge/upload-url */
export const uploadUrlInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  fileName: z
    .string()
    .min(1)
    .max(255)
    .refine((name) => allowedExtensions.some((ext) => name.toLowerCase().endsWith(ext)), {
      message: `File must be one of: ${allowedExtensions.join(", ")}`,
    }),
  size: z.number().int().min(1).max(MAX_KNOWLEDGE_FILE_BYTES),
});
export type UploadUrlInput = z.infer<typeof uploadUrlInputSchema>;
export const uploadUrlOutputSchema = z.object({
  source: knowledgeSourceSchema,
  uploadUrl: z.url(),
});
export type UploadUrlOutput = z.infer<typeof uploadUrlOutputSchema>;

/** POST /api/projects/:id/knowledge/finalize */
export const finalizeKnowledgeInputSchema = z.object({ sourceId: idSchema });
export type FinalizeKnowledgeInput = z.infer<typeof finalizeKnowledgeInputSchema>;
export const finalizeKnowledgeOutputSchema = z.object({ source: knowledgeSourceSchema });
export type FinalizeKnowledgeOutput = z.infer<typeof finalizeKnowledgeOutputSchema>;

/** DELETE /api/knowledge/:id */
export const deleteKnowledgeOutputSchema = okSchema;
export type DeleteKnowledgeOutput = Ok;

// Owner routes: conversations --------------------------------------------------

export const conversationSummarySchema = z.object({
  id: idSchema,
  visitorId: z.string(),
  preview: z.string(),
  messageCount: z.number().int().min(0),
  createdAt: timestampSchema,
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

/** GET /api/projects/:id/conversations (newest first) */
export const listConversationsOutputSchema = z.object({
  conversations: z.array(conversationSummarySchema),
});
export type ListConversationsOutput = z.infer<typeof listConversationsOutputSchema>;

export const chatMessageSchema = z.object({
  id: idSchema,
  role: z.enum(["visitor", "bot"]),
  body: z.string(),
  createdAt: timestampSchema,
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** GET /api/conversations/:id */
export const getConversationOutputSchema = z.object({
  conversation: conversationSummarySchema,
  messages: z.array(chatMessageSchema),
});
export type GetConversationOutput = z.infer<typeof getConversationOutputSchema>;

// Owner routes: config ---------------------------------------------------------

/** PATCH /api/projects/:id/config (402 on Free) */
export const updateConfigInputSchema = widgetConfigSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: "Send at least one field" });
export type UpdateConfigInput = z.infer<typeof updateConfigInputSchema>;
export const updateConfigOutputSchema = z.object({ config: widgetConfigSchema });
export type UpdateConfigOutput = z.infer<typeof updateConfigOutputSchema>;

// System routes ----------------------------------------------------------------

/** GET /api/posthog-config (no input) */
export const posthogConfigOutputSchema = z.object({
  key: z.string(),
  host: z.url(),
});
export type PosthogConfigOutput = z.infer<typeof posthogConfigOutputSchema>;
