import DashboardShell from "@/components/layout/DashboardShell";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default function Home() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}
