import { useAppStore } from "@/context/StoreContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { projectStatuses } from "@/types";

export function RecentProjects() {
  const { projects } = useAppStore();
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">أحدث المشاريع</h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {recentProjects.map((project, index) => (
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
                <Badge className={projectStatuses[project.status].color}>
                  {projectStatuses[project.status].label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={project.progress} className="h-2 flex-1" />
                <span className="text-sm font-medium text-muted-foreground w-12 text-left">
                  {project.progress}%
                </span>
              </div>
            </div>
          ))}
          {recentProjects.length === 0 && (
            <p className="text-center text-muted-foreground py-4">لا توجد مشاريع</p>
          )}
        </div>
      </div>
    </div>
  );
}
