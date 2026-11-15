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
      <div>
        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
          <Activity size={13} />
          AgentGate Management
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Icon size={30} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title} Workspace</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Your {title.toLowerCase()} management workspace is ready for
              backend integration.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
            <span className="text-xs font-semibold text-[var(--warning)]">
              Integration pending
            </span>
          </div>
          <p className="mt-3 text-sm font-medium">
            Backend API is not connected yet.
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            This page is a frontend preview. Live records will appear after API
            integration.
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold">Planned capabilities</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ArrowRight size={15} />
                </span>
                <span className="text-xs font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
