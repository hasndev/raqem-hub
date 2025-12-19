import {
  FolderKanban,
  Users,
  Building2,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RecentProjects } from "@/components/RecentProjects";
import { RecentClients } from "@/components/RecentClients";
import { RevenueChart } from "@/components/RevenueChart";
import { useAppStore } from "@/context/StoreContext";

const Index = () => {
  const { projects, clients, departments, getStats, treasuryAccounts } = useAppStore();
  const stats = getStats();
  const totalBalance = treasuryAccounts.reduce((s, a) => s + a.balance, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة رقيم التقنية</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="إجمالي المشاريع"
            value={projects.length}
            change={`${projects.filter(p => p.status === "in_progress").length} جاري`}
            changeType="positive"
            icon={FolderKanban}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="العملاء"
            value={clients.length}
            icon={Users}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="الأقسام"
            value={departments.length}
            icon={Building2}
            iconColor="bg-warning/10 text-warning"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change="+12% من الشهر الماضي"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-chart-4/10 text-chart-4"
          />
          <StatsCard
            title="رصيد الخزينة"
            value={`$${totalBalance.toLocaleString()}`}
            icon={Landmark}
            iconColor="bg-chart-5/10 text-chart-5"
          />
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <RecentProjects />
        </div>

        {/* Clients */}
        <RecentClients />
      </div>
    </DashboardLayout>
  );
};

export default Index;
