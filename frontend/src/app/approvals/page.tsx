import DashboardShell from "@/components/layout/DashboardShell";
import FeaturePage from "@/components/ui/FeaturePage";

export default function ApprovalsPage() {
  return (
    <DashboardShell>
      <FeaturePage
        title="Approvals"
        description="Review and manage sensitive tool execution requests."
        section="approvals"
        features={[
          "Pending requests",
          "Approve requests",
          "Reject requests",
          "Approval history",
        ]}
      />
    </DashboardShell>
  );
}

