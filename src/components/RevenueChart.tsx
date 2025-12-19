import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "يناير", revenue: 45000 },
  { month: "فبراير", revenue: 52000 },
  { month: "مارس", revenue: 48000 },
  { month: "أبريل", revenue: 61000 },
  { month: "مايو", revenue: 55000 },
  { month: "يونيو", revenue: 67000 },
  { month: "يوليو", revenue: 72000 },
];

export function RevenueChart() {
  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">الإيرادات الشهرية</h2>
        <p className="text-sm text-muted-foreground">نظرة عامة على إيرادات الأشهر السبعة الماضية</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(216, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(216, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
              tickFormatter={(value) => `${value / 1000}ك`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px hsl(220, 25%, 10%, 0.1)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "الإيرادات"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(216, 100%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
