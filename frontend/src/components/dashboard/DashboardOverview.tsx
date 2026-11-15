
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
    accent: "#10D6A0",
    positive: true,
  },
  {
    title: "Registered Tools",
    value: "64",
    change: "+8.2%",
    description: "Compared to last month",
    icon: Wrench,
    accent: "#60A5FA",
    positive: true,
  },
  {
    title: "Active Policies",
    value: "32",
    change: "+4.3%",
    description: "Compared to last month",
    icon: ShieldCheck,
    accent: "#A78BFA",
    positive: true,
  },
  {
    title: "Pending Approvals",
    value: "04",
    change: "Needs review",
    description: "Awaiting administrator",
    icon: Clock3,
    accent: "#FB923C",
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
      <h2 className="text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {subtitle}
      </p>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />

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

        <div className="flex items-center gap-2 self-start rounded-xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-2 text-xs font-medium text-[var(--primary)] sm:self-auto">
          <Activity size={15} />
          Development preview
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-md)]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${stat.accent}12, transparent 65%)`,
              }}
            >
              {/* Top accent */}
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-90"
                style={{
                  background: `linear-gradient(90deg, ${stat.accent}, transparent)`,
                }}
              />

              {/* Decorative glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-25"
                style={{ backgroundColor: stat.accent }}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    backgroundColor: `${stat.accent}18`,
                    borderColor: `${stat.accent}30`,
                    color: stat.accent,
                    boxShadow: `0 4px 18px ${stat.accent}15`,
                  }}
                >
                  <Icon size={21} />
                </div>

                {stat.positive ? (
                  <span
                    className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${stat.accent}15`,
                      borderColor: `${stat.accent}25`,
                      color: stat.accent,
                    }}
                  >
                    <ArrowUpRight size={13} />
                    {stat.change}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-lg border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-2 py-1 text-[10px] font-bold text-[var(--warning)]">
                    <Clock3 size={12} />
                    {stat.change}
                  </span>
                )}
              </div>

              <p className="relative mt-5 text-xs font-medium text-[var(--muted)]">
                {stat.title}
              </p>

              <h3 className="relative mt-1 text-3xl font-bold tracking-tight">
                {stat.value}
              </h3>

              <p className="relative mt-2 text-[10px] text-[var(--muted)]">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Security Activity + Platform Health */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Security Chart */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] sm:p-6 xl:col-span-2">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle
              title="Security activity"
              subtitle="Illustrative tool decisions over the last 7 days"
            />

            <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_7px_var(--primary)]" />
                Allowed
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--danger)] shadow-[0_0_7px_var(--danger)]" />
                Denied
              </span>
            </div>
          </div>

          <div className="mt-7 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient
                    id="allowedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10D6A0"
                      stopOpacity={0.32}
                    />
                    <stop
                      offset="95%"
                      stopColor="#10D6A0"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="deniedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#FB7185"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="#FB7185"
                      stopOpacity={0}
                    />
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
                    boxShadow: "var(--shadow-md)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="allowed"
                  name="Allowed"
                  stroke="#10D6A0"
                  strokeWidth={2.5}
                  fill="url(#allowedGradient)"
                  activeDot={{
                    r: 5,
                    fill: "#10D6A0",
                    stroke: "var(--surface)",
                    strokeWidth: 2,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="denied"
                  name="Denied"
                  stroke="#FB7185"
                  strokeWidth={2}
                  fill="url(#deniedGradient)"
                  activeDot={{
                    r: 5,
                    fill: "#FB7185",
                    stroke: "var(--surface)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Health */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] sm:p-6">

          <SectionTitle
            title="Platform health"
            subtitle="Illustrative service status"
          />

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--success)]/25 bg-[var(--success)]/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/15 text-[var(--success)]">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--success)]">
                All services operational
              </p>

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
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" />

                  <span className="text-xs font-medium">
                    {service.name}
                  </span>
                </div>

                <span className="text-[10px] text-[var(--muted)]">
                  {service.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[var(--accent-blue)]/20 bg-[var(--soft-blue)] p-3 transition-colors hover:border-[var(--accent-blue)]/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-blue)]">
              <Zap size={15} />
              Integration status
            </div>

            <p className="mt-2 text-[11px] text-[var(--muted)]">
              Backend API integration is the next development phase.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <SectionTitle
            title="Recent security activity"
            subtitle="Sample events for dashboard layout preview"
          />

          <button className="rounded-lg px-3 py-2 text-xs font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary-soft)]">
            View all activity
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">

            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
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
                  className="border-b border-[var(--border)]/70 transition-colors duration-200 last:border-0 hover:bg-[var(--surface-hover)]"
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
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold ${
                        activity.status === "ALLOWED"
                          ? "border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)]"
                          : activity.status === "DENIED"
                            ? "border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)]"
                            : "border-[var(--warning)]/20 bg-[var(--warning)]/10 text-[var(--warning)]"
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

        <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-[10px] text-[var(--muted)] sm:px-6">
          <span>
            Sample dashboard data · Not connected to backend
          </span>

          <span className="flex items-center gap-1">
            <ArrowDownRight size={12} />
            Preview only
          </span>
        </div>
      </section>
    </div>
  );
}



