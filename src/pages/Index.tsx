import { useState, useEffect } from "react";
import {
  FolderKanban,
  Users,
  Building2,
  TrendingUp,
  Landmark,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RecentProjects } from "@/components/RecentProjects";
import { RecentClients } from "@/components/RecentClients";
import { RevenueChart } from "@/components/RevenueChart";
import { useAppStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { projects, clients, departments, employees, getStats, treasuryAccounts, loading, refetch } = useAppStore();
  const stats = getStats();
  const totalBalance = treasuryAccounts.reduce((s, a) => s + Number(a.balance), 0);
  const activeEmployees = employees.filter(e => e.status === "active").length;

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            title="الموظفين النشطين"
            value={activeEmployees}
            icon={UserCheck}
            iconColor="bg-chart-3/10 text-chart-3"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={stats.totalExpenses > 0 ? `-$${stats.totalExpenses.toLocaleString()} مصروفات` : undefined}
            changeType={stats.totalRevenue > stats.totalExpenses ? "positive" : "negative"}
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
