"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import SiteShell from "../../components/SiteShell";
import { createClient } from "../../lib/supabase/client";

type Mode = "signin" | "signup";

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.5H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.5l3.2 2.4C8 7.5 9.8 6.2 12 6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.4 2.2 5.3 4.3 3.9 7.5z"
      />
      <path
        fill="#4A90E2"
        d="M12 20.6c2.5 0 4.6-.8 6.1-2.2l-2.9-2.3c-.8.6-1.9 1-3.2 1-3.1 0-5.7-2-6.6-4.7l-3.2 2.5c1.5 3.1 4.6 5.7 9.8 5.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 12.4c0-.7.1-1.3.3-1.9L2.5 8C1.9 9.1 1.6 10.3 1.6 11.4c0 1.2.3 2.4.9 3.5l3.2-2.5z"
      />
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/interview";
  const queryError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(queryError || "");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const title = useMemo(
    () => (mode === "signin" ? "Welcome back" : "Create your account"),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === "signin"
        ? "Sign in with Google or email to continue practicing."
        : "Sign up with Google or email to save your interview progress.",
    [mode]
  );

  const handleEmailAuth = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.push(nextPath);
          router.refresh();
          return;
        }

        setMessage(
          "Check your email to confirm your account, then sign in."
        );
        setMode("signin");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        router.push(nextPath);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google sign-in failed. Try again."
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="panel mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
        MyInterview
      </p>
      <h1 className="brand-font mt-2 text-2xl font-semibold text-[var(--ink)]">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {googleLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--line)]" />
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          or email
        </span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-[var(--muted)]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium text-[var(--muted)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)]"
            placeholder="At least 6 characters"
          />
        </div>

        {error ? (
          <p className="text-sm text-[var(--danger)]">{error}</p>
        ) : null}
        {message ? (
          <p className="text-sm text-[var(--success)]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setMessage("");
          }}
          className="font-semibold text-[var(--brand)] hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--brand)]">
          Back to home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SiteShell mainClassName="px-4 py-10 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="panel mx-auto max-w-md rounded-2xl p-8 text-center text-sm text-[var(--muted)]">
            Loading…
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </SiteShell>
  );
}
