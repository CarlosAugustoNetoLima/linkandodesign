import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

function renameLegacyPath(pathname: string): string | null {
  if (pathname === "/trabalhos" || pathname === "/portfolio") return "/apresentacoes";
  const m = pathname.match(/^\/trabalhos\/(.+)$/);
  if (m) return `/projeto/${m[1]}`;
  if (pathname === "/contato") return "/#contato";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const flat = pathname.replace(/^\/(pt|en)(?=\/|$)/, "") || "/";
    const url = req.nextUrl.clone();
    url.pathname = renameLegacyPath(flat) ?? flat;
    const res = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", first, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }

  const renamed = renameLegacyPath(pathname);
  if (renamed) {
    const url = req.nextUrl.clone();
    url.pathname = renamed.split("#")[0];
    url.hash = renamed.includes("#") ? renamed.split("#")[1] : "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
