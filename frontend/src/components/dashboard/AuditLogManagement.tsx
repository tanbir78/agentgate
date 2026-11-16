"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity, RefreshCw, Search, FileText, Eye, X,
  CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle,
  Loader2, ChevronLeft, ChevronRight, CalendarClock,
  UserRound, Bot, Wrench, Hash, Filter, ListFilter
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type AuditEvent = {
  id: string;
  occurredAt: string;
  actorId: string | null;
  agentId: string | null;
  toolId: string | null;
  decision: string;
  ruleId: string | null;
  explanation: string | null;
};

type AuditPage = {
  content: AuditEvent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function shortId(value: string | null) {
  if (!value) return "—";
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function decisionStyle(decision: string) {
  const value = decision.toUpperCase();

  if (value.includes("APPROV") || value === "ALLOW" || value === "ALLOWED") {
    return "border border-[var(--success)]/20 bg-[var(--primary-soft)] text-[var(--success)]";
  }

  if (
    value.includes("REJECT") ||
    value.includes("DENY") ||
    value.includes("BLOCK")
  ) {
    return "border border-[var(--danger)]/20 bg-[var(--soft-rose)] text-[var(--danger)]";
  }

  if (value.includes("EXPIRED")) {
    return "border border-[var(--warning)]/20 bg-[var(--soft-orange)] text-[var(--warning)]";
  }

  return "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)]";
}

function DecisionIcon({ decision }: { decision: string }) {
  const value = decision.toUpperCase();

  if (value.includes("APPROV") || value === "ALLOW" || value === "ALLOWED") {
    return <CheckCircle2 size={15} />;
  }

  if (
    value.includes("REJECT") ||
    value.includes("DENY") ||
    value.includes("BLOCK")
  ) {
    return <XCircle size={15} />;
  }

  return <Activity size={15} />;
}

export default function AuditLogManagement() {
  const { apiFetch } = useAuth();

  const [pageData, setPageData] = useState<AuditPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("ALL");
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const loadEvents = useCallback(async (pageNumber = page) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        size: String(pageSize),
        sort: "occurredAt,desc",
      });

      const response = await apiFetch(`/api/v1/audit-logs?${params}`);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          body || `Unable to load audit events (${response.status}).`
        );
      }

      const result: AuditPage = await response.json();

      if (!result || !Array.isArray(result.content)) {
        throw new Error("The audit API returned an unexpected response.");
      }

      setPageData(result);
      setPage(result.number ?? pageNumber);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page, pageSize]);

  useEffect(() => {
    void loadEvents(page);
  }, [loadEvents, page]);

  const events = pageData?.content ?? [];

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesDecision =
        decisionFilter === "ALL" ||
        event.decision.toUpperCase() === decisionFilter;

      const matchesSearch =
        !query ||
        [
          event.id,
          event.actorId ?? "",
          event.agentId ?? "",
          event.toolId ?? "",
          event.ruleId ?? "",
          event.decision,
          event.explanation ?? "",
        ].some((value) => value.toLowerCase().includes(query));

      return matchesDecision && matchesSearch;
    });
  }, [events, search, decisionFilter]);

  const approvedOnPage = events.filter((event) =>
    event.decision.toUpperCase().includes("APPROV")
  ).length;

  const rejectedOnPage = events.filter((event) => {
    const value = event.decision.toUpperCase();
    return value.includes("REJECT") || value.includes("DENY") || value.includes("BLOCK");
  }).length;

  const otherOnPage = events.length - approvedOnPage - rejectedOnPage;

  const statCards = [
    {
      label: "Total audit events",
      value: pageData?.totalElements ?? 0,
      icon: FileText,
      color: "var(--primary)",
    },
    {
      label: "Approved on this page",
      value: approvedOnPage,
      icon: CheckCircle2,
      color: "var(--success)",
    },
    {
      label: "Rejected on this page",
      value: rejectedOnPage,
      icon: XCircle,
      color: "var(--danger)",
    },
    {
      label: "Other events on this page",
      value: otherOnPage,
      icon: Activity,
      color: "var(--warning)",
    },
  ];

  const totalPages = pageData?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            <Activity size={13} />
            AgentGate Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Review security decisions and recorded system events.
          </p>
        </div>

        <button
          onClick={() => void loadEvents(page)}
          disabled={loading}
          className={`${buttonClass} border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">
          <AlertCircle size={17} />
          <span className="break-all">{error}</span>
          <button className="ml-auto" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  color: item.color,
                  background: "var(--primary-soft)",
                }}
              >
                <Icon size={20} />
              </div>

              <p className="text-xs font-medium text-[var(--muted)]">
                {item.label}
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {loading ? "—" : item.value}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {item.label === "Total audit events"
                  ? "Across all pages"
                  : "Current page only"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Event history */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]/60 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">Security event history</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Latest recorded events from the audit database.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search audit records..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <select
                value={decisionFilter}
                onChange={(event) => setDecisionFilter(event.target.value)}
                className={`${inputClass} pl-9 sm:w-48`}
              >
                <option value="ALL">All decisions</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DENIED">Denied</option>
                <option value="EXPIRED">Expired</option>
                <option value="APPROVAL_REQUIRED">Approval required</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[var(--surface-elevated)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Event</th>
                <th className="px-5 py-4 font-semibold">Actor</th>
                <th className="px-5 py-4 font-semibold">Agent</th>
                <th className="px-5 py-4 font-semibold">Tool</th>
                <th className="px-5 py-4 font-semibold">Decision</th>
                <th className="px-5 py-4 font-semibold">Occurred at</th>
                <th className="px-5 py-4 text-right font-semibold">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-[var(--muted)]">
                    <Loader2
                      size={23}
                      className="mx-auto mb-3 animate-spin text-[var(--primary)]"
                    />
                    Loading audit events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <FileText size={32} className="mx-auto mb-3 text-[var(--muted)]" />
                    <p className="text-sm font-semibold">No audit events found</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Try another search or decision filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold">
                        {shortId(event.id)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        {shortId(event.ruleId)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <UserRound size={15} className="text-[var(--muted)]" />
                        <span>{event.actorId || "System"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {shortId(event.agentId)}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {shortId(event.toolId)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${decisionStyle(event.decision)}`}>
                        <DecisionIcon decision={event.decision} />
                        {event.decision}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {formatDate(event.occurredAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(event)}
                        title="View event details"
                        className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--muted)]">
            {pageData
              ? `Page ${page + 1} of ${Math.max(totalPages, 1)} · ${pageData.totalElements} total events`
              : "Loading event count..."}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={loading || page <= 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              disabled={loading || !pageData || pageData.last}
              onClick={() => setPage((current) => current + 1)}
              className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Event details modal */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <section className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="font-bold">Audit event details</h2>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                    {selected.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--muted)]">Decision</span>
                <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold ${decisionStyle(selected.decision)}`}>
                  <DecisionIcon decision={selected.decision} />
                  {selected.decision}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Actor ID", selected.actorId || "System"],
                  ["Agent ID", selected.agentId || "—"],
                  ["Tool ID", selected.toolId || "—"],
                  ["Rule ID", selected.ruleId || "—"],
                  ["Occurred at", formatDate(selected.occurredAt)],
                  ["Event ID", selected.id],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-3"
                  >
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {label}
                    </p>
                    <p className="break-all text-xs font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-4">
                <p className="mb-2 text-xs font-semibold">Event explanation</p>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)]">
                  {selected.explanation || "No explanation was recorded."}
                </p>
              </div>

              <div className="flex items-center justify-end border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setSelected(null)}
                  className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}