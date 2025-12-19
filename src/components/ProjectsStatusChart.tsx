import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAppStore } from "@/context/StoreContext";

const statusColors = {
  pending: "hsl(var(--warning))",
  in_progress: "hsl(var(--primary))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  in_progress: "جاري العمل",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export function ProjectsStatusChart() {
  const { projects } = useAppStore();

  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    
    projects.forEach((project) => {
      const status = project.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      status,
    }));
  }, [projects]);

  const hasData = chartData.length > 0;

  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">حالة المشاريع</h2>
        <p className="text-sm text-muted-foreground">توزيع المشاريع حسب الحالة</p>
      </div>
      <div className="p-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusColors[entry.status as keyof typeof statusColors] || "hsl(var(--muted))"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value} مشروع`, ""]}
              />
              <Legend
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            لا توجد مشاريع لعرضها
          </div>
        )}
      </div>
    </div>
  );
}
