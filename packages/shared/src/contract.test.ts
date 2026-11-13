import { describe, expect, it } from "vitest";
import {
  API_ERROR_STATUS,
  ApiErrorCode,
  ApiErrorResponse,
  APP_NAME,
  DEFAULT_WIDGET_CONFIG,
  KNOWLEDGE_FILE_EXTENSIONS,
  MAX_CHAT_MESSAGE_LENGTH,
  MAX_KNOWLEDGE_FILE_BYTES,
  PLAN_LIMITS,
  PUBLIC_KEY_PREFIX,
  WIDGET_RATE_LIMIT_PER_MINUTE,
  chatMessageSchema,
  conversationSummarySchema,
  createProjectInputSchema,
  createProjectOutputSchema,
  deleteKnowledgeOutputSchema,
  deleteProjectOutputSchema,
  finalizeKnowledgeInputSchema,
  finalizeKnowledgeOutputSchema,
  getConversationOutputSchema,
  idParamsSchema,
  listConversationsOutputSchema,
  listProjectsOutputSchema,
  pasteKnowledgeInputSchema,
  pasteKnowledgeOutputSchema,
  posthogConfigOutputSchema,
  updateConfigInputSchema,
  updateConfigOutputSchema,
  updateProjectInputSchema,
  updateProjectOutputSchema,
  uploadUrlInputSchema,
  uploadUrlOutputSchema,
  widgetChatInputSchema,
  widgetChatOutputSchema,
  widgetConfigInputSchema,
  widgetConfigOutputSchema,
  type Plan,
} from "./index";

const id = "6f1c1f0e-8c1a-4d0e-9d57-0a7b8f6d2c11";
const now = "2026-11-13T10:00:00.000Z";
const project = { id, name: "Docs", publicKey: "pk_abc", messagesUsed: 0, periodStart: now, createdAt: now };
const source = { id, title: "FAQ", type: "pdf", status: "processing", createdAt: now };
const summary = { id, visitorId: "v1", preview: "Hi", messageCount: 2, createdAt: now };

describe("APP_NAME", () => {
  it("is Askwell", () => {
    expect(APP_NAME).toBe("Askwell");
  });
});

describe("PLAN_LIMITS (project.md §5)", () => {
  it("matches the free column", () => {
    expect(PLAN_LIMITS.free).toEqual({
      projects: 1,
      messagesPerMonth: 100,
      knowledgeSources: 3,
      customize: { color: false, position: false, label: false, animation: false, headerText: false, hideBadge: false },
    });
  });

  it("matches the pro column", () => {
    expect(PLAN_LIMITS.pro).toEqual({
      projects: 5,
      messagesPerMonth: 2000,
      knowledgeSources: 25,
      customize: { color: true, position: true, label: true, animation: true, headerText: true, hideBadge: true },
    });
  });

  it("has an entry for every plan", () => {
    const plans: Plan[] = ["free", "pro"];
    expect(Object.keys(PLAN_LIMITS).sort()).toEqual(plans);
  });
});

describe("constants", () => {
  it("has the spec values", () => {
    expect(MAX_KNOWLEDGE_FILE_BYTES).toBe(10 * 1024 * 1024);
    expect(MAX_CHAT_MESSAGE_LENGTH).toBe(1000);
    expect(WIDGET_RATE_LIMIT_PER_MINUTE).toBe(20);
    expect(PUBLIC_KEY_PREFIX).toBe("pk_");
    expect(KNOWLEDGE_FILE_EXTENSIONS).toEqual({ pdf: ".pdf", md: ".md", txt: ".txt" });
  });

  it("defaults a Free widget to bottom right, fade, badge shown", () => {
    expect(DEFAULT_WIDGET_CONFIG).toMatchObject({ position: "bottom-right", animation: "fade", showBadge: true });
  });
});

describe("error shape", () => {
  it("maps codes to 400, 401, 402, 404, 429", () => {
    expect(Object.values(API_ERROR_STATUS).sort()).toEqual([400, 401, 402, 404, 429]);
    expect(API_ERROR_STATUS.unauthorized).toBe(401);
  });

  it("parses a valid error and rejects an unknown code", () => {
    expect(ApiErrorResponse.safeParse({ error: { code: "unauthorized", message: "Sign in" } }).success).toBe(true);
    expect(ApiErrorResponse.safeParse({ error: { code: "teapot", message: "x" } }).success).toBe(false);
    expect(ApiErrorCode.safeParse("rate_limited").success).toBe(true);
  });
});

