import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  isApiPath,
  isProtectedPath,
  unauthorizedResponse,
} from "@/lib/auth/route-access";

export default clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;
    if (!isProtectedPath(pathname)) return;

    if (isApiPath(pathname)) {
      const { isAuthenticated } = await auth();
      if (!isAuthenticated) return unauthorizedResponse();
      return;
    }

    // Pages: send signed-out visitors to /sign-in.
    await auth.protect();
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
