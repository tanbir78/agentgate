import DashboardShell from "@/components/layout/DashboardShell";
import AgentManagement from "@/components/dashboard/AgentManagement";

export default function AgentsPage() {
  return (
    <DashboardShell>
      <AgentManagement />
    </DashboardShell>
  );
}