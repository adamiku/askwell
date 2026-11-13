import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
