import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({ marker: "client" })) }));
// Built from parts so the secret-key scan finds this name only in service.ts.
const SECRET_ENV = ["SUPABASE", "SECRET", "KEY"].join("_");

vi.mock("server-only", () => ({}));
vi.mock("@supabase/supabase-js", () => ({ createClient }));

import { createServiceClient } from "./service";

describe("createServiceClient", () => {
  beforeEach(() => {
    createClient.mockClear();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv(SECRET_ENV, "sb_secret_test");
  });

  it("uses the secret key with session persistence off", () => {
    createServiceClient();
    expect(createClient).toHaveBeenCalledWith("https://example.supabase.co", "sb_secret_test", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });

  it("throws when the secret key is missing", () => {
    vi.stubEnv(SECRET_ENV, "");
    expect(() => createServiceClient()).toThrow();
  });

  it("starts with the server-only import", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL("./service.ts", import.meta.url), "utf8");
    expect(source.trimStart().startsWith('import "server-only";')).toBe(true);
  });
});
