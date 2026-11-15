import DashboardShell from "@/components/layout/DashboardShell";
import FeaturePage from "@/components/ui/FeaturePage";

export default function AuditLogsPage() {
  return (
    <DashboardShell>
      <FeaturePage
        title="Audit Logs"
        description="Review security decisions and recorded system events."
        section="audit"
        features={["Security event history", "Actor information", "Policy decisions", "Audit event details"]}
      />
    </DashboardShell>
  );
}
