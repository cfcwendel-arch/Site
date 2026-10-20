"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthState = { loggedIn: boolean; dashboardHref: string };

const AuthStateContext = createContext<AuthState>({ loggedIn: false, dashboardHref: "/painel" });

/**
 * Estado de login lido no navegador (sessão local, sem ida ao servidor), para que as
 * páginas públicas possam ser servidas prontas do cache, iguais para todos os visitantes.
 */
export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ loggedIn: false, dashboardHref: "/painel" });

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setState({ loggedIn: false, dashboardHref: "/painel" });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setState({ loggedIn: true, dashboardHref: profile?.role === "admin" ? "/admin" : "/painel" });
      }
    }

    load();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") load();
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthStateContext.Provider value={state}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthStateContext);
}
