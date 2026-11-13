import type { Metadata } from "next";
import { APP_NAME } from "@askwell/shared";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: `Billing | ${APP_NAME}` };

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <div className="mt-8">
        <EmptyState
          title="Billing is not set up yet"
          description="Plans and upgrades will appear here."
        />
      </div>
    </div>
  );
}
