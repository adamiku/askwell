export const MAX_KNOWLEDGE_FILE_BYTES = 10 * 1024 * 1024;

export const KNOWLEDGE_TYPES = ["text", "pdf", "md", "txt"] as const;
export type KnowledgeType = (typeof KNOWLEDGE_TYPES)[number];

/** Types a user can upload as a file. Pasted text uses `text`. */
export const KNOWLEDGE_FILE_TYPES = ["pdf", "md", "txt"] as const;
export type KnowledgeFileType = (typeof KNOWLEDGE_FILE_TYPES)[number];

export const KNOWLEDGE_FILE_EXTENSIONS = {
  pdf: ".pdf",
  md: ".md",
  txt: ".txt",
} as const satisfies Record<KnowledgeFileType, string>;

export const KNOWLEDGE_STATUSES = ["uploading", "processing", "ready", "failed"] as const;
export type KnowledgeStatus = (typeof KNOWLEDGE_STATUSES)[number];

export const MAX_CHAT_MESSAGE_LENGTH = 1000;
export const WIDGET_RATE_LIMIT_PER_MINUTE = 20;
export const PUBLIC_KEY_PREFIX = "pk_";
