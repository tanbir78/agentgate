
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  Command,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Wrench,
  X,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Tools Registry", href: "/tools", icon: Wrench },
  { label: "Policies", href: "/policies", icon: ShieldCheck },
  { label: "Approvals", href: "/approvals", icon: ClipboardCheck },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText },
];

function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-full w-[258px] shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] shadow-[8px_0_30px_rgba(0,0,0,0.04)]">

      {/* Sidebar decorative glow */}
      <div className="pointer-events-none absolute -left-20 top-20 h-48 w-48 rounded-full bg-[var(--primary)] opacity-[0.05] blur-[90px]" />

      {/* Brand */}
      <div className="relative flex h-[76px] items-center gap-3 border-b border-[var(--border)] px-6">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] shadow-[0_4px_18px_rgba(0,200,150,0.12)] transition-all duration-300 hover:scale-105 hover:rotate-3">
          <ShieldCheck size={23} strokeWidth={2.3} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            AgentGate
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--muted)]">
            Security Platform
          </p>
        </div>

        {mobile && (
          <button
            onClick={onNavigate}
            className="ml-auto rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] transition-all hover:border-[var(--danger)]/30 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      {/* Workspace Navigation */}
      <div className="relative px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--muted)]">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-[13px] font-medium transition-all duration-300 ${
                  active
                    ? "border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary-soft)] to-transparent text-[var(--primary)] shadow-[0_3px_14px_rgba(0,200,150,0.07)]"
                    : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                )}

                <Icon
                  size={18}
                  className={`shrink-0 transition-all duration-300 ${
                    active
                      ? "text-[var(--primary)]"
                      : "group-hover:scale-110 group-hover:text-[var(--primary)]"
                  }`}
                />

                <span>{item.label}</span>

                {item.label === "Approvals" && (
                  <span className="ml-auto rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--warning)] transition-colors group-hover:bg-[var(--warning)]/20">
                    4
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Navigation */}
      <div className="relative mt-8 px-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--muted)]">
          System
        </p>

        <Link
          href="/settings"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-[13px] font-medium text-[var(--muted)] transition-all duration-300 hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        >
          <Settings
            size={18}
            className="transition-transform duration-300 group-hover:rotate-45 group-hover:text-[var(--primary)]"
          />
          Settings
        </Link>

        <Link
  href="/help-support"
  className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-[13px] font-medium transition-all duration-300 ${
    pathname === "/help-support"
      ? "border-[var(--primary)]/30 bg-[var(--primary-soft)] text-[var(--primary)]"
      : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
  }`}
>
  <CircleHelp
    size={18}
    className="transition-transform duration-300 group-hover:scale-110"
  />
  Help & Support
</Link>
      </div>

      {/* Bottom Section */}
      <div className="relative mt-auto p-4">
        <div className="group relative overflow-hidden rounded-2xl border border-[var(--success)]/20 bg-gradient-to-br from-[var(--success)]/[0.09] via-[var(--surface-elevated)] to-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--success)]/35 hover:shadow-[var(--shadow-md)]">

          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--success)] opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-15" />

          <div className="relative mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success)] shadow-[0_0_9px_var(--success)]" />
            </span>

            <span className="text-xs font-semibold">
              Platform status
            </span>

            <span className="ml-auto rounded-md border border-[var(--success)]/20 bg-[var(--success)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--success)]">
              ACTIVE
            </span>
          </div>

          <p className="relative text-[11px] text-[var(--muted)]">
            Security monitoring dashboard
          </p>

          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[var(--success)] to-[var(--primary)] shadow-[0_0_10px_var(--success)]" />
          </div>

          <p className="relative mt-2 text-[10px] text-[var(--muted)]">
            Demo interface · API not connected
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl px-2 py-2 text-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]">
          <Command size={13} className="text-[var(--primary)]" />
          <span>AgentGate Platform</span>
          <span className="ml-auto rounded-md border border-[var(--border)] px-1.5 py-0.5 font-medium">
            v0.1.0
          </span>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="flex min-h-screen">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation overlay"
            />

            <div className="relative z-10 animate-in slide-in-from-left duration-300">
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* Header */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.025)] backdrop-blur-xl transition-colors duration-300 sm:px-7">

            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] transition-all hover:border-[var(--primary)]/30 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>

              <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
                <span className="transition-colors hover:text-[var(--foreground)]">
                  Workspace
                </span>

                <span className="text-[var(--border)]">/</span>

                <span className="rounded-lg bg-[var(--primary-soft)] px-2.5 py-1 font-semibold text-[var(--primary)]">
                  {pathname === "/help-support"
                    ? "Help & Support"
                    : navigation.find((item) => item.href === pathname)?.label ??
                      "Settings"}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:hidden">
                <ShieldCheck size={20} className="text-[var(--primary)]" />
                <span className="font-bold tracking-tight">
                  AgentGate
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Search */}
              <button className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-left text-xs text-[var(--muted)] transition-all duration-300 hover:border-[var(--primary)]/50 hover:bg-[var(--surface-elevated)] hover:shadow-[0_0_0_3px_var(--primary-soft)] md:flex">
                <Search size={15} className="text-[var(--muted)]" />
                Search anything...

                <span className="ml-auto rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px]">
                  /
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] hover:shadow-[var(--shadow-glow)]"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun size={18} className="transition-transform duration-500 group-hover:rotate-45" />
                ) : (
                  <Moon size={18} className="transition-transform duration-500 group-hover:-rotate-12" />
                )}
              </button>

              {/* Notifications */}
              <button
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-blue)]/40 hover:bg-[var(--accent-blue)]/10 hover:text-[var(--accent-blue)]"
                aria-label="Notifications"
              >
                <Bell size={18} className="transition-transform duration-300 group-hover:rotate-12" />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--surface)] bg-[var(--danger)] shadow-[0_0_7px_var(--danger)]" />
              </button>

              <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />

              {/* Administrator Profile */}
              <button className="group flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-all duration-300 hover:border-[var(--border)] hover:bg-[var(--surface-hover)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary-soft)] to-[var(--surface-elevated)] text-xs font-bold text-[var(--primary)] shadow-[0_3px_12px_rgba(0,200,150,0.08)] transition-transform duration-300 group-hover:scale-105">
                  TH
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold">
                    Administrator
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">
                    Admin account
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className="hidden text-[var(--muted)] transition-transform duration-300 group-hover:translate-y-0.5 sm:block"
                />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 transition-colors duration-300 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-[var(--border)] bg-[var(--surface)]/40 px-6 py-4 text-center text-[10px] text-[var(--muted)]">
            AgentGate Security Platform · Development Preview
          </footer>
        </div>
      </div>
    </div>
  );
}





