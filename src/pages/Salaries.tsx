import { useState } from "react";
import { Download, Search, Calendar, Pencil } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { useAppStore } from "@/context/StoreContext";
import { useToast } from "@/hooks/use-toast";

const Salaries = () => {
  const { employees, updateEmployee } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-12");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<typeof employees[0] | null>(null);
  const [editSalary, setEditSalary] = useState("");

  const filteredEmployees = employees.filter(e => e.name.includes(search) || e.department?.name?.includes(search));
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const activeEmployees = employees.filter(e => e.status === "active");

  const handleSalaryUpdate = async () => { if (!selectedEmp) return; await updateEmployee(selectedEmp.id, { salary: Number(editSalary) }); setIsEditOpen(false); setSelectedEmp(null); toast({ title: "تم تحديث الراتب بنجاح" }); };
  const openEdit = (emp: typeof employees[0]) => { setSelectedEmp(emp); setEditSalary(String(emp.salary)); setIsEditOpen(true); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">الرواتب</h1><p className="text-muted-foreground">إدارة رواتب الموظفين والمكافآت</p></div><div className="flex items-center gap-3"><div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3"><Calendar className="w-4 h-4 text-muted-foreground" /><input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-10 bg-transparent text-sm focus:outline-none" /></div><Button className="gap-2"><Download className="w-4 h-4" />تصدير التقرير</Button></div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up"><div className="bg-card rounded-xl shadow-card p-6"><p className="text-sm text-muted-foreground">إجمالي الرواتب</p><p className="text-2xl font-bold text-card-foreground mt-1">${totalSalaries.toLocaleString()}</p><p className="text-sm text-success mt-2">{employees.length} موظف</p></div><div className="bg-card rounded-xl shadow-card p-6"><p className="text-sm text-muted-foreground">الموظفين النشطين</p><p className="text-2xl font-bold text-success mt-1">{activeEmployees.length}</p><p className="text-sm text-muted-foreground mt-2">${activeEmployees.reduce((s, e) => s + e.salary, 0).toLocaleString()}</p></div><div className="bg-card rounded-xl shadow-card p-6"><p className="text-sm text-muted-foreground">متوسط الراتب</p><p className="text-2xl font-bold text-primary mt-1">${employees.length > 0 ? Math.round(totalSalaries / employees.length).toLocaleString() : 0}</p></div></div>
        <div className="relative max-w-md animate-slide-up"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="بحث عن موظف..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm" /></div>
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <table className="w-full"><thead className="bg-muted/50"><tr><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الموظف</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">القسم</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المنصب</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الراتب</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الحالة</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">إجراء</th></tr></thead>
          <tbody className="divide-y divide-border">{filteredEmployees.map((employee, index) => (
            <tr key={employee.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar className="bg-primary"><AvatarFallback className="bg-primary text-primary-foreground">{employee.name.charAt(0)}</AvatarFallback></Avatar><span className="font-semibold text-card-foreground">{employee.name}</span></div></td>
              <td className="px-6 py-4 text-card-foreground">{employee.department?.name || "-"}</td>
              <td className="px-6 py-4 text-card-foreground">{employee.position || "-"}</td>
              <td className="px-6 py-4 font-semibold text-card-foreground">${employee.salary.toLocaleString()}</td>
              <td className="px-6 py-4"><Badge className={employee.status === "active" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{employee.status === "active" ? "نشط" : "غير نشط"}</Badge></td>
              <td className="px-6 py-4"><Button variant="ghost" size="icon" onClick={() => openEdit(employee)}><Pencil className="w-4 h-4" /></Button></td>
            </tr>
          ))}</tbody></table>
        </div>
      </div>
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedEmp(null); }} title="تعديل الراتب" size="sm"><div className="space-y-4"><div><p className="text-sm text-muted-foreground">الموظف</p><p className="font-semibold">{selectedEmp?.name}</p></div><div><label className="block text-sm font-medium mb-2">الراتب الجديد ($)</label><input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div><div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => { setIsEditOpen(false); setSelectedEmp(null); }}>إلغاء</Button><Button onClick={handleSalaryUpdate}>حفظ التغييرات</Button></div></div></Modal>
    </DashboardLayout>
  );
};

export default Salaries;