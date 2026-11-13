import { API_ERROR_STATUS, type ApiErrorResponse } from "@askwell/shared";

/**
 * Which paths need an owner session. Pure so it can be tested without Clerk.
 * Everything not listed here is public (`/`, `/embed`, `/api/widget/*`,
 * `/api/clerk/webhook`, `/api/posthog-config`, `/sign-in`, `/sign-up`).
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/api/projects",
  "/api/knowledge",
  "/api/conversations",
] as const;

/** Lowercase and collapse repeated slashes, so odd spellings can't slip past. */
function normalizePath(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, "/").toLowerCase();
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed;
}

export function isProtectedPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isApiPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === "/api" || path.startsWith("/api/");
}

/** The error shape from project.md §8, typed by the shared contract. */
export function unauthorizedResponse(): Response {
  const body: ApiErrorResponse = {
    error: { code: "unauthorized", message: "Sign in to use this endpoint." },
  };
  return Response.json(body, { status: API_ERROR_STATUS.unauthorized });
}
