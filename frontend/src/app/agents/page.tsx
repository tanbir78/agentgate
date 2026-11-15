import DashboardShell from "@/components/layout/DashboardShell";
import FeaturePage from "@/components/ui/FeaturePage";

export default function AgentsPage() {
  return (
    <DashboardShell>
      <FeaturePage
        title="Agents"
        description="Register, monitor and manage AI agents."
        section="agents"
        features={["Agent registration", "Client identity management", "Agent clearance", "Active agent monitoring"]}
      />
    </DashboardShell>
  );
}
