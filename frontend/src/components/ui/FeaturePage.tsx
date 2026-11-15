
import {
  Activity,
  ArrowRight,
  Bot,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Wrench,
  Settings,
} from "lucide-react";

const icons = {
  agents: Bot,
  tools: Wrench,
  policies: ShieldCheck,
  approvals: ClipboardCheck,
  audit: FileText,
  settings: Settings,
};

type FeaturePageProps = {
  title: string;
  description: string;
  section: keyof typeof icons;
  features: string[];
};

export default function FeaturePage({
  title,
  description,
  section,
  features,
}: FeaturePageProps) {
  const Icon = icons[section];

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Page Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
          <Activity size={13} className="animate-pulse" />
          AgentGate Management
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      {/* Main Workspace Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:border-[var(--primary)]/25 hover:shadow-[var(--shadow-md)]">

        {/* Decorative Background */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--primary)] opacity-[0.06] blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[var(--accent-blue)] opacity-[0.04] blur-[90px]" />

        <div className="relative p-5 sm:p-8">

          {/* Workspace Introduction */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="group relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary-soft)] to-[var(--surface-elevated)] text-[var(--primary)] shadow-[0_5px_20px_rgba(0,200,150,0.10)] transition-all duration-300 hover:scale-105 hover:rotate-3">
              <div className="absolute inset-0 rounded-2xl bg-[var(--primary)] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />
              <Icon size={30} strokeWidth={1.8} className="relative" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {title} Workspace
                </h2>

                <span className="rounded-md border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--primary)]">
                  Workspace
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Your {title.toLowerCase()} management workspace is ready for
                backend integration.
              </p>
            </div>
          </div>

          {/* Integration Status */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-dashed border-[var(--warning)]/35 bg-gradient-to-br from-[var(--warning)]/[0.07] to-[var(--surface-elevated)] p-5 sm:p-6">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--warning)] opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--warning)] shadow-[0_0_8px_var(--warning)]" />
                </span>

                <span className="text-xs font-bold text-[var(--warning)]">
                  Integration pending
                </span>
              </div>

              <span className="rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--warning)]">
                Development
              </span>
            </div>

            <h3 className="mt-4 text-sm font-bold">
              Backend API is not connected yet.
            </h3>

            <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--muted)]">
              This page is a frontend preview. Live records will appear after
              API integration.
            </p>
          </div>

          {/* Planned Capabilities */}
          <div className="mt-9">

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Planned capabilities
                </h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Features planned for this workspace
                </p>
              </div>

              <span className="rounded-lg border border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--accent-blue)]">
                {features.length} Features
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {features.map((feature) => (
                <div
                  key={feature}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:bg-[var(--surface-hover)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <ArrowRight size={16} />
                  </div>

                  <span className="text-xs font-semibold leading-5 text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                    {feature}
                  </span>

                  <div className="ml-auto shrink-0 text-[var(--muted)] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



