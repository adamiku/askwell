import { z } from "zod";

/** Error codes and the HTTP status each one maps to. */
export const API_ERROR_STATUS = {
  bad_request: 400,
  unauthorized: 401,
  payment_required: 402,
  not_found: 404,
  rate_limited: 429,
} as const;

export const ApiErrorCode = z.enum(
  Object.keys(API_ERROR_STATUS) as [keyof typeof API_ERROR_STATUS, ...(keyof typeof API_ERROR_STATUS)[]],
);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

/** Body of every error response: `{ error: { code, message } }`. */
export const ApiErrorResponse = z.object({
  error: z.object({ code: ApiErrorCode, message: z.string() }),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponse>;
