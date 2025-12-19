import {
  FolderKanban,
  Users,
  TrendingUp,
  TrendingDown,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RecentProjects } from "@/components/RecentProjects";
import { RecentClients } from "@/components/RecentClients";
import { RevenueChart } from "@/components/RevenueChart";
import { ProjectsStatusChart } from "@/components/ProjectsStatusChart";
import { useAppStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { projects, clients, getStats, treasuryAccounts, loading, refetch } = useAppStore();
  const stats = getStats();
  const totalBalance = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً بك في نظام إدارة رقيم التقنية</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Stats Grid - 5 Essential Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="إجمالي المشاريع"
            value={projects.length}
            change={`${projects.filter(p => p.status === "in_progress").length} جاري`}
            changeType="positive"
            icon={FolderKanban}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="إجمالي العملاء"
            value={clients.length}
            icon={Users}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="إجمالي المصروفات"
            value={`$${stats.totalExpenses.toLocaleString()}`}
            changeType="negative"
            icon={TrendingDown}
            iconColor="bg-destructive/10 text-destructive"
          />
          <StatsCard
            title="الخزينة"
            value={`$${totalBalance.toLocaleString()}`}
            icon={Landmark}
            iconColor="bg-primary/10 text-primary"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <ProjectsStatusChart />
        </div>

        {/* Recent Projects */}
        <RecentProjects />

        {/* Clients */}
        <RecentClients />
      </div>
    </DashboardLayout>
  );
};

export default Index;
