
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-4 py-10 text-[var(--foreground)] transition-colors duration-300">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--primary)]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[var(--accent-blue)]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-[var(--accent-violet)]/5 blur-[100px]" />

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-2.5 text-xs font-semibold text-[var(--muted)] shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] hover:shadow-[var(--shadow-md)] sm:right-7 sm:top-7"
      >
        {theme === "light" ? "☾  Dark mode" : "☀  Light mode"}
      </button>

      {/* Login Card */}
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_25px_80px_rgba(0,0,0,0.12)] transition-all duration-300">

        {/* Top Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent-blue)] to-[var(--accent-violet)]" />

        {/* Card Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--primary)] opacity-[0.06] blur-[80px]" />

        <div className="relative p-7 sm:p-9">

          {/* Brand Header */}
          <div className="mb-8 text-center">

            <div className="group relative mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-3xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary-soft)] to-[var(--surface-elevated)] text-[var(--primary)] shadow-[0_8px_28px_rgba(0,200,150,0.13)] transition-all duration-300 hover:scale-105 hover:rotate-3">
              <div className="absolute inset-0 rounded-3xl bg-[var(--primary)] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-15" />
              <ShieldCheck size={36} strokeWidth={2.1} className="relative" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              AgentGate
            </h1>

            <p className="mt-2 text-[10px] font-bold uppercase tracking-[2.5px] text-[var(--primary)]">
              Security Management Platform
            </p>

            <p className="mt-6 text-sm text-[var(--muted)]">
              Sign in with your administrator credentials.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-bold"
              >
                Administrator Username
              </label>

              <div className="group relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--surface-elevated)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold"
              >
                Password
              </label>

              <div className="group relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 pr-12 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--surface-elevated)] focus:ring-4 focus:ring-[var(--primary)]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-4 py-3 text-xs leading-5 text-[var(--danger)]"
              >
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--primary)] to-[#0AA982] px-4 text-sm font-bold text-white shadow-[0_8px_22px_rgba(0,200,150,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,200,150,0.28)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

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

          {/* Security Information */}
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/[0.06] p-4 transition-colors hover:border-[var(--accent-blue)]/35">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
              <LockKeyhole size={17} />
            </div>

            <div>
              <p className="text-xs font-bold text-[var(--accent-blue)]">
                Secure administrator access
              </p>

              <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
                Your credentials are held only in memory and are not saved in
                browser storage.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-7 border-t border-[var(--border)] pt-5 text-center">
            <p className="text-[10px] text-[var(--muted)]">
              AgentGate Security Platform · Secure Admin Access
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}




