import { Plus, Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: 1,
    name: "تطبيق إدارة المخزون",
    client: "شركة الفجر",
    department: "تطوير التطبيقات",
    progress: 75,
    status: "جاري",
    statusColor: "bg-primary text-primary-foreground",
    startDate: "2024-01-15",
    budget: "50,000 ر.س",
  },
  {
    id: 2,
    name: "نظام حجز المواعيد",
    client: "عيادات النخيل",
    department: "تطوير الويب",
    progress: 100,
    status: "مكتمل",
    statusColor: "bg-success text-success-foreground",
    startDate: "2023-11-01",
    budget: "35,000 ر.س",
  },
  {
    id: 3,
    name: "منصة التجارة الإلكترونية",
    client: "متجر السعادة",
    department: "تطوير الويب",
    progress: 45,
    status: "جاري",
    statusColor: "bg-primary text-primary-foreground",
    startDate: "2024-02-01",
    budget: "80,000 ر.س",
  },
  {
    id: 4,
    name: "تطبيق توصيل الطعام",
    client: "مطاعم الريف",
    department: "تطوير التطبيقات",
    progress: 20,
    status: "قيد البدء",
    statusColor: "bg-warning text-warning-foreground",
    startDate: "2024-03-01",
    budget: "60,000 ر.س",
  },
  {
    id: 5,
    name: "لوحة تحكم إدارية",
    client: "شركة البناء المتقدم",
    department: "تطوير الويب",
    progress: 90,
    status: "جاري",
    statusColor: "bg-primary text-primary-foreground",
    startDate: "2024-01-01",
    budget: "45,000 ر.س",
  },
];

const Projects = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">المشاريع</h1>
            <p className="text-muted-foreground">إدارة جميع مشاريع الشركة</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في المشاريع..."
              className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            تصفية
          </Button>
        </div>

        {/* Projects Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  المشروع
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  العميل
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  القسم
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  التقدم
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  الحالة
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  الميزانية
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-card-foreground">
                      {project.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      بدء: {project.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-card-foreground">
                    {project.client}
                  </td>
                  <td className="px-6 py-4 text-card-foreground">
                    {project.department}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="h-2 w-24" />
                      <span className="text-sm text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={project.statusColor}>{project.status}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-card-foreground">
                    {project.budget}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
