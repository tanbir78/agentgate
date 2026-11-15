
import DashboardShell from "@/components/layout/DashboardShell";
import FeaturePage from "@/components/ui/FeaturePage";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <FeaturePage
        title="Settings"
        description="Manage your AgentGate platform configuration."
        section="settings"
        features={[
          "Account preferences",
          "Appearance settings",
          "Security configuration",
          "Platform information",
        ]}
      />
    </DashboardShell>
  );
}
