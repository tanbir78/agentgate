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
    <aside className="flex h-full w-[258px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex h-[76px] items-center gap-3 border-b border-[var(--border)] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <ShieldCheck size={23} strokeWidth={2.3} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">AgentGate</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--muted)]">
            Security Platform
          </p>
        </div>
        {mobile && (
          <button
            onClick={onNavigate}
            className="ml-auto rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--muted)]">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "Approvals" && (
                  <span className="ml-auto rounded-md bg-[var(--warning)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--warning)]">
                    4
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 px-4">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.8px] text-[var(--muted)]">
          System
        </p>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        >
          <Settings size={18} />
          Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]">
          <CircleHelp size={18} />
          Help & Support
        </button>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
            </span>
            <span className="text-xs font-semibold">Platform status</span>
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Security monitoring dashboard
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full w-full rounded-full bg-[var(--primary)]" />
          </div>
          <p className="mt-2 text-[10px] text-[var(--muted)]">
            Demo interface · API not connected
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-[var(--muted)]">
          <Command size={13} />
          <span>AgentGate Platform</span>
          <span className="ml-auto">v0.1.0</span>
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation overlay"
            />
            <div className="relative z-10">
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)] lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>
              <div className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex">
                <span>Workspace</span>
                <span>/</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {navigation.find((item) => item.href === pathname)?.label ??
                    "Settings"}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:hidden">
                <ShieldCheck size={20} className="text-[var(--primary)]" />
                <span className="font-bold">AgentGate</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-left text-xs text-[var(--muted)] transition hover:border-[var(--primary)] md:flex">
                <Search size={15} />
                Search anything...
                <span className="ml-auto rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px]">
                  /
                </span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-hover)]"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--surface)] bg-[var(--danger)]" />
              </button>

              <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />

              <button className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[var(--surface-hover)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                  TH
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold">Administrator</p>
                  <p className="text-[10px] text-[var(--muted)]">Admin account</p>
                </div>
                <ChevronDown size={14} className="hidden text-[var(--muted)] sm:block" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

          <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-[10px] text-[var(--muted)]">
            AgentGate Security Platform · Development Preview
          </footer>
        </div>
      </div>
    </div>
  );
}



