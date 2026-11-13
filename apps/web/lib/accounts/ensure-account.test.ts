import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = { clerk_user_id: string; plan: "free" | "pro" };
type UpsertOptions = { onConflict: string; ignoreDuplicates: boolean };

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient }));

import { ensureAccount } from "./ensure-account";

/** A small in-memory `accounts` table that follows upsert / ignoreDuplicates semantics. */
function fakeAccounts(initial: Row[] = [], failWith?: { code: string; message: string }) {
  const rows = new Map(initial.map((row) => [row.clerk_user_id, row]));
  const upsert = vi.fn(async (value: { clerk_user_id: string; plan?: "free" | "pro" }, options: UpsertOptions) => {
    if (failWith) return { error: failWith };
    const existing = rows.get(value.clerk_user_id);
    if (!existing) rows.set(value.clerk_user_id, { plan: "free", ...value });
    else if (!options.ignoreDuplicates) rows.set(value.clerk_user_id, { ...existing, ...value });
    return { error: null };
  });
  createServiceClient.mockReturnValue({ from: vi.fn(() => ({ upsert })) });
  return { rows, upsert };
}

beforeEach(() => {
  createServiceClient.mockReset();
});

describe("ensureAccount", () => {
  it("inserts a free account on the first call", async () => {
    const { rows } = fakeAccounts();
    await ensureAccount("user_1");
    expect(rows.get("user_1")).toEqual({ clerk_user_id: "user_1", plan: "free" });
  });

  it("does nothing on the second call", async () => {
    const { rows, upsert } = fakeAccounts();
    await ensureAccount("user_1");
    const before = structuredClone([...rows.values()]);
    await ensureAccount("user_1");
    expect([...rows.values()]).toEqual(before);
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it("does not reset an existing pro plan", async () => {
    const { rows } = fakeAccounts([{ clerk_user_id: "user_1", plan: "pro" }]);
    await ensureAccount("user_1");
    expect(rows.get("user_1")?.plan).toBe("pro");
  });

  it("inserts only the ID and ignores duplicates", async () => {
    const { upsert } = fakeAccounts();
    await ensureAccount("user_1");
    expect(upsert).toHaveBeenCalledWith(
      { clerk_user_id: "user_1" },
      { onConflict: "clerk_user_id", ignoreDuplicates: true },
    );
  });

  it("surfaces a Supabase error", async () => {
    fakeAccounts([], { code: "42501", message: "permission denied" });
    await expect(ensureAccount("user_1")).rejects.toThrow(/42501.*permission denied/);
  });

  it("rejects an empty user ID without calling Supabase", async () => {
    fakeAccounts();
    await expect(ensureAccount("")).rejects.toThrow();
    expect(createServiceClient).not.toHaveBeenCalled();
  });
});
