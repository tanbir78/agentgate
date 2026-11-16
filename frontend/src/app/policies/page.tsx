import DashboardShell from "@/components/layout/DashboardShell";
import PolicyManagement from "@/components/dashboard/PolicyManagement";

export default function PoliciesPage() {
  return (
    <DashboardShell>
      <PolicyManagement />
    </DashboardShell>
  );
}