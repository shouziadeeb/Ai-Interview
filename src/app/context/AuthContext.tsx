"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";

const AUTH_SYNC_KEY = "myinterview-auth-sync";
const AUTH_CHANNEL = "myinterview-auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function publishAuthSync(userId: string | null, event: string) {
  try {
    window.localStorage.setItem(
      AUTH_SYNC_KEY,
      JSON.stringify({ userId, event, at: Date.now() })
    );
  } catch {
    // Ignore quota / private-mode failures.
  }

  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage({ type: "auth", userId, event, at: Date.now() });
    channel.close();
  } catch {
    // BroadcastChannel unsupported — storage + focus refresh still help.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser();
      setUser(nextUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = createClient();

      const init = async () => {
        const [{ data: userData }, { data: sessionData }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.getSession(),
        ]);
        if (!mounted) return;
        setUser(userData.user ?? sessionData.session?.user ?? null);
        setLoading(false);
      };

      void init();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        setLoading(false);
        publishAuthSync(nextUser?.id ?? null, event);
      });

      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel(AUTH_CHANNEL);
        channel.onmessage = (message) => {
          if (message?.data?.type === "auth") {
            void refreshUser();
          }
        };
      } catch {
        channel = null;
      }

      const onStorage = (event: StorageEvent) => {
        if (event.key === AUTH_SYNC_KEY) {
          void refreshUser();
        }
      };

      const onFocus = () => {
        void refreshUser();
      };

      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          void refreshUser();
        }
      };

      window.addEventListener("storage", onStorage);
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        mounted = false;
        subscription.unsubscribe();
        channel?.close();
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    } catch {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    publishAuthSync(null, "SIGNED_OUT");
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOut, refreshUser }),
    [user, loading, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
