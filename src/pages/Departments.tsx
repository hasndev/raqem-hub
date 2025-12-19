import { Plus, Users, FolderKanban } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";

const departments = [
  {
    id: 1,
    name: "تطوير التطبيقات",
    description: "تطوير تطبيقات الهاتف المحمول iOS و Android",
    employees: 8,
    projects: 5,
    color: "bg-primary",
  },
  {
    id: 2,
    name: "تطوير الويب",
    description: "تطوير مواقع وتطبيقات الويب",
    employees: 12,
    projects: 8,
    color: "bg-success",
  },
  {
    id: 3,
    name: "التصميم",
    description: "تصميم واجهات المستخدم وتجربة المستخدم",
    employees: 5,
    projects: 10,
    color: "bg-warning",
  },
  {
    id: 4,
    name: "ضمان الجودة",
    description: "اختبار وضمان جودة البرمجيات",
    employees: 4,
    projects: 12,
    color: "bg-chart-4",
  },
  {
    id: 5,
    name: "إدارة المشاريع",
    description: "إدارة وتنسيق المشاريع مع العملاء",
    employees: 3,
    projects: 15,
    color: "bg-chart-5",
  },
  {
    id: 6,
    name: "الدعم الفني",
    description: "دعم وصيانة الأنظمة والتطبيقات",
    employees: 6,
    projects: 20,
    color: "bg-accent-foreground",
  },
];

const Departments = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الأقسام</h1>
            <p className="text-muted-foreground">إدارة أقسام الشركة والفرق</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            قسم جديد
          </Button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div
              key={dept.id}
              className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-soft transition-shadow duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 ${dept.color}`} />
              <div className="p-6">
                <h3 className="text-lg font-bold text-card-foreground">{dept.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{dept.description}</p>
                <div className="mt-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{dept.employees}</p>
                      <p className="text-xs text-muted-foreground">موظف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-lg">
                      <FolderKanban className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-card-foreground">{dept.projects}</p>
                      <p className="text-xs text-muted-foreground">مشروع</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
