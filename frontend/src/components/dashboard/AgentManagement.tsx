"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity, Bot, Plus, RefreshCw, Search, Pencil, Trash2,
  Copy, X, ShieldCheck, KeyRound, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type Clearance = "LOW" | "MEDIUM" | "HIGH";

type Agent = {
  id: string;
  name: string;
  clientId: string;
  clearance: Clearance;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type CreatedAgent = Agent & { clientSecret: string };

type AgentPageResponse = {
  content: Agent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

function clearanceStyle(value: Clearance) {
  if (value === "HIGH") return "bg-[var(--danger)]/10 text-[var(--danger)]";
  if (value === "MEDIUM") return "bg-[var(--warning)]/10 text-[var(--warning)]";
  return "bg-[var(--success)]/10 text-[var(--success)]";
}

export default function AgentManagement() {
  const { apiFetch } = useAuth();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [agentName, setAgentName] = useState("");
  const [clearance, setClearance] = useState<Clearance>("LOW");
  const [active, setActive] = useState(true);

  const [secretAgent, setSecretAgent] = useState<CreatedAgent | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/v1/agents?page=${page}&size=20&sort=createdAt,desc`
      );

      if (!response.ok) {
        throw new Error(`Unable to load agents (${response.status}).`);
      }

      const data: AgentPageResponse = await response.json();

      setAgents(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  function openCreate() {
    setEditing(null);
    setAgentName("");
    setClearance("LOW");
    setActive(true);
    setError("");
    setModalOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditing(agent);
    setAgentName(agent.name);
    setClearance(agent.clearance);
    setActive(agent.active);
    setError("");
    setModalOpen(true);
  }

  async function saveAgent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agentName.trim()) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isEditing = Boolean(editing);

      const response = await apiFetch(
        isEditing ? `/api/v1/agents/${editing!.id}` : "/api/v1/agents",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? { name: agentName.trim(), clearance, active }
              : { name: agentName.trim(), clearance }
          )
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status}).`);
      }

      if (isEditing) {
        setModalOpen(false);
        setNotice("Agent updated successfully.");
        await loadAgents();
      } else {
        const created: CreatedAgent = await response.json();
        setModalOpen(false);
        setSecretAgent(created);
        setCopied(false);
        setNotice("Agent created successfully.");
        await loadAgents();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save agent.");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateAgent(agent: Agent) {
    const confirmed = window.confirm(
      `Deactivate "${agent.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await apiFetch(`/api/v1/agents/${agent.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Unable to deactivate agent (${response.status}).`);
      }

      setNotice(`${agent.name} has been deactivated.`);
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivation failed.");
    }
  }

  async function copySecret() {
    if (!secretAgent?.clientSecret) return;

    try {
      await navigator.clipboard.writeText(secretAgent.clientSecret);
      setCopied(true);
    } catch {
      setError("Clipboard access failed. Copy the secret manually.");
    }
  }

  const visibleAgents = agents.filter((agent) => {
    const query = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(query) ||
      agent.clientId.toLowerCase().includes(query)
    );
  });

  const activeCount = agents.filter((agent) => agent.active).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            <Activity size={13} /> AgentGate Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Register, monitor and manage your AI agents.
          </p>
        </div>

        <button
          onClick={openCreate}
          className={`${buttonClass} bg-[var(--primary)] text-white hover:opacity-90`}
        >
          <Plus size={17} /> Register Agent
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="text-xs text-[var(--muted)]">Total agents</span>
          <p className="mt-3 text-2xl font-bold">{totalElements}</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="text-xs text-[var(--muted)]">Active on this page</span>
          <p className="mt-3 text-2xl font-bold">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <span className="text-xs text-[var(--muted)]">Current page</span>
          <p className="mt-3 text-2xl font-bold">
            {totalPages ? `${page + 1} / ${totalPages}` : "0"}
          </p>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-3 text-sm text-[var(--success)]">
          <CheckCircle2 size={17} />
          {notice}
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

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Registered agents</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Agent identities and security clearance.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search agents..."
                className={`${inputClass} pl-9`}
              />
            </div>

            <button
              onClick={() => void loadAgents()}
              disabled={loading}
              className={`${buttonClass} border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]`}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[var(--background)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-5 py-4">Agent</th>
                <th className="px-5 py-4">Client ID</th>
                <th className="px-5 py-4">Clearance</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">

              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-[var(--muted)]">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={22} />
                    Loading agents...
                  </td>
                </tr>
              ) : visibleAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <Bot size={28} className="mx-auto mb-2 text-[var(--muted)]" />
                    <p className="text-sm font-medium">No agents found</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Register an agent or adjust your search.
                    </p>
                  </td>
                </tr>
              ) : (
                visibleAgents.map((agent) => (
                  <tr key={agent.id} className="transition hover:bg-[var(--surface-hover)]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">{agent.name}</p>
                      <p className="mt-1 max-w-[220px] truncate text-[10px] text-[var(--muted)]">
                        {agent.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-[var(--muted)]">
                      {agent.clientId}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${clearanceStyle(agent.clearance)}`}>
                        {agent.clearance}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${agent.active ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                        <span className={`h-2 w-2 rounded-full ${agent.active ? "bg-[var(--success)]" : "bg-[var(--muted)]"}`} />
                        {agent.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {new Date(agent.createdAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(agent)}
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                          title="Edit agent"
                        >
                          <Pencil size={16} />
                        </button>

                        {agent.active && (
                          <button
                            onClick={() => void deactivateAgent(agent)}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
                            title="Deactivate agent"
                          >
                            <Trash2 size={16} />
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

        <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
          <p className="text-xs text-[var(--muted)]">
            {totalElements} total agent(s)
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0 || loading}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className={`${buttonClass} border border-[var(--border)] px-3 py-2 text-[var(--muted)]`}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className={`${buttonClass} border border-[var(--border)] px-3 py-2 text-[var(--muted)]`}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <form
            onSubmit={saveAgent}
            className="my-auto w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? "Edit agent" : "Register new agent"}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Configure agent identity and clearance.
                </p>
              </div>

              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-hover)]">
                <X size={18} />
              </button>
            </div>

            <label className="mb-2 block text-xs font-semibold">Agent name</label>
            <input
              autoFocus
              maxLength={120}
              required
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              placeholder="e.g. Customer Support Agent"
              className={inputClass}
            />

            <label className="mb-2 mt-5 block text-xs font-semibold">Security clearance</label>
            <select
              value={clearance}
              onChange={(event) => setClearance(event.target.value as Clearance)}
              className={inputClass}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            {editing && (
              <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                <span className="text-sm font-medium">Agent is active</span>
              </label>
            )}

            {error && (
              <p className="mt-4 break-all text-xs text-[var(--danger)]">
                {error}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className={`${buttonClass} border border-[var(--border)] text-[var(--muted)]`}>
                Cancel
              </button>

              <button
                disabled={saving || !agentName.trim()}
                type="submit"
                className={`${buttonClass} bg-[var(--primary)] text-white hover:opacity-90`}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving..." : editing ? "Save changes" : "Create agent"}
              </button>
            </div>
          </form>
        </div>
      )}

      {secretAgent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--success)]/10 text-[var(--success)]">
                <KeyRound size={22} />
              </div>

              <div>
                <h2 className="font-bold">Agent created successfully</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {secretAgent.name}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-3 text-xs text-[var(--warning)]">
              Save this client secret now. It is shown only once and cannot be retrieved later.
            </div>

            <label className="mb-2 mt-5 block text-xs font-semibold">Client ID</label>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs break-all">
              {secretAgent.clientId}
            </div>

            <label className="mb-2 mt-4 block text-xs font-semibold">Client Secret</label>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs break-all">
              {secretAgent.clientSecret}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => void copySecret()} className={`${buttonClass} flex-1 bg-[var(--primary)] text-white hover:opacity-90`}>
                <Copy size={15} /> {copied ? "Copied" : "Copy secret"}
              </button>

              <button onClick={() => setSecretAgent(null)} className={`${buttonClass} flex-1 border border-[var(--border)] text-[var(--muted)]`}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
