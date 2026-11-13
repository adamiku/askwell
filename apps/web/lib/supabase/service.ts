import "server-only";
import type { Database } from "@askwell/db";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the secret key (`service_role`, skips RLS). Server only.
 * Use it after the route has checked ownership and plan. Never filter owner
 * reads by hand with it; use the owner client for those.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL and secret key must be set");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
