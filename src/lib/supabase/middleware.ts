import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPainelRoute = pathname.startsWith("/painel");
  const isAdminRoute = pathname.startsWith("/admin");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail closed on protected routes, fail open (serve the public page) everywhere
  // else, rather than throwing a 500 for the whole site when Supabase env vars
  // are missing or the Auth server is briefly unreachable from this edge runtime.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars ausentes no middleware");
    if (isPainelRoute || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // IMPORTANT: always revalidate via getUser() (hits Supabase Auth server),
    // never trust the session cookie payload alone for authorization decisions.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if ((isPainelRoute || isAdminRoute) && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin" || profile.status !== "active") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error("Erro no middleware ao consultar o Supabase", err);
    if (isPainelRoute || isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
}
