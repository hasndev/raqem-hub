import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: 1,
    name: "تطبيق إدارة المخزون",
    client: "شركة الفجر",
    progress: 75,
    status: "جاري",
    statusColor: "bg-primary text-primary-foreground",
  },
  {
    id: 2,
    name: "نظام حجز المواعيد",
    client: "عيادات النخيل",
    progress: 100,
    status: "مكتمل",
    statusColor: "bg-success text-success-foreground",
  },
  {
    id: 3,
    name: "منصة التجارة الإلكترونية",
    client: "متجر السعادة",
    progress: 45,
    status: "جاري",
    statusColor: "bg-primary text-primary-foreground",
  },
  {
    id: 4,
    name: "تطبيق توصيل الطعام",
    client: "مطاعم الريف",
    progress: 20,
    status: "قيد البدء",
    statusColor: "bg-warning text-warning-foreground",
  },
];

export function RecentProjects() {
  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">أحدث المشاريع</h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{project.client}</p>
                </div>
                <Badge className={project.statusColor}>{project.status}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={project.progress} className="h-2 flex-1" />
                <span className="text-sm font-medium text-muted-foreground w-12 text-left">
                  {project.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
