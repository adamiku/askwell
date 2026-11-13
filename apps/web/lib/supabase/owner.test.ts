import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getToken, auth } = vi.hoisted(() => {
  const getToken = vi.fn(async () => "clerk-session-token");
  return {
    createClient: vi.fn(() => ({ marker: "client" })),
    getToken,
    auth: vi.fn(async () => ({ getToken })),
  };
});

vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("@clerk/nextjs/server", () => ({ auth }));

import { createOwnerClient } from "./owner";

describe("createOwnerClient", () => {
  beforeEach(() => {
    createClient.mockClear();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  });

  it("uses the URL and publishable key", () => {
    createOwnerClient();
    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "sb_publishable_test",
      expect.any(Object),
    );
  });

  it("passes the Clerk session token as the access token", async () => {
    createOwnerClient();
    const options = (createClient.mock.calls[0] as unknown[])[2] as {
      accessToken: () => Promise<string | null>;
    };
    await expect(options.accessToken()).resolves.toBe("clerk-session-token");
    expect(getToken).toHaveBeenCalledOnce();
  });

  it("throws when the env is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(() => createOwnerClient()).toThrow();
  });
});
