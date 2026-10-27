import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

// O idioma não vive mais na URL: PT-BR é o padrão e o seletor PT·EN do header
// grava a escolha no cookie NEXT_LOCALE. Aqui só tratamos URLs antigas com
// prefixo (/pt, /en, /en/trabalhos…) para não quebrar links e SEO existentes:
// gravamos o cookie e redirecionamos para o caminho plano.
// Renomeamos as rotas: /trabalhos → /portfolio, /trabalhos/x → /projeto/x,
// /contato → /#contato (o contato agora vive no rodapé).
function renameLegacyPath(pathname: string): string | null {
  if (pathname === "/trabalhos") return "/portfolio";
  const m = pathname.match(/^\/trabalhos\/(.+)$/);
  if (m) return `/projeto/${m[1]}`;
  if (pathname === "/contato") return "/#contato";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  // URLs antigas com prefixo de idioma (/pt, /en/trabalhos…): grava o cookie
  // e cai para o caminho plano, que segue a regra de renomeação abaixo.
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

  // URLs antigas sem prefixo: preserva links e SEO existentes
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
  // ignora api, assets do next e arquivos estáticos (qualquer caminho com ".")
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
