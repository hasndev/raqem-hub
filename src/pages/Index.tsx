import {
  FolderKanban,
  Users,
  TrendingUp,
  TrendingDown,
  Landmark,
  RefreshCw,
  Wallet,
  CalendarClock,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { RecentProjects } from "@/components/RecentProjects";
import { RecentClients } from "@/components/RecentClients";
import { RevenueChart } from "@/components/RevenueChart";
import { ProjectsStatusChart } from "@/components/ProjectsStatusChart";
import { useAppStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { projects, clients, getStats, loading, refetch } = useAppStore();
  const { isAdmin, hasRole } = useAuth();
  const stats = getStats();
  const netBalance = stats.totalRevenue - stats.totalExpenses;

  const isSupervisor = hasRole("supervisor");
  const isAccountant = hasRole("accountant");

  // Calculate role-specific stats
  const activeProjects = projects.filter(p => p.status === "in_progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const pendingProjects = projects.filter(p => p.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">
              {isAdmin && "مرحباً بك في نظام إدارة رقيم التقنية"}
              {!isAdmin && isSupervisor && "لوحة تحكم المشرف"}
              {!isAdmin && !isSupervisor && isAccountant && "لوحة تحكم المحاسب"}
            </p>
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

        {/* Admin Dashboard */}
        {isAdmin && (
          <>
            {/* Stats Grid - 5 Essential Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatsCard
                title="إجمالي المشاريع"
                value={projects.length}
                change={`${activeProjects} جاري`}
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
                value={`$${netBalance.toLocaleString()}`}
                changeType={netBalance >= 0 ? "positive" : "negative"}
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
          </>
        )}

        {/* Supervisor Dashboard */}
        {!isAdmin && isSupervisor && (
          <>
            {/* Stats Grid - Supervisor focused cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="إجمالي المشاريع"
                value={projects.length}
                change={`${activeProjects} جاري`}
                changeType="positive"
                icon={FolderKanban}
                iconColor="bg-primary/10 text-primary"
              />
              <StatsCard
                title="مشاريع قيد التنفيذ"
                value={activeProjects}
                icon={Clock}
                iconColor="bg-warning/10 text-warning"
              />
              <StatsCard
                title="مشاريع مكتملة"
                value={completedProjects}
                icon={CheckCircle2}
                iconColor="bg-success/10 text-success"
              />
              <StatsCard
                title="إجمالي العملاء"
                value={clients.length}
                icon={Users}
                iconColor="bg-primary/10 text-primary"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectsStatusChart />
              <div className="bg-card rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold mb-4">ملخص المشاريع</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">قيد الانتظار</span>
                    <span className="font-bold text-warning">{pendingProjects}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">قيد التنفيذ</span>
                    <span className="font-bold text-primary">{activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">مكتملة</span>
                    <span className="font-bold text-success">{completedProjects}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <RecentProjects />

            {/* Clients */}
            <RecentClients />
          </>
        )}

        {/* Accountant Dashboard */}
        {!isAdmin && !isSupervisor && isAccountant && (
          <>
            {/* Stats Grid - Accountant focused cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                title="صافي الخزينة"
                value={`$${netBalance.toLocaleString()}`}
                changeType={netBalance >= 0 ? "positive" : "negative"}
                icon={Landmark}
                iconColor="bg-primary/10 text-primary"
              />
              <StatsCard
                title="عدد المشاريع"
                value={projects.length}
                icon={FolderKanban}
                iconColor="bg-muted text-muted-foreground"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <div className="bg-card rounded-xl shadow-card p-6">
                <h3 className="text-lg font-semibold mb-4">ملخص مالي</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <span className="text-muted-foreground">الإيرادات</span>
                    <span className="font-bold text-success">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="text-muted-foreground">المصروفات</span>
                    <span className="font-bold text-destructive">${stats.totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${netBalance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <span className="text-muted-foreground">الصافي</span>
                    <span className={`font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${netBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
