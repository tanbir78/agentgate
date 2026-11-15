"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShieldX,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const stats = [
  {
    title: "Registered Agents",
    value: "128",
    change: "+12.5%",
    description: "Compared to last month",
    icon: Bot,
    positive: true,
  },
  {
    title: "Registered Tools",
    value: "64",
    change: "+8.2%",
    description: "Compared to last month",
    icon: Wrench,
    positive: true,
  },
  {
    title: "Active Policies",
    value: "32",
    change: "+4.3%",
    description: "Compared to last month",
    icon: ShieldCheck,
    positive: true,
  },
  {
    title: "Pending Approvals",
    value: "04",
    change: "Needs review",
    description: "Awaiting administrator",
    icon: Clock3,
    positive: false,
  },
];

const activityData = [
  { day: "Mon", allowed: 340, denied: 48 },
  { day: "Tue", allowed: 420, denied: 65 },
  { day: "Wed", allowed: 380, denied: 42 },
  { day: "Thu", allowed: 510, denied: 80 },
  { day: "Fri", allowed: 460, denied: 58 },
  { day: "Sat", allowed: 580, denied: 72 },
  { day: "Sun", allowed: 530, denied: 50 },
];

const activities = [
  {
    name: "Agent authentication",
    detail: "demo-agent · Identity verification",
    time: "2 minutes ago",
    status: "ALLOWED",
  },
  {
    name: "Tool execution blocked",
    detail: "external-tool · Policy violation",
    time: "12 minutes ago",
    status: "DENIED",
  },
  {
    name: "Approval requested",
    detail: "data-agent · Sensitive operation",
    time: "28 minutes ago",
    status: "PENDING",
  },
  {
    name: "Policy evaluation",
    detail: "report-agent · Policy check",
    time: "46 minutes ago",
    status: "ALLOWED",
  },
];

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtitle}</p>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
              Security overview
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good morning, Administrator
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Here&apos;s what&apos;s happening across your AgentGate platform.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)] sm:self-auto">
          <Activity size={15} className="text-[var(--primary)]" />
          Development preview
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon size={21} />
                </div>
                {stat.positive ? (
                  <span className="flex items-center gap-1 rounded-lg bg-[var(--primary-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--primary)]">
                    <ArrowUpRight size={13} />
                    {stat.change}
                  </span>
                ) : (
                  <span className="rounded-lg bg-[var(--warning)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--warning)]">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="mt-5 text-xs font-medium text-[var(--muted)]">
                {stat.title}
              </p>
              <h3 className="mt-1 text-3xl font-bold tracking-tight">
                {stat.value}
              </h3>
              <p className="mt-2 text-[10px] text-[var(--muted)]">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle
              title="Security activity"
              subtitle="Illustrative tool decisions over the last 7 days"
            />
            <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Allowed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--danger)]" />
                Denied
              </span>
            </div>
          </div>

          <div className="mt-7 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="allowedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="deniedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                />
                <YAxis
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="allowed"
                  name="Allowed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#allowedGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="denied"
                  name="Denied"
                  stroke="#f87171"
                  strokeWidth={2}
                  fill="url(#deniedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <SectionTitle
            title="Platform health"
            subtitle="Illustrative service status"
          />

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold">All services operational</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Demo status · Not live monitoring
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {[
              { name: "API Gateway", value: "Demo status" },
              { name: "Authentication", value: "Demo status" },
              { name: "Policy Engine", value: "Demo status" },
              { name: "Audit Service", value: "Demo status" },
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                  <span className="text-xs font-medium">{service.name}</span>
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  {service.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Zap size={15} className="text-[var(--primary)]" />
              Integration status
            </div>
            <p className="mt-2 text-[11px] text-[var(--muted)]">
              Backend API integration is the next development phase.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <SectionTitle
            title="Recent security activity"
            subtitle="Sample events for dashboard layout preview"
          />
          <button className="text-xs font-semibold text-[var(--primary)] hover:underline">
            View all activity
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <th className="px-6 py-4 font-semibold">Event</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Time</th>
                <th className="px-6 py-4 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr
                  key={activity.name}
                  className="border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--surface-hover)]"
                >
                  <td className="px-6 py-4 text-xs font-semibold">
                    {activity.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--muted)]">
                    {activity.detail}
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--muted)]">
                    {activity.time}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                        activity.status === "ALLOWED"
                          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                          : activity.status === "DENIED"
                            ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                            : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      }`}
                    >
                      {activity.status === "ALLOWED" ? (
                        <CheckCircle2 size={12} />
                      ) : activity.status === "DENIED" ? (
                        <ShieldX size={12} />
                      ) : (
                        <Clock3 size={12} />
                      )}
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-[10px] text-[var(--muted)] sm:px-6">
          <span>Sample dashboard data · Not connected to backend</span>
          <span className="flex items-center gap-1">
            <ArrowDownRight size={12} />
            Preview only
          </span>
        </div>
      </section>
    </div>
  );
}
