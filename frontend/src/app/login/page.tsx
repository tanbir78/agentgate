"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username.trim(), password);
      setPassword("");
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--primary)]/10 blur-3xl" />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-6 top-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--primary)]"
      >
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>

      <section className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <ShieldCheck size={34} strokeWidth={2.2} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">AgentGate</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-[var(--primary)]">
            Security Management Platform
          </p>
          <p className="mt-5 text-sm text-[var(--muted)]">
            Sign in with your administrator credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-xs font-semibold"
            >
              Administrator Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-semibold"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 pr-12 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-xs text-[var(--danger)]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/15 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                <LockKeyhole size={16} />
                Sign in securely
              </>
            )}
          </button>
        </form>

        <div className="mt-7 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <LockKeyhole
            size={17}
            className="mt-0.5 shrink-0 text-[var(--primary)]"
          />
          <p className="text-[11px] leading-5 text-[var(--muted)]">
            Protected administrator access. Your credentials are held only
            in memory and are not saved in browser storage.
          </p>
        </div>

        <p className="mt-7 text-center text-[10px] text-[var(--muted)]">
          AgentGate Security Platform · Secure Admin Access
        </p>
      </section>
    </main>
  );
}
