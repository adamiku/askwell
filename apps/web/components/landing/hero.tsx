import Link from "next/link";
import { APP_NAME } from "@askwell/shared";

const ctaBase =
  "inline-flex min-h-11 items-center justify-center rounded-control px-5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-20 text-center sm:pt-32">
      <p className="lp-enter text-sm text-fg-muted">{APP_NAME}</p>
      <h1 className="lp-enter lp-enter-2 mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        A support chat that answers from your own product info
      </h1>
      <p className="lp-enter lp-enter-3 mt-6 max-w-xl text-base text-fg-muted text-pretty sm:text-lg">
        Add your product info as text or PDF, paste one script tag on your site, and visitors get
        answers to their questions.
      </p>
      <div className="lp-enter lp-enter-3 mt-10 flex flex-col items-stretch gap-3 sm:flex-row">
        <Link href="/sign-up" className={`${ctaBase} bg-accent text-accent-fg shadow-button hover:opacity-90`}>
          Start free
        </Link>
        <Link
          href="/sign-in"
          className={`${ctaBase} border border-border bg-surface text-fg backdrop-blur-glass hover:bg-surface-strong`}
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}
