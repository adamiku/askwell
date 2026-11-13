import { auth } from "@clerk/nextjs/server";
import type { Database } from "@askwell/db";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client that acts as the signed-in owner. It sends the Clerk session
 * token, so RLS reads the user from `auth.jwt()->>'sub'`. Server-side only.
 */
export function createOwnerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL and publishable key must be set");
  }

  return createClient<Database>(url, key, {
    accessToken: async () => (await auth()).getToken(),
  });
}
