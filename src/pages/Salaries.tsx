import { Download, Search, Calendar } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const employees = [
  {
    id: 1,
    name: "أحمد محمد العلي",
    department: "تطوير التطبيقات",
    position: "مطور أول",
    salary: "18,000 ر.س",
    status: "مدفوع",
    statusColor: "bg-success text-success-foreground",
    initials: "أ",
  },
  {
    id: 2,
    name: "فاطمة أحمد السالم",
    department: "التصميم",
    position: "مصمم UI/UX",
    salary: "14,000 ر.س",
    status: "مدفوع",
    statusColor: "bg-success text-success-foreground",
    initials: "ف",
  },
  {
    id: 3,
    name: "خالد عبدالله الحربي",
    department: "تطوير الويب",
    position: "مطور Full Stack",
    salary: "16,000 ر.س",
    status: "قيد المعالجة",
    statusColor: "bg-warning text-warning-foreground",
    initials: "خ",
  },
  {
    id: 4,
    name: "نورة سعد القحطاني",
    department: "إدارة المشاريع",
    position: "مدير مشاريع",
    salary: "20,000 ر.س",
    status: "مدفوع",
    statusColor: "bg-success text-success-foreground",
    initials: "ن",
  },
  {
    id: 5,
    name: "محمد علي الشهري",
    department: "ضمان الجودة",
    position: "مهندس اختبار",
    salary: "12,000 ر.س",
    status: "معلق",
    statusColor: "bg-destructive text-destructive-foreground",
    initials: "م",
  },
];

const Salaries = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الرواتب</h1>
            <p className="text-muted-foreground">إدارة رواتب الموظفين والمكافآت</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              ديسمبر 2024
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">156,000 ر.س</p>
            <p className="text-sm text-success mt-2">38 موظف</p>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground">تم الدفع</p>
            <p className="text-2xl font-bold text-success mt-1">132,000 ر.س</p>
            <p className="text-sm text-muted-foreground mt-2">32 موظف</p>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6">
            <p className="text-sm text-muted-foreground">قيد الانتظار</p>
            <p className="text-2xl font-bold text-warning mt-1">24,000 ر.س</p>
            <p className="text-sm text-muted-foreground mt-2">6 موظفين</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث عن موظف..."
            className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Employees Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  الموظف
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  القسم
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  المنصب
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  الراتب
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className="hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-card-foreground">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-card-foreground">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 text-card-foreground">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 font-semibold text-card-foreground">
                    {employee.salary}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={employee.statusColor}>{employee.status}</Badge>
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

export default Salaries;
