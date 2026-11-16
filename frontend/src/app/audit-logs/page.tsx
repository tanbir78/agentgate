import DashboardShell from "@/components/layout/DashboardShell";
import AuditLogManagement from "@/components/dashboard/AuditLogManagement";

export default function AuditLogsPage() {
  return (
    <DashboardShell>
      <AuditLogManagement />
    </DashboardShell>
  );
}