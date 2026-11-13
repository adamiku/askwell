import Link from "next/link";
import { APP_NAME } from "@askwell/shared";

export function Footer() {
  return (
    <footer className="mx-auto mt-8 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-border px-4 py-10 text-sm text-fg-muted sm:flex-row">
      <p>{APP_NAME}</p>
      <nav aria-label="Footer" className="flex gap-6">
        <Link href="/sign-up" className="hover:text-fg">
          Start free
        </Link>
        <Link href="/sign-in" className="hover:text-fg">
          Sign in
        </Link>
      </nav>
    </footer>
  );
}
