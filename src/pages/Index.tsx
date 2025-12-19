import {
  FolderKanban,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RecentProjects } from "@/components/RecentProjects";
import { RecentClients } from "@/components/RecentClients";
import { RevenueChart } from "@/components/RevenueChart";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة رقيم التقنية</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="إجمالي المشاريع"
            value={24}
            change="+3 هذا الشهر"
            changeType="positive"
            icon={FolderKanban}
            iconColor="bg-primary/10 text-primary"
          />
          <StatsCard
            title="العملاء النشطين"
            value={18}
            change="+2 عميل جديد"
            changeType="positive"
            icon={Users}
            iconColor="bg-success/10 text-success"
          />
          <StatsCard
            title="الأقسام"
            value={6}
            icon={Building2}
            iconColor="bg-warning/10 text-warning"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value="400,000 ر.س"
            change="+12% من الشهر الماضي"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-chart-4/10 text-chart-4"
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