// One valid and one invalid parse for every route schema.
const cases: [string, { safeParse: (v: unknown) => { success: boolean } }, unknown, unknown][] = [
  ["widgetConfigInput", widgetConfigInputSchema, { key: "pk_abc" }, { key: "abc" }],
  ["widgetConfigOutput", widgetConfigOutputSchema, DEFAULT_WIDGET_CONFIG, { ...DEFAULT_WIDGET_CONFIG, position: "middle" }],
  ["widgetChatInput", widgetChatInputSchema, { key: "pk_abc", visitorId: "v1", message: "Hello" }, { key: "pk_abc", visitorId: "v1", message: "x".repeat(MAX_CHAT_MESSAGE_LENGTH + 1) }],
  ["widgetChatOutput", widgetChatOutputSchema, { conversationId: id, reply: "Hi" }, { conversationId: "nope", reply: "Hi" }],
  ["idParams", idParamsSchema, { id }, { id: "1" }],
  ["listProjectsOutput", listProjectsOutputSchema, { projects: [project] }, { projects: [{ ...project, messagesUsed: -1 }] }],
  ["createProjectInput", createProjectInputSchema, { name: "Docs" }, { name: "  " }],
  ["createProjectOutput", createProjectOutputSchema, { project }, { project: { ...project, publicKey: "abc" } }],
  ["updateProjectInput", updateProjectInputSchema, { name: "New" }, {}],
  ["updateProjectOutput", updateProjectOutputSchema, { project }, {}],
  ["deleteProjectOutput", deleteProjectOutputSchema, { ok: true }, { ok: false }],
  ["pasteKnowledgeInput", pasteKnowledgeInputSchema, { title: "FAQ", text: "Hello" }, { title: "", text: "Hello" }],
  ["pasteKnowledgeOutput", pasteKnowledgeOutputSchema, { source }, { source: { ...source, status: "done" } }],
  ["uploadUrlInput", uploadUrlInputSchema, { title: "FAQ", fileName: "faq.PDF", size: 1024 }, { title: "FAQ", fileName: "faq.exe", size: 1024 }],
  ["uploadUrlInput size", uploadUrlInputSchema, { title: "FAQ", fileName: "faq.md", size: MAX_KNOWLEDGE_FILE_BYTES }, { title: "FAQ", fileName: "faq.md", size: MAX_KNOWLEDGE_FILE_BYTES + 1 }],
  ["uploadUrlOutput", uploadUrlOutputSchema, { source, uploadUrl: "https://example.com/upload" }, { source, uploadUrl: "not a url" }],
  ["finalizeKnowledgeInput", finalizeKnowledgeInputSchema, { sourceId: id }, { sourceId: "x" }],
  ["finalizeKnowledgeOutput", finalizeKnowledgeOutputSchema, { source }, {}],
  ["deleteKnowledgeOutput", deleteKnowledgeOutputSchema, { ok: true }, {}],
  ["conversationSummary", conversationSummarySchema, summary, { ...summary, messageCount: -1 }],
  ["listConversationsOutput", listConversationsOutputSchema, { conversations: [summary] }, { conversations: [{}] }],
  ["chatMessage", chatMessageSchema, { id, role: "bot", body: "Hi", createdAt: now }, { id, role: "system", body: "Hi", createdAt: now }],
  ["getConversationOutput", getConversationOutputSchema, { conversation: summary, messages: [] }, { conversation: summary }],
  ["updateConfigInput", updateConfigInputSchema, { position: "top-left", animation: "scale" }, {}],
  ["updateConfigInput color", updateConfigInputSchema, { buttonColor: "#112233" }, { buttonColor: "red" }],
  ["updateConfigOutput", updateConfigOutputSchema, { config: DEFAULT_WIDGET_CONFIG }, { config: {} }],
  ["posthogConfigOutput", posthogConfigOutputSchema, { key: "phc_x", host: "https://eu.i.posthog.com" }, { key: "phc_x", host: "host" }],
];

describe.each(cases)("%s", (_name, schema, valid, invalid) => {
  it("accepts a valid value", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });
  it("rejects an invalid value", () => {
    expect(schema.safeParse(invalid).success).toBe(false);
  });
});
