import { useState } from "react";
import { Plus, Search, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Project, projectStatuses } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const { projects, clients, departments, addProject, updateProject, deleteProject } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "", clientId: "", departmentId: "", budget: "", startDate: "", description: "", status: "pending" as Project["status"]
  });

  const filteredProjects = projects.filter(p => 
    p.name.includes(search) || p.client.includes(search)
  );

  const resetForm = () => {
    setFormData({ name: "", clientId: "", departmentId: "", budget: "", startDate: "", description: "", status: "pending" });
  };

  const handleAdd = () => {
    const client = clients.find(c => c.id === formData.clientId);
    const dept = departments.find(d => d.id === formData.departmentId);
    if (!client || !dept) return;
    
    addProject({
      name: formData.name,
      clientId: formData.clientId,
      client: client.name,
      departmentId: formData.departmentId,
      department: dept.name,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      description: formData.description,
      status: formData.status,
      progress: 0,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تم إضافة المشروع بنجاح" });
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    const client = clients.find(c => c.id === formData.clientId);
    const dept = departments.find(d => d.id === formData.departmentId);
    
    updateProject(selectedProject.id, {
      name: formData.name,
      clientId: formData.clientId,
      client: client?.name || selectedProject.client,
      departmentId: formData.departmentId,
      department: dept?.name || selectedProject.department,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      description: formData.description,
      status: formData.status,
    });
    setIsEditOpen(false);
    setSelectedProject(null);
    resetForm();
    toast({ title: "تم تحديث المشروع بنجاح" });
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    deleteProject(selectedProject.id);
    setIsDeleteOpen(false);
    setSelectedProject(null);
    toast({ title: "تم حذف المشروع", variant: "destructive" });
  };

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      departmentId: project.departmentId,
      budget: String(project.budget),
      startDate: project.startDate,
      description: project.description || "",
      status: project.status,
    });
    setIsEditOpen(true);
  };

  const openView = (project: Project) => {
    setSelectedProject(project);
    setIsViewOpen(true);
  };

  const openDelete = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const ProjectForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">اسم المشروع</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="أدخل اسم المشروع"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">العميل</label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">اختر العميل</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">القسم</label>
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">اختر القسم</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">الميزانية (ر.س)</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">تاريخ البدء</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الحالة</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {Object.entries(projectStatuses).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-24 px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="وصف المشروع..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>
          إلغاء
        </Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">المشاريع</h1>
            <p className="text-muted-foreground">إدارة جميع مشاريع الشركة</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في المشاريع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المشروع</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">العميل</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">القسم</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التقدم</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الحالة</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الميزانية</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((project, index) => (
                <tr key={project.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-card-foreground">{project.name}</div>
                    <div className="text-sm text-muted-foreground">بدء: {project.startDate}</div>
                  </td>
                  <td className="px-6 py-4 text-card-foreground">{project.client}</td>
                  <td className="px-6 py-4 text-card-foreground">{project.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="h-2 w-24" />
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={projectStatuses[project.status].color}>
                      {projectStatuses[project.status].label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-card-foreground">
                    {project.budget.toLocaleString()} ر.س
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openView(project)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(project)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(project)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة مشروع جديد">
        <ProjectForm onSubmit={handleAdd} submitText="إضافة المشروع" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedProject(null); resetForm(); }} title="تعديل المشروع">
        <ProjectForm onSubmit={handleEdit} submitText="حفظ التغييرات" />
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelectedProject(null); }} title="تفاصيل المشروع" size="lg">
        {selectedProject && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">اسم المشروع</p>
                <p className="font-semibold text-lg">{selectedProject.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge className={projectStatuses[selectedProject.status].color}>
                  {projectStatuses[selectedProject.status].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العميل</p>
                <p className="font-medium">{selectedProject.client}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">القسم</p>
                <p className="font-medium">{selectedProject.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الميزانية</p>
                <p className="font-medium text-primary">{selectedProject.budget.toLocaleString()} ر.س</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                <p className="font-medium">{selectedProject.startDate}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">نسبة الإنجاز</p>
              <div className="flex items-center gap-4">
                <Progress value={selectedProject.progress} className="h-3 flex-1" />
                <span className="font-bold text-lg">{selectedProject.progress}%</span>
              </div>
            </div>
            {selectedProject.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">الوصف</p>
                <p className="text-card-foreground">{selectedProject.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedProject(null); }}
        onConfirm={handleDelete}
        title="حذف المشروع"
        description={`هل أنت متأكد من حذف المشروع "${selectedProject?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default Projects;
