"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock,
  Monitor,
  Moon,
  Sun,
  ShieldCheck,
  UserRound,
  LogOut,
  RefreshCw,
  Server,
  LockKeyhole,
  Palette,
  Info,
  Loader2,
} from "lucide-react";

import { useTheme } from "@/components/layout/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";

type ApiStatus = "checking" | "connected" | "error";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
        </div>
      </div>

      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {description}
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsManagement() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, apiFetch, logout } = useAuth();

  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [checkedAt, setCheckedAt] = useState("");
  const [apiError, setApiError] = useState("");
  const [checking, setChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setApiStatus("checking");
    setApiError("");

    try {
      const response = await apiFetch("/api/v1/csrf");

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result = await response.json();

      if (!result?.token || !result?.headerName) {
        throw new Error("Invalid API response.");
      }

      setApiStatus("connected");
      setCheckedAt(new Date().toLocaleString());
    } catch (error) {
      setApiStatus("error");
      setApiError(
        error instanceof Error ? error.message : "Connection failed."
      );
    } finally {
      setChecking(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (isAuthenticated) {
      void checkConnection();
    } else {
      setApiStatus("error");
      setApiError("No authenticated session.");
      setChecking(false);
    }
  }, [isAuthenticated, checkConnection]);

  const isDark = theme === "dark";

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            <Activity size={13} />
            AgentGate Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage your AgentGate preferences and platform configuration.
          </p>
        </div>

        <button
          onClick={() => void checkConnection()}
          disabled={checking || !isAuthenticated}
          className={`${buttonClass} border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]`}
        >
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
          Refresh status
        </button>
      </div>

      {/* Appearance */}
      <SectionCard
        icon={Palette}
        title="Appearance settings"
        description="Customize how AgentGate looks on your device."
      >
        <SettingRow
          title="Interface theme"
          description="Choose between light and dark appearance. Your selection is saved in this browser."
        >
          <div className="flex rounded-xl border border-[var(--border)] bg-[var(--background)] p-1">
            <button
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              aria-pressed={!isDark}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                !isDark
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Sun size={15} />
              Light
            </button>

            <button
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              aria-pressed={isDark}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                isDark
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Moon size={15} />
              Dark
            </button>
          </div>
        </SettingRow>

        <SettingRow
          title="Current appearance"
          description="Your active interface appearance."
        >
          <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-semibold">
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
            {isDark ? "Dark mode" : "Light mode"}
          </span>
        </SettingRow>
      </SectionCard>

      {/* Account */}
      <SectionCard
        icon={UserRound}
        title="Account preferences"
        description="Review your current administrator session."
      >
        <SettingRow
          title="Authentication status"
          description="Current frontend authentication state."
        >
          <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
            isAuthenticated
              ? "bg-[var(--primary-soft)] text-[var(--success)]"
              : "bg-[var(--danger)]/10 text-[var(--danger)]"
          }`}>
            {isAuthenticated ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
            {isAuthenticated ? "Authenticated" : "Not authenticated"}
          </span>
        </SettingRow>

        <SettingRow
          title="Session management"
          description="Sign out of the current AgentGate administrator session."
        >
          <button
            onClick={logout}
            disabled={!isAuthenticated}
            className={`${buttonClass} border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)]/15`}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </SettingRow>
      </SectionCard>

      {/* Security */}
      <SectionCard
        icon={ShieldCheck}
        title="Security configuration"
        description="Review the current security connection status."
      >
        <SettingRow
          title="Authenticated API connection"
          description="Checks the protected CSRF endpoint using your current administrator credentials."
        >
          <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
            apiStatus === "connected"
              ? "bg-[var(--primary-soft)] text-[var(--success)]"
              : apiStatus === "error"
                ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                : "bg-[var(--soft-orange)] text-[var(--warning)]"
          }`}>
            {apiStatus === "checking" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : apiStatus === "connected" ? (
              <CheckCircle2 size={14} />
            ) : (
              <CircleAlert size={14} />
            )}

            {apiStatus === "checking"
              ? "Checking"
              : apiStatus === "connected"
                ? "Connected"
                : "Unavailable"}
          </span>
        </SettingRow>

        {apiError && (
          <div className="rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/10 p-3 text-xs text-[var(--danger)]">
            {apiError}
          </div>
        )}

        <SettingRow
          title="Last connection check"
          description="Time of the most recent successful API check."
        >
          <span className="inline-flex items-center gap-2 text-xs text-[var(--muted)]">
            <Clock size={14} />
            {checkedAt || "Not available"}
          </span>
        </SettingRow>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-4">
          <div className="flex items-start gap-3">
            <LockKeyhole size={18} className="mt-0.5 text-[var(--primary)]" />
            <div>
              <p className="text-sm font-semibold">Protected administrator access</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                API requests use the existing authenticated session and CSRF
                protection for state-changing operations. Security policies
                are managed separately in the Policies workspace.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Platform information */}
      <SectionCard
        icon={Server}
        title="Platform information"
        description="Application and backend connectivity information."
      >
        <SettingRow
          title="Application"
          description="AgentGate Security Platform."
        >
          <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-semibold">
            AgentGate
          </span>
        </SettingRow>

        <SettingRow
          title="Backend API"
          description="Authenticated API endpoint used by this dashboard."
        >
          <span className="font-mono text-xs text-[var(--muted)]">
            /api/v1
          </span>
        </SettingRow>

        <SettingRow
          title="API availability"
          description="Live result from the authenticated connection check."
        >
          <span className={`text-xs font-bold ${
            apiStatus === "connected"
              ? "text-[var(--success)]"
              : apiStatus === "error"
                ? "text-[var(--danger)]"
                : "text-[var(--warning)]"
          }`}>
            {apiStatus === "connected"
              ? "Online"
              : apiStatus === "error"
                ? "Unavailable"
                : "Checking..."}
          </span>
        </SettingRow>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 text-[var(--primary)]" />
            <p className="text-xs leading-5 text-[var(--muted)]">
              Persistent account preferences, password management and
              editable security configuration require dedicated backend
              settings endpoints. They are not exposed by the current API.
            </p>
          </div>
        </div>
      </SectionCard>

      <p className="pb-3 text-center text-[10px] text-[var(--muted)]">
        AgentGate · Settings and platform preferences
      </p>
    </div>
  );
}