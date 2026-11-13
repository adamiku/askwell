import { API_ERROR_STATUS, ApiErrorResponse } from "@askwell/shared";
import { describe, expect, it } from "vitest";
import { isApiPath, isProtectedPath, unauthorizedResponse } from "./route-access";

describe("isProtectedPath", () => {
  it.each([
    "/dashboard",
    "/dashboard/",
    "/dashboard/projects/123",
    "/api/projects",
    "/api/projects/abc/knowledge/finalize",
    "/api/knowledge/abc",
    "/api/conversations/abc",
    "/Dashboard",
    "//api//projects",
  ])("protects %s", (path) => {
    expect(isProtectedPath(path)).toBe(true);
  });

  it.each([
    "/",
    "/embed",
    "/api/widget/config",
    "/api/widget/chat",
    "/api/clerk/webhook",
    "/api/posthog-config",
    "/sign-in",
    "/sign-in/factor-one",
    "/sign-up",
    "/dashboards",
  ])("leaves %s public", (path) => {
    expect(isProtectedPath(path)).toBe(false);
  });
});

describe("isApiPath", () => {
  it("tells API routes from pages", () => {
    expect(isApiPath("/api/projects")).toBe(true);
    expect(isApiPath("/dashboard")).toBe(false);
    expect(isApiPath("/apiary")).toBe(false);
  });
});

describe("unauthorizedResponse", () => {
  it("returns 401 with the error shape", async () => {
    const res = unauthorizedResponse();
    expect(res.status).toBe(API_ERROR_STATUS.unauthorized);
    const body = ApiErrorResponse.parse(await res.json());
    expect(body.error.code).toBe("unauthorized");
  });
});
