import { useState } from "react";
import { Plus, Users, FolderKanban, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Department } from "@/types";
import { useToast } from "@/hooks/use-toast";

const colorOptions = [
  { value: "bg-primary", label: "أزرق" },
  { value: "bg-success", label: "أخضر" },
  { value: "bg-warning", label: "برتقالي" },
  { value: "bg-chart-4", label: "بنفسجي" },
  { value: "bg-chart-5", label: "وردي" },
  { value: "bg-destructive", label: "أحمر" },
];

const Departments = () => {
  const { departments, employees, projects, addDepartment, updateDepartment, deleteDepartment } = useAppStore();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", color: "bg-primary" });

  const getDeptEmployees = (deptId: string) => employees.filter(e => e.department_id === deptId).length;
  const getDeptProjects = (deptId: string) => projects.filter(p => p.department_id === deptId).length;

  const resetForm = () => setFormData({ name: "", description: "", color: "bg-primary" });

  const handleAdd = async () => {
    await addDepartment({ name: formData.name, description: formData.description, color: formData.color, manager_id: null });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تم إضافة القسم بنجاح" });
  };

  const handleEdit = async () => {
    if (!selectedDept) return;
    await updateDepartment(selectedDept.id, formData);
    setIsEditOpen(false);
    setSelectedDept(null);
    resetForm();
    toast({ title: "تم تحديث القسم" });
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    await deleteDepartment(selectedDept.id);
    setIsDeleteOpen(false);
    setSelectedDept(null);
    toast({ title: "تم حذف القسم", variant: "destructive" });
  };

  const openEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({ name: dept.name, description: dept.description || "", color: dept.color });
    setIsEditOpen(true);
  };

  const DeptForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">اسم القسم</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">اللون</label>
        <div className="flex gap-3">
          {colorOptions.map(c => (
            <button key={c.value} type="button" onClick={() => setFormData({ ...formData, color: c.value })} className={`w-10 h-10 rounded-lg ${c.value} ${formData.color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""}`} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>إلغاء</Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الأقسام</h1>
            <p className="text-muted-foreground">إدارة أقسام الشركة والفرق</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}><Plus className="w-4 h-4" />قسم جديد</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div key={dept.id} className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-soft transition-shadow duration-300 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`h-2 ${dept.color}`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-card-foreground">{dept.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedDept(dept); setIsDeleteOpen(true); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{dept.description}</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2"><div className="p-2 bg-muted rounded-lg"><Users className="w-4 h-4 text-muted-foreground" /></div><div><p className="text-lg font-bold text-card-foreground">{getDeptEmployees(dept.id)}</p><p className="text-xs text-muted-foreground">موظف</p></div></div>
                  <div className="flex items-center gap-2"><div className="p-2 bg-muted rounded-lg"><FolderKanban className="w-4 h-4 text-muted-foreground" /></div><div><p className="text-lg font-bold text-card-foreground">{getDeptProjects(dept.id)}</p><p className="text-xs text-muted-foreground">مشروع</p></div></div>
                </div>
              </div>
            </div>
          ))}
          {departments.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">لا توجد أقسام</p>}
        </div>
      </div>
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة قسم جديد"><DeptForm onSubmit={handleAdd} submitText="إضافة القسم" /></Modal>
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedDept(null); resetForm(); }} title="تعديل القسم"><DeptForm onSubmit={handleEdit} submitText="حفظ التغييرات" /></Modal>
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setSelectedDept(null); }} onConfirm={handleDelete} title="حذف القسم" description={`هل أنت متأكد من حذف القسم "${selectedDept?.name}"؟`} confirmText="حذف" variant="destructive" />
    </DashboardLayout>
  );
};

export default Departments;