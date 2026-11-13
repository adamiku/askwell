import { createServiceClient } from "@/lib/supabase/service";

/**
 * Makes sure an `accounts` row exists for a Clerk user. Plan `free` comes from the
 * column default. Insert only: ON CONFLICT DO NOTHING, so an existing row (and its
 * plan) is never touched. Safe on every request and under concurrent first requests.
 *
 * The caller passes the ID from Clerk's `auth()` on the server, never one from the client.
 */
export async function ensureAccount(clerkUserId: string): Promise<void> {
  if (!clerkUserId) {
    throw new Error("ensureAccount needs a Clerk user ID");
  }

  const { error } = await createServiceClient()
    .from("accounts")
    .upsert({ clerk_user_id: clerkUserId }, { onConflict: "clerk_user_id", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Could not create the account row (${error.code}): ${error.message}`);
  }
}
