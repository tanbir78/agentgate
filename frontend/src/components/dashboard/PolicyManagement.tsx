"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  Archive,
  Play,
  Eye,
  ListFilter,
  ArrowUpRight,
  Bot,
  Wrench,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";

type PolicyStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type Effect = "ALLOW" | "DENY";

type Policy = {
  id: string;
  policyKey: string;
  version: number;
  description: string | null;
  status: PolicyStatus;
  createdAt: string;
  activatedAt: string | null;
};

type PolicyRule = {
  id: string;
  policyId: string;
  agentId: string;
  toolId: string;
  effect: Effect;
  priority: number;
  conditions: Record<string, unknown>;
  enabled: boolean;
  description: string | null;
  createdAt: string;
};

type Agent = {
  id: string;
  name: string;
  active: boolean;
};

type Tool = {
  id: string;
  name: string;
  active: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--ring)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function statusClass(status: PolicyStatus) {
  if (status === "ACTIVE") {
    return "border border-[var(--success)]/20 bg-[var(--primary-soft)] text-[var(--success)]";
  }

  if (status === "ARCHIVED") {
    return "border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--muted)]";
  }

  return "border border-[var(--warning)]/20 bg-[var(--soft-orange)] text-[var(--warning)]";
}

function effectClass(effect: Effect) {
  return effect === "ALLOW"
    ? "border border-[var(--success)]/20 bg-[var(--primary-soft)] text-[var(--success)]"
    : "border border-[var(--danger)]/20 bg-[var(--soft-rose)] text-[var(--danger)]";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

export default function PolicyManagement() {
  const { apiFetch } = useAuth();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [policyKey, setPolicyKey] = useState("");
  const [description, setDescription] = useState("");

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  const [ruleOpen, setRuleOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);

  const [agentId, setAgentId] = useState("");
  const [toolId, setToolId] = useState("");
  const [effect, setEffect] = useState<Effect>("ALLOW");
  const [priority, setPriority] = useState("100");
  const [ruleDescription, setRuleDescription] = useState("");

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/v1/policies");

      if (!response.ok) {
        throw new Error(`Unable to load policies (${response.status}).`);
      }

      const data: Policy[] = await response.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load policies.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        policy.policyKey.toLowerCase().includes(query) ||
        (policy.description ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || policy.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [policies, search, statusFilter]);

  const activeCount = policies.filter((p) => p.status === "ACTIVE").length;
  const draftCount = policies.filter((p) => p.status === "DRAFT").length;
  const archivedCount = policies.filter((p) => p.status === "ARCHIVED").length;

  async function createPolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!policyKey.trim()) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch("/api/v1/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyKey: policyKey.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Policy creation failed (${response.status}).`);
      }

      setCreateOpen(false);
      setPolicyKey("");
      setDescription("");
      setNotice("Policy created successfully.");
      await loadPolicies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Policy creation failed.");
    } finally {
      setSaving(false);
    }
  }

  async function openRules(policy: Policy) {
    setSelectedPolicy(policy);
    setRules([]);
    setRulesLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/v1/policies/${policy.id}/rules`
      );

      if (!response.ok) {
        throw new Error(`Unable to load policy rules (${response.status}).`);
      }

      const data: PolicyRule[] = await response.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load rules.");
    } finally {
      setRulesLoading(false);
    }
  }

  async function loadRuleOptions() {
    setError("");

    try {
      const [agentResponse, toolResponse] = await Promise.all([
        apiFetch("/api/v1/agents?page=0&size=100&sort=createdAt,desc"),
        apiFetch("/api/v1/tools?activeOnly=true&page=0&size=100&sort=createdAt,desc"),
      ]);

      if (!agentResponse.ok) {
        throw new Error(`Unable to load agents (${agentResponse.status}).`);
      }

      if (!toolResponse.ok) {
        throw new Error(`Unable to load tools (${toolResponse.status}).`);
      }

      const agentData = await agentResponse.json();
      const toolData = await toolResponse.json();

      const activeAgents: Agent[] = (agentData.content ?? []).filter(
        (item: Agent) => item.active
      );

      const activeTools: Tool[] = (toolData.content ?? []).filter(
        (item: Tool) => item.active
      );

      setAgents(activeAgents);
      setTools(activeTools);

      setAgentId(activeAgents[0]?.id ?? "");
      setToolId(activeTools[0]?.id ?? "");
      setEffect("ALLOW");
      setPriority("100");
      setRuleDescription("");
      setRuleOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load rule options.");
    }
  }

  async function addRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPolicy || !agentId || !toolId) return;

    const parsedPriority = Number(priority);

    if (!Number.isInteger(parsedPriority) || parsedPriority < 0 || parsedPriority > 10000) {
      setError("Priority must be an integer between 0 and 10000.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/v1/policies/${selectedPolicy.id}/rules`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId,
            toolId,
            effect,
            priority: parsedPriority,
            conditions: {},
            description: ruleDescription.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Unable to add rule (${response.status}).`);
      }

      setRuleOpen(false);
      setNotice("Policy rule added successfully.");
      await openRules(selectedPolicy);
      await loadPolicies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add rule.");
    } finally {
      setSaving(false);
    }
  }

  async function runPolicyAction(policy: Policy, action: "activate" | "archive") {
    const message =
      action === "activate"
        ? `Activate policy "${policy.policyKey}"? The currently active version of this policy key will be archived.`
        : `Archive policy "${policy.policyKey}"?`;

    if (!window.confirm(message)) return;

    setError("");
    setNotice("");
    setSaving(true);

    try {
      const response = await apiFetch(
        `/api/v1/policies/${policy.id}/${action}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Unable to ${action} policy (${response.status}).`);
      }

      setNotice(`Policy ${action}d successfully.`);
      await loadPolicies();

      if (selectedPolicy?.id === policy.id) {
        const updated = await response.clone().json().catch(() => null);
        if (updated) setSelectedPolicy(updated);
        await openRules(updated ?? policy);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${action} policy.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            <Activity size={13} />
            AgentGate Management
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Configure governance rules and access decisions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => void loadPolicies()}
            disabled={loading}
            className={`${buttonClass} border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)]`}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setPolicyKey("");
              setDescription("");
              setError("");
              setCreateOpen(true);
            }}
            className={`${buttonClass} bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/15 hover:brightness-110`}
          >
            <Plus size={17} />
            Create Policy
          </button>
        </div>
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

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Policies", value: policies.length, icon: ShieldCheck, color: "var(--accent-blue)" },
          { label: "Active Policies", value: activeCount, icon: CheckCircle2, color: "var(--success)" },
          { label: "Draft Policies", value: draftCount, icon: Clock, color: "var(--warning)" },
          { label: "Archived Policies", value: archivedCount, icon: Archive, color: "var(--muted)" },
        ].map((item) => {
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
              <p className="text-xs font-medium text-[var(--muted)]">{item.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {loading ? "—" : item.value}
              </p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                From policy records
              </p>
            </div>
          );
        })}
      </div>

      {/* Policies Table */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">

        <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]/60 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">Policy workspace</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Policies stored in your AgentGate database.
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
                placeholder="Search policies..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <div className="relative">
              <ListFilter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`${inputClass} pl-9 sm:w-40`}
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[var(--surface-elevated)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Policy</th>
                <th className="px-5 py-4 font-semibold">Version</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 font-semibold">Activated</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-[var(--muted)]">
                    <Loader2 size={23} className="mx-auto mb-3 animate-spin text-[var(--primary)]" />
                    Loading policies from database...
                  </td>
                </tr>
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <ShieldCheck size={30} className="mx-auto mb-3 text-[var(--muted)]" />
                    <p className="text-sm font-semibold">
                      {policies.length === 0 ? "No policies yet" : "No matching policies"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {policies.length === 0
                        ? "Create your first policy to start configuring governance."
                        : "Try a different search term or status filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">{policy.policyKey}</p>
                      <p className="mt-1 max-w-[260px] truncate text-xs text-[var(--muted)]">
                        {policy.description || "No description provided"}
                      </p>
                      <p className="mt-1 max-w-[260px] truncate font-mono text-[10px] text-[var(--muted)]">
                        {policy.id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs font-semibold">
                        v{policy.version}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold ${statusClass(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {formatDate(policy.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {formatDate(policy.activatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => void openRules(policy)}
                          title="View rules"
                          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                        >
                          <Eye size={16} />
                        </button>

                        {policy.status === "DRAFT" && (
                          <button
                            disabled={saving}
                            onClick={() => void openRules(policy)}
                            title="Open policy rules before activation"
                            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        )}

                        {policy.status === "DRAFT" && (
                          <button
                            disabled={saving}
                            onClick={() => void runPolicyAction(policy, "activate")}
                            title="Activate policy"
                            className="rounded-lg p-2 text-[var(--success)] transition hover:bg-[var(--primary-soft)] disabled:opacity-40"
                          >
                            <Play size={16} />
                          </button>
                        )}

                        {policy.status === "ACTIVE" && (
                          <button
                            disabled={saving}
                            onClick={() => void runPolicyAction(policy, "archive")}
                            title="Archive policy"
                            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] disabled:opacity-40"
                          >
                            <Archive size={16} />
                          </button>
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
            Showing {filteredPolicies.length} of {policies.length} policies
          </p>
          <span className="text-[10px] text-[var(--muted)]">
            Live database records
          </span>
        </div>
      </section>

      {/* Create Policy Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={createPolicy}
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="font-bold">Create policy</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Create a new draft policy.
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Policy key
                </label>
                <input
                  required
                  maxLength={120}
                  pattern="[a-zA-Z][a-zA-Z0-9_-]{1,119}"
                  title="Start with a letter. Use letters, numbers, underscore or hyphen. Minimum 2 characters."
                  value={policyKey}
                  onChange={(event) => setPolicyKey(event.target.value)}
                  placeholder="e.g. customer_data_access"
                  className={inputClass}
                />
                <p className="mt-2 text-[10px] text-[var(--muted)]">
                  Start with a letter; use letters, numbers, _ or -.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Description
                </label>
                <textarea
                  maxLength={1000}
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the purpose of this policy..."
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || policyKey.trim().length < 2}
                  className={`${buttonClass} bg-[var(--primary)] text-white hover:brightness-110`}
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? "Creating..." : "Create policy"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Policy Rules Modal */}
      {selectedPolicy && !ruleOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
          <section className="my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <LockKeyhole size={19} className="text-[var(--primary)]" />
                  <h2 className="font-bold">{selectedPolicy.policyKey}</h2>
                  <span className={`rounded-md px-2 py-1 text-[9px] font-bold ${statusClass(selectedPolicy.status)}`}>
                    {selectedPolicy.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Policy rules · Version {selectedPolicy.version}
                </p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Configured rules</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {rules.length} rule(s) attached to this policy.
                  </p>
                </div>

                {selectedPolicy.status === "DRAFT" && (
                  <button
                    onClick={() => void loadRuleOptions()}
                    className={`${buttonClass} bg-[var(--primary)] text-white hover:brightness-110`}
                  >
                    <Plus size={16} />
                    Add Rule
                  </button>
                )}
              </div>

              {rulesLoading ? (
                <div className="py-12 text-center text-sm text-[var(--muted)]">
                  <Loader2 size={22} className="mx-auto mb-2 animate-spin text-[var(--primary)]" />
                  Loading rules...
                </div>
              ) : rules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
                  <FileText size={27} className="mx-auto mb-3 text-[var(--muted)]" />
                  <p className="text-sm font-semibold">No rules configured</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Add at least one enabled rule before activating this policy.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${effectClass(rule.effect)}`}>
                            {rule.effect}
                          </span>
                          <span className="text-xs font-semibold">
                            Priority {rule.priority}
                          </span>
                          <span className={`rounded-lg px-2 py-1 text-[9px] font-bold ${
                            rule.enabled
                              ? statusClass("ACTIVE")
                              : statusClass("ARCHIVED")
                          }`}>
                            {rule.enabled ? "ENABLED" : "DISABLED"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--muted)]">
                          {formatDate(rule.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 break-all text-xs text-[var(--muted)]">
                        Agent: {rule.agentId}
                      </p>
                      <p className="mt-1 break-all text-xs text-[var(--muted)]">
                        Tool: {rule.toolId}
                      </p>
                      {rule.description && (
                        <p className="mt-2 text-sm">{rule.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Add Rule Modal */}
      {selectedPolicy && ruleOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={addRule}
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)]/70 p-5">
              <div>
                <h2 className="font-bold">Add policy rule</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {selectedPolicy.policyKey}
                </p>
              </div>
              <button type="button" onClick={() => setRuleOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Bot size={15} /> Agent
                </label>
                <select
                  required
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select an active agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                {agents.length === 0 && (
                  <p className="mt-1 text-[10px] text-[var(--warning)]">
                    No active agents found.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <Wrench size={15} /> Tool
                </label>
                <select
                  required
                  value={toolId}
                  onChange={(event) => setToolId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select an active tool</option>
                  {tools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
                </select>
                {tools.length === 0 && (
                  <p className="mt-1 text-[10px] text-[var(--warning)]">
                    No active tools found.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Decision effect
                  </label>
                  <select
                    value={effect}
                    onChange={(event) => setEffect(event.target.value as Effect)}
                    className={inputClass}
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Priority (0–10000)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    step={1}
                    required
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={ruleDescription}
                  onChange={(event) => setRuleDescription(event.target.value)}
                  placeholder="Describe this rule..."
                  className={inputClass}
                />
              </div>

              <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-[10px] text-[var(--muted)]">
                Conditions are currently sent as an empty object. Advanced condition-builder support can be added after the backend condition format is confirmed.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRuleOpen(false)}
                  className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !agentId || !toolId}
                  className={`${buttonClass} bg-[var(--primary)] text-white hover:brightness-110`}
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? "Saving..." : "Add rule"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}