"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ClipboardCheck, RefreshCw, Search, Eye, X,
  CheckCircle2, XCircle, Clock, AlertCircle, Loader2,
  ShieldCheck, Bot, Wrench, CalendarClock, Hash,
  ChevronDown, Filter, CircleCheck, CircleX
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

type Approval = {
  id: string;
  agentId: string;
  toolId: string;
  policyRuleId: string;
  endUserId: string | null;
  argumentsSha256: string;
  status: ApprovalStatus;
  requestedAt: string;
  expiresAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionReason: string | null;
  version: number;
};

const statuses: ApprovalStatus[] = [
  "PENDING", "APPROVED", "REJECTED", "EXPIRED"
];

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function statusStyle(status: ApprovalStatus) {
  switch (status) {
    case "PENDING":
      return "border border-[var(--warning)]/20 bg-[var(--soft-orange)] text-[var(--warning)]";
    case "APPROVED":
      return "border border-[var(--success)]/20 bg-[var(--primary-soft)] text-[var(--success)]";
    case "REJECTED":
      return "border border-[var(--danger)]/20 bg-[var(--soft-rose)] text-[var(--danger)]";
    default:
      return "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)]";
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function shortId(value: string | null) {
  if (!value) return "—";
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function errorMessage(value: unknown) {
  return value instanceof Error ? value.message : "Something went wrong.";
}

export default function ApprovalManagement() {
  const { apiFetch } = useAuth();

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [filter, setFilter] = useState("PENDING");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Approval | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requestedStatuses =
        filter === "ALL" ? statuses : [filter as ApprovalStatus];

      const results = await Promise.all(
        requestedStatuses.map(async (status) => {
          const response = await apiFetch(
            `/api/v1/approvals?status=${status}`
          );

          if (!response.ok) {
            throw new Error(
              `Unable to load ${status.toLowerCase()} approvals (${response.status}).`
            );
          }

          const data: Approval[] = await response.json();
          return Array.isArray(data) ? data : [];
        })
      );

      const merged = results.flat();
      merged.sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() -
          new Date(a.requestedAt).getTime()
      );

      setApprovals(merged);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [apiFetch, filter]);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return approvals;

    return approvals.filter((item) =>
      [
        item.id,
        item.agentId,
        item.toolId,
        item.policyRuleId,
        item.endUserId ?? "",
        item.status,
        item.decidedBy ?? "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [approvals, search]);

  const pendingCount = approvals.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedCount = approvals.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedCount = approvals.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const expiredCount = approvals.filter(
    (item) => item.status === "EXPIRED"
  ).length;

  async function openDetails(item: Approval) {
    setSelected(item);
    setError("");

    try {
      const response = await apiFetch(`/api/v1/approvals/${item.id}`);

      if (!response.ok) {
        throw new Error(`Unable to load approval details (${response.status}).`);
      }

      const data: Approval = await response.json();
      setSelected(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function submitDecision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected || !decision) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch(
        `/api/v1/approvals/${selected.id}/${decision}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reason.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Unable to ${decision} approval (${response.status}).`
        );
      }

      const updated: Approval = await response.json();

      setSelected(updated);
      setDecision(null);
      setReason("");
      setNotice(
        updated.status === "EXPIRED"
          ? "This approval request expired before the decision was recorded."
          : `Approval ${decision === "approve" ? "approved" : "rejected"} successfully.`
      );

      await loadApprovals();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const statCards = [
    { label: "Pending", value: pendingCount, icon: Clock, color: "var(--warning)" },
    { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "var(--success)" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "var(--danger)" },
    { label: "Expired", value: expiredCount, icon: CalendarClock, color: "var(--muted)" },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            <Activity size={13} />
            AgentGate Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Review and manage sensitive tool execution requests.
          </p>
        </div>

        <button
          onClick={() => void loadApprovals()}
          disabled={loading}
          className={`${buttonClass} border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-3 text-sm text-[var(--success)]">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button className="ml-auto" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

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
                style={{ color: item.color, background: "var(--primary-soft)" }}
              >
                <Icon size={20} />
              </div>
              <p className="text-xs font-medium text-[var(--muted)]">
                {item.label} Requests
              </p>
              <p className="mt-2 text-3xl font-bold">
                {loading ? "—" : item.value}
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Database records
              </p>
            </div>
          );
        })}
      </div>

      {/* Requests */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]/60 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">Approval workspace</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Live approval requests retrieved from AgentGate.
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
                placeholder="Search by ID or status..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className={`${inputClass} pl-9 sm:w-44`}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
                <option value="ALL">All statuses</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[var(--surface-elevated)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Request</th>
                <th className="px-5 py-4 font-semibold">Agent ID</th>
                <th className="px-5 py-4 font-semibold">Tool ID</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Requested</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-[var(--muted)]">
                    <Loader2 size={23} className="mx-auto mb-3 animate-spin text-[var(--primary)]" />
                    Loading approval requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <ClipboardCheck size={32} className="mx-auto mb-3 text-[var(--muted)]" />
                    <p className="text-sm font-semibold">
                      No {filter === "ALL" ? "" : filter.toLowerCase()} approval requests
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      The backend returned an empty result for this filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-semibold">
                        {shortId(item.id)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        {item.endUserId || "No end-user identity"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {shortId(item.agentId)}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {shortId(item.toolId)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold ${statusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {formatDate(item.requestedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => void openDetails(item)}
                          title="View details"
                          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                        >
                          <Eye size={16} />
                        </button>

                        {item.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => {
                                setSelected(item);
                                setDecision("approve");
                                setReason("");
                              }}
                              title="Approve request"
                              className="rounded-lg p-2 text-[var(--success)] transition hover:bg-[var(--primary-soft)]"
                            >
                              <CheckCircle2 size={17} />
                            </button>

                            <button
                              onClick={() => {
                                setSelected(item);
                                setDecision("reject");
                                setReason("");
                              }}
                              title="Reject request"
                              className="rounded-lg p-2 text-[var(--danger)] transition hover:bg-[var(--soft-rose)]"
                            >
                              <XCircle size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 px-5 py-4">
          <p className="text-xs text-[var(--muted)]">
            Showing {filtered.length} of {approvals.length} requests
          </p>
          <span className="text-[10px] text-[var(--muted)]">
            Live database records
          </span>
        </div>
      </section>

      {/* Details modal */}
      {selected && !decision && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <section className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ClipboardCheck size={22} />
                </div>
                <div>
                  <h2 className="font-bold">Approval details</h2>
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
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Current status</span>
                <span className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${statusStyle(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Agent ID", selected.agentId],
                  ["Tool ID", selected.toolId],
                  ["Policy Rule ID", selected.policyRuleId],
                  ["End User ID", selected.endUserId || "—"],
                  ["Requested at", formatDate(selected.requestedAt)],
                  ["Expires at", formatDate(selected.expiresAt)],
                  ["Decided at", formatDate(selected.decidedAt)],
                  ["Decided by", selected.decidedBy || "—"],
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
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Hash size={15} className="text-[var(--primary)]" />
                  Arguments SHA-256
                </div>
                <p className="break-all font-mono text-[11px] text-[var(--muted)]">
                  {selected.argumentsSha256}
                </p>
              </div>

              {selected.decisionReason && (
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <p className="mb-2 text-xs font-semibold">Decision reason</p>
                  <p className="text-sm text-[var(--muted)]">
                    {selected.decisionReason}
                  </p>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
                  <button
                    onClick={() => {
                      setDecision("reject");
                      setReason("");
                    }}
                    className={`${buttonClass} border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--soft-rose)]`}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setDecision("approve");
                      setReason("");
                    }}
                    className={`${buttonClass} bg-[var(--primary)] text-white hover:brightness-110`}
                  >
                    <CheckCircle2 size={16} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Decision modal */}
      {selected && decision && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitDecision}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div className="flex items-center gap-3">
                {decision === "approve" ? (
                  <CheckCircle2 className="text-[var(--success)]" size={23} />
                ) : (
                  <XCircle className="text-[var(--danger)]" size={23} />
                )}
                <div>
                  <h2 className="font-bold">
                    {decision === "approve" ? "Approve request" : "Reject request"}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {shortId(selected.id)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDecision(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-[var(--muted)]">
                {decision === "approve"
                  ? "Confirm that this tool execution request is authorized."
                  : "Confirm that this tool execution request should be denied."}
              </p>

              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Decision reason (optional)
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Add a reason for this decision..."
                  className={inputClass}
                />
                <p className="mt-1 text-right text-[10px] text-[var(--muted)]">
                  {reason.length}/1000
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecision(null)}
                  className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonClass} ${
                    decision === "approve"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--danger)] text-white"
                  } hover:brightness-110`}
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving
                    ? "Processing..."
                    : decision === "approve"
                      ? "Confirm approval"
                      : "Confirm rejection"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}