import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER } from "@/lib/i18n/config";

const PROTECTED = ["/editor", "/dashboard", "/admin"];

export async function middleware(request: NextRequest) {
  const locale = DEFAULT_LOCALE;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Always pin Georgian so client trees and SSR stay in sync.
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        response.cookies.set(LOCALE_COOKIE, locale, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
        response.headers.set(LOCALE_HEADER, locale);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  if (needsAuth && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path);
    const redirect = NextResponse.redirect(login);
    redirect.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
