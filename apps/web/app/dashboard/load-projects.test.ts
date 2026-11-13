import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOwnerClient, order } = vi.hoisted(() => ({
  createOwnerClient: vi.fn(),
  order: vi.fn(),
}));

vi.mock("@/lib/supabase/owner", () => ({ createOwnerClient }));

import { loadProjects } from "./load-projects";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  order.mockReset();
  createOwnerClient.mockReset();
  createOwnerClient.mockReturnValue({ from: () => ({ select: () => ({ order }) }) });
});

describe("loadProjects", () => {
  it("returns the rows, or an empty list for a new user", async () => {
    order.mockResolvedValueOnce({
      data: [{ id: "1", name: "Docs", created_at: "2026-01-02T00:00:00Z" }],
      error: null,
    });
    await expect(loadProjects()).resolves.toEqual({
      ok: true,
      projects: [{ id: "1", name: "Docs", created_at: "2026-01-02T00:00:00Z" }],
    });

    order.mockResolvedValueOnce({ data: [], error: null });
    await expect(loadProjects()).resolves.toEqual({ ok: true, projects: [] });
  });

  it("reports an auth error as an auth setup problem", async () => {
    order.mockResolvedValueOnce({ data: null, error: { code: "PGRST301", message: "JWT invalid" } });
    const result = await loadProjects();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/Clerk to Supabase/);
  });

  it("reports other errors with a plain message", async () => {
    order.mockResolvedValueOnce({ data: null, error: { code: "42P01", message: "boom" } });
    const result = await loadProjects();
    expect(result).toEqual({ ok: false, message: expect.stringMatching(/Try again/) });
  });

  it("returns an error when the client throws", async () => {
    createOwnerClient.mockImplementation(() => {
      throw new Error("env missing");
    });
    expect((await loadProjects()).ok).toBe(false);
  });
});
