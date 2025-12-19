import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Employee, employeeStatuses } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Employees = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", department_id: "", position: "", salary: "", start_date: "", status: "active" as Employee["status"] });

  const filteredEmployees = employees.filter(e => e.name.includes(search) || e.position?.includes(search));
  const resetForm = () => setFormData({ name: "", email: "", phone: "", department_id: "", position: "", salary: "", start_date: "", status: "active" });

  const handleAdd = async () => {
    await addEmployee({ name: formData.name, email: formData.email || null, phone: formData.phone || null, department_id: formData.department_id || null, position: formData.position || null, salary: Number(formData.salary), start_date: formData.start_date || null, status: formData.status, user_id: null });
    setIsAddOpen(false); resetForm(); toast({ title: "تم إضافة الموظف بنجاح" });
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;
    await updateEmployee(selectedEmployee.id, { name: formData.name, email: formData.email || null, phone: formData.phone || null, department_id: formData.department_id || null, position: formData.position || null, salary: Number(formData.salary), start_date: formData.start_date || null, status: formData.status });
    setIsEditOpen(false); setSelectedEmployee(null); resetForm(); toast({ title: "تم تحديث بيانات الموظف" });
  };

  const handleDelete = async () => { if (!selectedEmployee) return; await deleteEmployee(selectedEmployee.id); setIsDeleteOpen(false); setSelectedEmployee(null); toast({ title: "تم حذف الموظف", variant: "destructive" }); };

  const openEdit = (emp: Employee) => { setSelectedEmployee(emp); setFormData({ name: emp.name, email: emp.email || "", phone: emp.phone || "", department_id: emp.department_id || "", position: emp.position || "", salary: String(emp.salary), start_date: emp.start_date || "", status: emp.status }); setIsEditOpen(true); };

  const EmpForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium mb-2">الاسم الكامل</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">البريد الإلكتروني</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div><div><label className="block text-sm font-medium mb-2">رقم الهاتف</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">القسم</label><select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"><option value="">اختر القسم</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div><div><label className="block text-sm font-medium mb-2">المنصب</label><input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">الراتب ($)</label><input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div><div><label className="block text-sm font-medium mb-2">تاريخ التوظيف</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm" /></div></div>
      <div><label className="block text-sm font-medium mb-2">الحالة</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee["status"] })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm">{Object.entries(employeeStatuses).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}</select></div>
      <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>إلغاء</Button><Button onClick={onSubmit}>{submitText}</Button></div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in"><div><h1 className="text-2xl font-bold text-foreground">الموظفين</h1><p className="text-muted-foreground">إدارة بيانات الموظفين</p></div><Button className="gap-2" onClick={() => setIsAddOpen(true)}><UserPlus className="w-4 h-4" />موظف جديد</Button></div>
        <div className="relative max-w-md animate-slide-up"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="بحث عن موظف..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm" /></div>
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <table className="w-full"><thead className="bg-muted/50"><tr><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الموظف</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">القسم</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المنصب</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الراتب</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الحالة</th><th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الإجراءات</th></tr></thead>
          <tbody className="divide-y divide-border">{filteredEmployees.map((emp, index) => (
            <tr key={emp.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar className="bg-primary"><AvatarFallback className="bg-primary text-primary-foreground">{emp.name.charAt(0)}</AvatarFallback></Avatar><div><p className="font-semibold text-card-foreground">{emp.name}</p><p className="text-sm text-muted-foreground">{emp.email}</p></div></div></td>
              <td className="px-6 py-4 text-card-foreground">{emp.department?.name || "-"}</td>
              <td className="px-6 py-4 text-card-foreground">{emp.position || "-"}</td>
              <td className="px-6 py-4 font-semibold text-card-foreground">${emp.salary.toLocaleString()}</td>
              <td className="px-6 py-4"><Badge className={employeeStatuses[emp.status].color}>{employeeStatuses[emp.status].label}</Badge></td>
              <td className="px-6 py-4"><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setIsViewOpen(true); }}><Eye className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => openEdit(emp)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></td>
            </tr>
          ))}</tbody></table>
          {filteredEmployees.length === 0 && <p className="text-center text-muted-foreground py-8">لا يوجد موظفين</p>}
        </div>
      </div>
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة موظف جديد"><EmpForm onSubmit={handleAdd} submitText="إضافة الموظف" /></Modal>
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedEmployee(null); resetForm(); }} title="تعديل بيانات الموظف"><EmpForm onSubmit={handleEdit} submitText="حفظ التغييرات" /></Modal>
      <Modal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelectedEmployee(null); }} title="تفاصيل الموظف" size="lg">{selectedEmployee && (<div className="space-y-6"><div className="flex items-center gap-4"><Avatar className="bg-primary w-20 h-20 text-3xl"><AvatarFallback className="bg-primary text-primary-foreground">{selectedEmployee.name.charAt(0)}</AvatarFallback></Avatar><div><h3 className="text-xl font-bold">{selectedEmployee.name}</h3><p className="text-muted-foreground">{selectedEmployee.position}</p><Badge className={employeeStatuses[selectedEmployee.status].color + " mt-2"}>{employeeStatuses[selectedEmployee.status].label}</Badge></div></div><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">البريد الإلكتروني</p><p className="font-medium">{selectedEmployee.email || "-"}</p></div><div><p className="text-sm text-muted-foreground">رقم الهاتف</p><p className="font-medium">{selectedEmployee.phone || "-"}</p></div><div><p className="text-sm text-muted-foreground">القسم</p><p className="font-medium">{selectedEmployee.department?.name || "-"}</p></div><div><p className="text-sm text-muted-foreground">تاريخ التوظيف</p><p className="font-medium">{selectedEmployee.start_date || "-"}</p></div><div><p className="text-sm text-muted-foreground">الراتب الشهري</p><p className="font-bold text-xl text-primary">${selectedEmployee.salary.toLocaleString()}</p></div></div></div>)}</Modal>
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelectedEmployee(null); }} onConfirm={handleDelete} title="حذف الموظف" description={`هل أنت متأكد من حذف الموظف "${selectedEmployee?.name}"؟`} confirmText="حذف" variant="destructive" />
    </DashboardLayout>
  );
};

export default Employees;