"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Plus, RefreshCw, Search, Upload, Pencil, Power,
  Wrench, X, ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle2, Shield, Activity
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  description?: string;
  transportType: "REST" | "MCP";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  ownerTeam: string;
  endpointUrl?: string;
  httpMethod?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  inputSchema: string;
  active: boolean;
  healthStatus: "UNKNOWN" | "UP" | "DOWN";
};

type FormData = {
  name: string;
  description: string;
  transportType: "REST" | "MCP";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  ownerTeam: string;
  endpointUrl: string;
  httpMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  inputSchema: string;
};

const initialForm: FormData = {
  name: "",
  description: "",
  transportType: "REST",
  riskLevel: "LOW",
  ownerTeam: "",
  endpointUrl: "",
  httpMethod: "POST",
  inputSchema: '{\n  "type": "object",\n  "properties": {},\n  "additionalProperties": false\n}',
};

const field =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50";

function Badge({ children, color = "gray" }: {
  children: React.ReactNode;
  color?: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-500",
    red: "bg-rose-500/10 text-rose-500",
    yellow: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    gray: "bg-[var(--surface-elevated)] text-[var(--muted)]",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[color] || styles.gray}`}>
      {children}
    </span>
  );
}

export default function ToolManagement() {
  const { apiFetch } = useAuth();

  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [schemaError, setSchemaError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [owner, setOwner] = useState("");
  const [importing, setImporting] = useState(false);

  const getError = async (res: Response) => {
    try {
      const data = await res.json();
      return data.message || data.error || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  };

  const loadTools = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(
        `/api/v1/tools?activeOnly=false&page=${page}&size=20&sort=createdAt,desc`
      );
      if (!res.ok) throw new Error(await getError(res));
      const data = await res.json();
      setTools(data.content || []);
      setTotal(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load tools.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, page]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const filtered = useMemo(() => tools.filter((tool) => {
    const q = search.toLowerCase();
    const matches =
      tool.name.toLowerCase().includes(q) ||
      (tool.description || "").toLowerCase().includes(q) ||
      (tool.ownerTeam || "").toLowerCase().includes(q);
    const statusMatches =
      status === "ALL" ||
      (status === "ACTIVE" && tool.active) ||
      (status === "INACTIVE" && !tool.active);
    return matches && statusMatches;
  }), [tools, search, status]);

  const update = (key: keyof FormData, value: string) => {
    setForm((old) => ({ ...old, [key]: value }));
  };

  const createTool = () => {
    setEditing(null);
    setForm(initialForm);
    setSchemaError("");
    setModal(true);
  };

  const editTool = (tool: Tool) => {
    setEditing(tool);
    setForm({
      name: tool.name,
      description: tool.description || "",
      transportType: tool.transportType,
      riskLevel: tool.riskLevel,
      ownerTeam: tool.ownerTeam || "",
      endpointUrl: tool.endpointUrl || "",
      httpMethod: tool.httpMethod || "POST",
      inputSchema: tool.inputSchema || '{"type":"object"}',
    });
    setSchemaError("");
    setModal(true);
  };

  const saveTool = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    let schema: Record<string, unknown>;
    try {
      schema = JSON.parse(form.inputSchema);
      if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        throw new Error("Schema must be a JSON object.");
      }
      setSchemaError("");
    } catch (e) {
      setSchemaError(e instanceof Error ? e.message : "Invalid JSON.");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.ownerTeam.trim()) {
      setError("Owner team is required.");
      return;
    }

    if (!form.endpointUrl.trim()) {
      setError("Endpoint URL is required by the backend for REST and MCP.");
      return;
    }

    if (form.transportType === "REST" || form.endpointUrl.trim()) {
      try {
        const url = new URL(form.endpointUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        setError("Enter a valid HTTP or HTTPS endpoint URL.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = editing
        ? {
            description: form.description,
            riskLevel: form.riskLevel,
            ownerTeam: form.ownerTeam,
            endpointUrl: form.endpointUrl,
            httpMethod: form.transportType === "REST" ? form.httpMethod : null,
            inputSchema: JSON.stringify(schema),
            active: editing.active,
          }
        : {
            ...form,
            endpointUrl: form.endpointUrl,
            httpMethod: form.transportType === "REST" ? form.httpMethod : null,
            inputSchema: JSON.stringify(schema),
          };

      const res = await apiFetch(
        editing ? `/api/v1/tools/${editing.id}` : "/api/v1/tools",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error(await getError(res));

      setMessage(editing ? "Tool updated successfully." : "Tool registered successfully.");
      setModal(false);
      await loadTools();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save tool.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTool = async (tool: Tool) => {
    setError("");
    setMessage("");
    try {
      let res: Response;
      if (tool.active) {
        res = await apiFetch(`/api/v1/tools/${tool.id}`, { method: "DELETE" });
      } else {
        res = await apiFetch(`/api/v1/tools/${tool.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: tool.description || "",
            riskLevel: tool.riskLevel,
            ownerTeam: tool.ownerTeam,
            endpointUrl: tool.endpointUrl || null,
            httpMethod: tool.httpMethod || null,
            inputSchema: tool.inputSchema || '{"type":"object"}',
            active: true,
          }),
        });
      }
      if (!res.ok) throw new Error(await getError(res));
      setMessage(tool.active ? "Tool deactivated." : "Tool activated.");
      await loadTools();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update tool.");
    }
  };

  const importOpenApi = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!file || !owner.trim()) {
      setError("Select an OpenAPI file and enter the owner team.");
      return;
    }

    const body = new FormData();
    body.append("file", file);
    setImporting(true);
    try {
      const res = await apiFetch(
        `/api/v1/tools/import/openapi?ownerTeam=${encodeURIComponent(owner.trim())}`,
        { method: "POST", body }
      );
      if (!res.ok) throw new Error(await getError(res));
      const result = await res.json();
      setMessage(`OpenAPI import completed: ${result.imported?.length || 0} tool(s).`);
      setFile(null);
      await loadTools();
    } catch (e) {
      setError(e instanceof Error ? e.message : "OpenAPI import failed.");
    } finally {
      setImporting(false);
    }
  };

  const activeCount = tools.filter((t) => t.active).length;
  const highCount = tools.filter((t) => t.riskLevel === "HIGH").length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
            <Activity size={14} /> AgentGate Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tools Registry</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Register, configure and manage your tool integrations.
          </p>
        </div>
        <button onClick={createTool} className={`${btn} bg-[var(--primary)] text-white hover:opacity-90`}>
          <Plus size={17} /> Register Tool
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
          <CheckCircle2 size={17} /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          <AlertCircle size={17} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total tools", total, "Registered in workspace"],
          ["Active tools", activeCount, "On current page"],
          ["Inactive tools", tools.length - activeCount, "On current page"],
          ["High risk", highCount, "On current page"],
        ].map(([label, value, hint]) => (
          <div key={String(label)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold">Import OpenAPI</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Import tools from an OpenAPI 3.x JSON or YAML file.
          </p>
          <form onSubmit={importOpenApi} className="mt-4 space-y-3">
            <input className={field} placeholder="Owner team" value={owner}
              onChange={(e) => setOwner(e.target.value)} />
            <input className={field} type="file" accept=".json,.yaml,.yml,application/json"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button disabled={importing} className={`${btn} bg-[var(--surface-elevated)] hover:opacity-80`}>
              <Upload size={16} /> {importing ? "Importing..." : "Import specification"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[var(--primary)]" />
            <h2 className="font-semibold">Registry information</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>Supported transports: REST and MCP.</p>
            <p>Risk levels: LOW, MEDIUM and HIGH.</p>
            <p>Deactivation is a soft action, not permanent deletion.</p>
            <p>Health status is displayed from the backend response.</p>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold">Registered Tools</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Manage your registered integrations.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input className={`${field} pl-9`} placeholder="Search tools..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button onClick={loadTools} className={`${btn} border border-[var(--border)] hover:bg-[var(--surface-elevated)]`}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">Loading tools...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench size={30} className="mx-auto text-[var(--muted)]" />
            <p className="mt-3 font-semibold">No tools found</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Register a tool or adjust your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[var(--surface-elevated)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  {["Tool", "Transport", "Risk", "Health", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((tool) => (
                  <tr key={tool.id} className="hover:bg-[var(--surface-elevated)]">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{tool.name}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-[var(--muted)]">{tool.description || "No description"}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Team: {tool.ownerTeam}</p>
                    </td>
                    <td className="px-5 py-4"><Badge color="blue">{tool.transportType}</Badge></td>
                    <td className="px-5 py-4">
                      <Badge color={tool.riskLevel === "HIGH" ? "red" : tool.riskLevel === "MEDIUM" ? "yellow" : "green"}>
                        {tool.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={tool.healthStatus === "UP" ? "green" : tool.healthStatus === "DOWN" ? "red" : "gray"}>
                        {tool.healthStatus || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={tool.active ? "green" : "gray"}>{tool.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editTool(tool)} title="Edit"
                          className="rounded-lg border border-[var(--border)] p-2 hover:bg-[var(--background)]">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleTool(tool)} title={tool.active ? "Deactivate" : "Activate"}
                          className="rounded-lg border border-[var(--border)] p-2 hover:bg-[var(--background)]">
                          <Power size={15} className={tool.active ? "text-rose-500" : "text-emerald-500"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--border)] p-4">
          <span className="text-xs text-[var(--muted)]">
            Page {totalPages ? page + 1 : 0} of {totalPages} · {total} tools
          </span>
          <div className="flex gap-2">
            <button disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`${btn} border border-[var(--border)]`}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}
              className={`${btn} border border-[var(--border)]`}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] p-5">
              <div>
                <h2 className="text-lg font-bold">{editing ? "Edit Tool" : "Register Tool"}</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Configure tool metadata and input schema.</p>
              </div>
              <button onClick={() => setModal(false)} className="rounded-lg p-2 hover:bg-[var(--surface-elevated)]"><X size={18} /></button>
            </div>

            <form onSubmit={saveTool} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span>Tool name</span>
                  <input required disabled={!!editing} className={field} value={form.name}
                    onChange={(e) => update("name", e.target.value)} placeholder="customer_lookup" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span>Owner team</span>
                  <input required className={field} value={form.ownerTeam}
                    onChange={(e) => update("ownerTeam", e.target.value)} placeholder="platform-team" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span>Transport</span>
                  <select disabled={!!editing} className={field} value={form.transportType}
                    onChange={(e) => update("transportType", e.target.value)}>
                    <option value="REST">REST</option>
                    <option value="MCP">MCP</option>
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span>Risk level</span>
                  <select className={field} value={form.riskLevel}
                    onChange={(e) => update("riskLevel", e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5 text-sm">
                <span>Description</span>
                <textarea rows={2} className={field} value={form.description}
                  onChange={(e) => update("description", e.target.value)} />
              </label>

              {form.transportType === "REST" && (
                <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
                  <label className="space-y-1.5 text-sm">
                    <span>Endpoint URL</span>
                    <input required type="url" className={field} value={form.endpointUrl}
                      onChange={(e) => update("endpointUrl", e.target.value)}
                      placeholder="https://api.example.com/resource" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span>HTTP method</span>
                    <select className={field} value={form.httpMethod}
                      onChange={(e) => update("httpMethod", e.target.value)}>
                      {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className="block space-y-1.5 text-sm">
                <span>Input Schema (JSON)</span>
                <textarea rows={8} spellCheck={false} className={`${field} font-mono text-xs`}
                  value={form.inputSchema}
                  onChange={(e) => { update("inputSchema", e.target.value); setSchemaError(""); }} />
                {schemaError && <span className="text-xs text-rose-500">{schemaError}</span>}
              </label>

              <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
                <button type="button" onClick={() => setModal(false)}
                  className={`${btn} border border-[var(--border)]`}>Cancel</button>
                <button disabled={saving} type="submit"
                  className={`${btn} bg-[var(--primary)] text-white`}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Tool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

