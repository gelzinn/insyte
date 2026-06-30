import type { NextRequest } from "next/server";
import { createConsentMiddleware } from "@insyte/track/next";

export const middleware = createConsentMiddleware({
  cookieName: "insyte-consent",
  requiredCategories: ["analytics"],
  allowPaths: ["/", "/blog", "/product", "/api", "/_next", "/favicon.ico"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export type { NextRequest };
