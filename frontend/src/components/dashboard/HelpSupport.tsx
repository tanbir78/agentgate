"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileText,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Settings,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    question: "What is AgentGate?",
    answer:
      "AgentGate is an AI agent security and governance platform. It provides agent identity management, tool registration, policy-based access decisions, approval workflows and audit capabilities.",
  },
  {
    question: "How do I register a new AI agent?",
    answer:
      "Open the Agents workspace from the sidebar. Use the registration action to create an agent and configure its identity and clearance level. Keep generated credentials secure.",
  },
  {
    question: "How do I register a tool?",
    answer:
      "Open Tools Registry to manage tool definitions. Configure the tool name, transport type, endpoint, HTTP method and input schema before activating it.",
  },
  {
    question: "How do policies work?",
    answer:
      "Policies define governance rules for agent access and tool execution. Create a policy, add its rules, review the configuration and activate it when ready.",
  },
  {
    question: "What are approval requests?",
    answer:
      "Some sensitive operations require administrator review. Open Approvals to inspect pending requests and approve or reject them according to your organization's rules.",
  },
  {
    question: "Where can I review security decisions?",
    answer:
      "Use Audit Logs to review recorded security events. The audit read interface depends on the backend audit listing endpoint being available.",
  },
  {
    question: "Why am I seeing an API connection error?",
    answer:
      "Check that the backend container is running, the frontend is using the correct same-origin API route, and your administrator session is still authenticated. A 401 usually means the session needs a new login; a 403 can indicate permission or CSRF validation issues.",
  },
];

const quickLinks = [
  {
    title: "Agent Management",
    description: "Register agents and manage identity and clearance.",
    href: "/agents",
    icon: Bot,
  },
  {
    title: "Tools Registry",
    description: "Manage registered tools and their configurations.",
    href: "/tools",
    icon: Wrench,
  },
  {
    title: "Policies",
    description: "Create policies and configure governance rules.",
    href: "/policies",
    icon: ShieldCheck,
  },
  {
    title: "Approvals",
    description: "Review and decide pending execution requests.",
    href: "/approvals",
    icon: ClipboardCheck,
  },
  {
    title: "Audit Logs",
    description: "Review security events and recorded decisions.",
    href: "/audit-logs",
    icon: FileText,
  },
  {
    title: "Settings",
    description: "Manage appearance and current session settings.",
    href: "/settings",
    icon: Settings,
  },
];

export default function HelpSupport() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaqs = faqs.filter((faq) =>
    `${faq.question} ${faq.answer}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
          <Activity size={13} />
          AgentGate Management
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Help & Support
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Find answers, learn how to use AgentGate and troubleshoot common issues.
        </p>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)]">
            <LifeBuoy size={32} />
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--primary)]">
              We're here to help
            </p>
            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
              Welcome to AgentGate Support
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Explore the platform guides, find answers to common questions
              and learn how to resolve common dashboard and API issues.
            </p>
          </div>
        </div>

        <div className="relative mt-7 flex flex-wrap gap-3">
          <a
            href="#faq"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          >
            <CircleHelp size={16} />
            Browse FAQs
          </a>

          <a
            href="#quick-links"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/40"
          >
            <BookOpen size={16} />
            Platform guides
          </a>
        </div>
      </section>

      {/* Quick links */}
      <section id="quick-links" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Platform guides</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Navigate directly to the workspace you need help with.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                    Open workspace
                    <ArrowRight
                      size={13}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="border-b border-[var(--border)] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <CircleHelp size={19} className="text-[var(--primary)]" />
                <h2 className="text-lg font-bold">
                  Frequently asked questions
                </h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Find quick answers about using AgentGate.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search questions..."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)] px-5 sm:px-6">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const originalIndex = faqs.indexOf(faq);
              const isOpen = openFaq === originalIndex;

              return (
                <div key={faq.question} className="py-4">
                  <button
                    onClick={() =>
                      setOpenFaq(isOpen ? null : originalIndex)
                    }
                    className="flex w-full items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={17}
                      className={`shrink-0 text-[var(--muted)] transition ${
                        isOpen ? "rotate-180 text-[var(--primary)]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="mt-3 max-w-4xl text-xs leading-6 text-[var(--muted)]">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Search
                size={25}
                className="mx-auto text-[var(--muted)]"
              />
              <p className="mt-3 text-sm font-semibold">
                No matching questions
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Try another search term.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-5 py-3 text-[10px] text-[var(--muted)] sm:px-6">
          {filteredFaqs.length} of {faqs.length} questions
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--soft-orange)] text-[var(--warning)]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Troubleshooting</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Common issues and things to check.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold">401 — Unauthorized</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Your administrator session may have expired. Sign in again.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold">403 — Forbidden</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Check administrator permissions and CSRF token validation.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold">Backend unavailable</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Check Docker Compose services and backend container health.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold">Page not updating</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Refresh the page and check the browser console for frontend errors.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Need more assistance?</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Prepare the details needed to investigate an issue.
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs leading-6 text-[var(--muted)]">
            If you encounter a problem, include the affected workspace,
            the action you performed, the exact error message and relevant
            backend logs when requesting assistance.
          </p>

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={15} className="text-[var(--primary)]" />
              Useful diagnostic information
            </div>
            <ul className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <li>• Browser and frontend error message</li>
              <li>• Backend HTTP status code</li>
              <li>• Docker Compose service status</li>
              <li>• Relevant backend logs</li>
            </ul>
          </div>

          <p className="mt-4 text-[10px] leading-5 text-[var(--muted)]">
            No support email or ticket service is configured in the current
            project, so this page does not send external support requests.
          </p>
        </div>
      </section>

      <footer className="pb-3 text-center text-[10px] text-[var(--muted)]">
        AgentGate Security Platform · Help & Support
      </footer>
    </div>
  );
}