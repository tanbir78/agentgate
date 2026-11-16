import DashboardShell from "@/components/layout/DashboardShell";
import ApprovalManagement from "@/components/dashboard/ApprovalManagement";

export default function ApprovalsPage() {
  return (
    <DashboardShell>
      <ApprovalManagement />
    </DashboardShell>
  );
}