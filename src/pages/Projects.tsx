import { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, Pencil, Trash2, Users, ListTodo, 
  Target, Clock, Calendar, AlertCircle, CheckCircle2,
  UserPlus, PlayCircle, PauseCircle, XCircle
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/context/StoreContext";
import { Project, projectStatuses } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectAssignment {
  id: string;
  project_id: string;
  employee_id: string;
  role: string;
  assigned_at: string;
  hours_allocated: number;
  is_lead: boolean;
}

interface ProjectTask {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  estimated_hours: number;
  actual_hours: number;
  due_date: string | null;
  completed_at: string | null;
}

interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: string;
}

const taskStatuses = {
  pending: { label: "قيد الانتظار", color: "bg-warning text-warning-foreground", icon: Clock },
  in_progress: { label: "جاري العمل", color: "bg-primary text-primary-foreground", icon: PlayCircle },
  completed: { label: "مكتمل", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-destructive text-destructive-foreground", icon: XCircle },
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/20 text-warning",
  high: "bg-orange-500/20 text-orange-600",
  urgent: "bg-destructive/20 text-destructive",
};

const priorityLabels = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  urgent: "عاجلة",
};

const Projects = () => {
  const { projects, clients, departments, employees, addProject, updateProject, deleteProject } = useAppStore();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Team management
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ employee_id: "", role: "developer", hours_allocated: "", is_lead: false });
  
  // Tasks management
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", assigned_to: "", status: "pending", 
    priority: "medium", estimated_hours: "", due_date: ""
  });
  
  // Milestones
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", due_date: "" });

  const [formData, setFormData] = useState({
    name: "", client_id: "", department_id: "", budget: "", 
    start_date: "", end_date: "", description: "", 
    status: "pending" as Project["status"], priority: "medium"
  });

  // Fetch project details when a project is selected
  useEffect(() => {
    if (selectedProject && isViewOpen) {
      fetchProjectDetails(selectedProject.id);
    }
  }, [selectedProject, isViewOpen]);

  const fetchProjectDetails = async (projectId: string) => {
    const [
      { data: assignmentsData },
      { data: tasksData },
      { data: milestonesData }
    ] = await Promise.all([
      supabase.from("project_assignments").select("*").eq("project_id", projectId),
      supabase.from("project_tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
      supabase.from("project_milestones").select("*").eq("project_id", projectId).order("due_date")
    ]);
    
    setAssignments((assignmentsData || []) as ProjectAssignment[]);
    setTasks((tasksData || []) as ProjectTask[]);
    setMilestones((milestonesData || []) as ProjectMilestone[]);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.includes(search) || p.client?.name?.includes(search);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ 
      name: "", client_id: "", department_id: "", budget: "", 
      start_date: "", end_date: "", description: "", status: "pending", priority: "medium" 
    });
  };

  const handleAdd = async () => {
    await addProject({
      name: formData.name,
      client_id: formData.client_id || null,
      department_id: formData.department_id || null,
      budget: Number(formData.budget) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description || null,
      status: formData.status,
      progress: 0,
      priority: formData.priority as any,
      estimated_hours: 0,
      actual_hours: 0,
      notes: null,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تم إضافة المشروع بنجاح" });
  };

  const handleEdit = async () => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, {
      name: formData.name,
      client_id: formData.client_id || null,
      department_id: formData.department_id || null,
      budget: Number(formData.budget) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority as any,
    });
    setIsEditOpen(false);
    setSelectedProject(null);
    resetForm();
    toast({ title: "تم تحديث المشروع بنجاح" });
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    await deleteProject(selectedProject.id);
    setIsDeleteOpen(false);
    setSelectedProject(null);
    toast({ title: "تم حذف المشروع", variant: "destructive" });
  };

  // Team management handlers
  const handleAddTeamMember = async () => {
    if (!selectedProject) return;
    const { error } = await supabase.from("project_assignments").insert({
      project_id: selectedProject.id,
      employee_id: teamForm.employee_id,
      role: teamForm.role,
      hours_allocated: Number(teamForm.hours_allocated) || 0,
      is_lead: teamForm.is_lead,
    });
    
    if (error) {
      toast({ title: "خطأ في إضافة العضو", description: error.message, variant: "destructive" });
      return;
    }
    
    setIsAddTeamOpen(false);
    setTeamForm({ employee_id: "", role: "developer", hours_allocated: "", is_lead: false });
    fetchProjectDetails(selectedProject.id);
    toast({ title: "تم إضافة العضو للفريق" });
  };

  const handleRemoveTeamMember = async (assignmentId: string) => {
    const { error } = await supabase.from("project_assignments").delete().eq("id", assignmentId);
    if (error) {
      toast({ title: "خطأ في إزالة العضو", variant: "destructive" });
      return;
    }
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    toast({ title: "تم إزالة العضو من الفريق" });
  };

  // Task management handlers
  const handleAddTask = async () => {
    if (!selectedProject) return;
    const { error } = await supabase.from("project_tasks").insert({
      project_id: selectedProject.id,
      title: taskForm.title,
      description: taskForm.description || null,
      assigned_to: taskForm.assigned_to || null,
      status: taskForm.status,
      priority: taskForm.priority,
      estimated_hours: Number(taskForm.estimated_hours) || 0,
      due_date: taskForm.due_date || null,
    });
    
    if (error) {
      toast({ title: "خطأ في إضافة المهمة", description: error.message, variant: "destructive" });
      return;
    }
    
    setIsAddTaskOpen(false);
    setTaskForm({ title: "", description: "", assigned_to: "", status: "pending", priority: "medium", estimated_hours: "", due_date: "" });
    fetchProjectDetails(selectedProject.id);
    toast({ title: "تم إضافة المهمة" });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase.from("project_tasks").update(updates).eq("id", taskId);
    if (error) {
      toast({ title: "خطأ في تحديث المهمة", variant: "destructive" });
      return;
    }
    
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    // Update project progress
    if (selectedProject) {
      const completedTasks = tasks.filter(t => t.id === taskId ? newStatus === "completed" : t.status === "completed").length;
      const totalTasks = tasks.length;
      const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await updateProject(selectedProject.id, { progress: newProgress });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from("project_tasks").delete().eq("id", taskId);
    if (error) {
      toast({ title: "خطأ في حذف المهمة", variant: "destructive" });
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast({ title: "تم حذف المهمة" });
  };

  // Milestone handlers
  const handleAddMilestone = async () => {
    if (!selectedProject) return;
    const { error } = await supabase.from("project_milestones").insert({
      project_id: selectedProject.id,
      title: milestoneForm.title,
      description: milestoneForm.description || null,
      due_date: milestoneForm.due_date || null,
    });
    
    if (error) {
      toast({ title: "خطأ في إضافة المرحلة", description: error.message, variant: "destructive" });
      return;
    }
    
    setIsAddMilestoneOpen(false);
    setMilestoneForm({ title: "", description: "", due_date: "" });
    fetchProjectDetails(selectedProject.id);
    toast({ title: "تم إضافة المرحلة" });
  };

  const handleToggleMilestone = async (milestone: ProjectMilestone) => {
    const updates: any = milestone.status === "completed" 
      ? { status: "pending", completed_at: null }
      : { status: "completed", completed_at: new Date().toISOString() };
    
    const { error } = await supabase.from("project_milestones").update(updates).eq("id", milestone.id);
    if (error) {
      toast({ title: "خطأ في تحديث المرحلة", variant: "destructive" });
      return;
    }
    setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, ...updates } : m));
  };

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      client_id: project.client_id || "",
      department_id: project.department_id || "",
      budget: String(project.budget),
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      description: project.description || "",
      status: project.status,
      priority: (project as any).priority || "medium",
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

  const getTeamMember = (employeeId: string) => employees.find(e => e.id === employeeId);

  const renderProjectForm = (onSubmit: () => void, submitText: string) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">اسم المشروع *</label>
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
            value={formData.client_id}
            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">اختر العميل</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">القسم</label>
          <select
            value={formData.department_id}
            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">اختر القسم</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">الميزانية ($)</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الأولوية</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">تاريخ البدء</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">تاريخ الانتهاء المتوقع</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>إلغاء</Button>
        <Button onClick={onSubmit} disabled={!formData.name}>{submitText}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المشاريع</h1>
            <p className="text-muted-foreground">إدارة ومتابعة جميع مشاريع الشركة</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المشاريع</p>
                <p className="text-xl font-bold">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
                <p className="text-xl font-bold">{projects.filter(p => p.status === "in_progress").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مكتملة</p>
                <p className="text-xl font-bold">{projects.filter(p => p.status === "completed").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الميزانية</p>
                <p className="text-xl font-bold">${projects.reduce((s, p) => s + p.budget, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-card border border-border rounded-lg text-sm"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(projectStatuses).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="bg-card rounded-xl shadow-card p-5 hover:shadow-lg transition-all cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => openView(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.client?.name || "بدون عميل"}</p>
                </div>
                <Badge className={projectStatuses[project.status].color}>
                  {projectStatuses[project.status].label}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">التقدم</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{project.start_date || "-"}</span>
                  </div>
                  <span className="font-semibold text-primary">${project.budget.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(project); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDelete(project); }}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مشاريع</p>
          </div>
        )}
      </div>

      {/* Add/Edit Project Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة مشروع جديد">
        {renderProjectForm(handleAdd, "إضافة المشروع")}
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedProject(null); resetForm(); }} title="تعديل المشروع">
        {renderProjectForm(handleEdit, "حفظ التغييرات")}
      </Modal>

      {/* Project Details Modal */}
      <Modal 
        isOpen={isViewOpen} 
        onClose={() => { setIsViewOpen(false); setSelectedProject(null); }} 
        title={selectedProject?.name || "تفاصيل المشروع"} 
        size="lg"
      >
        {selectedProject && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="overview" className="gap-2">
                <Eye className="w-4 h-4" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" />
                فريق العمل ({assignments.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <ListTodo className="w-4 h-4" />
                المهام ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="milestones" className="gap-2">
                <Target className="w-4 h-4" />
                المراحل ({milestones.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                  <Badge className={projectStatuses[selectedProject.status].color}>
                    {projectStatuses[selectedProject.status].label}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">العميل</p>
                  <p className="font-medium">{selectedProject.client?.name || "-"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">القسم</p>
                  <p className="font-medium">{selectedProject.department?.name || "-"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">الميزانية</p>
                  <p className="font-medium text-primary">${selectedProject.budget.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">تاريخ البدء</p>
                  <p className="font-medium">{selectedProject.start_date || "-"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">تاريخ الانتهاء</p>
                  <p className="font-medium">{selectedProject.end_date || "-"}</p>
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
                  <p className="text-card-foreground bg-muted/50 rounded-lg p-4">{selectedProject.description}</p>
                </div>
              )}
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">أعضاء فريق العمل على المشروع</p>
                <Button size="sm" className="gap-2" onClick={() => setIsAddTeamOpen(true)}>
                  <UserPlus className="w-4 h-4" />
                  إضافة عضو
                </Button>
              </div>

              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لم يتم تعيين فريق بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map(assignment => {
                    const member = getTeamMember(assignment.employee_id);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {member?.name.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member?.name || "غير معروف"}</p>
                            <p className="text-sm text-muted-foreground">{assignment.role}</p>
                          </div>
                          {assignment.is_lead && (
                            <Badge variant="outline" className="mr-2">قائد الفريق</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {assignment.hours_allocated} ساعة
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveTeamMember(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.status === "completed").length} من {tasks.length} مهام مكتملة
                </p>
                <Button size="sm" className="gap-2" onClick={() => setIsAddTaskOpen(true)}>
                  <Plus className="w-4 h-4" />
                  مهمة جديدة
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مهام</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map(task => {
                    const StatusIcon = taskStatuses[task.status as keyof typeof taskStatuses]?.icon || Clock;
                    const assignee = getTeamMember(task.assigned_to || "");
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => handleUpdateTaskStatus(
                              task.id, 
                              task.status === "completed" ? "pending" : "completed"
                            )}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === "completed" 
                                ? "bg-success border-success text-success-foreground" 
                                : "border-muted-foreground hover:border-primary"
                            }`}
                          >
                            {task.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                                {priorityLabels[task.priority as keyof typeof priorityLabels]}
                              </Badge>
                              {assignee && (
                                <span className="text-xs text-muted-foreground">• {assignee.name}</span>
                              )}
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground">• {task.due_date}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="h-8 px-2 text-xs bg-background border border-border rounded"
                          >
                            {Object.entries(taskStatuses).map(([key, val]) => (
                              <option key={key} value={key}>{val.label}</option>
                            ))}
                          </select>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">مراحل ومعالم المشروع</p>
                <Button size="sm" className="gap-2" onClick={() => setIsAddMilestoneOpen(true)}>
                  <Plus className="w-4 h-4" />
                  مرحلة جديدة
                </Button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>لا توجد مراحل</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id} 
                      className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                        milestone.status === "completed" ? "bg-success/10" : "bg-muted/50"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleMilestone(milestone)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          milestone.status === "completed"
                            ? "bg-success border-success text-success-foreground"
                            : "border-muted-foreground hover:border-primary"
                        }`}
                      >
                        {milestone.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        {milestone.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Calendar className="w-3 h-3" />
                            {milestone.due_date}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </Modal>

      {/* Add Team Member Modal */}
      <Modal isOpen={isAddTeamOpen} onClose={() => setIsAddTeamOpen(false)} title="إضافة عضو للفريق">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">الموظف</label>
            <select
              value={teamForm.employee_id}
              onChange={(e) => setTeamForm({ ...teamForm, employee_id: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            >
              <option value="">اختر الموظف</option>
              {employees.filter(e => !assignments.some(a => a.employee_id === e.id)).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الدور</label>
            <input
              type="text"
              value={teamForm.role}
              onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              placeholder="مثال: مطور، مصمم، مدير مشروع"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الساعات المخصصة</label>
            <input
              type="number"
              value={teamForm.hours_allocated}
              onChange={(e) => setTeamForm({ ...teamForm, hours_allocated: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_lead"
              checked={teamForm.is_lead}
              onChange={(e) => setTeamForm({ ...teamForm, is_lead: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_lead" className="text-sm">قائد الفريق</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddTeamOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddTeamMember} disabled={!teamForm.employee_id}>إضافة</Button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} title="إضافة مهمة جديدة">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">عنوان المهمة *</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              placeholder="أدخل عنوان المهمة"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">المسؤول</label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              >
                <option value="">غير محدد</option>
                {assignments.map(a => {
                  const emp = getTeamMember(a.employee_id);
                  return <option key={a.employee_id} value={a.employee_id}>{emp?.name}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الأولوية</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="urgent">عاجلة</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">الساعات المقدرة</label>
              <input
                type="number"
                value={taskForm.estimated_hours}
                onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none"
              placeholder="وصف المهمة..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddTask} disabled={!taskForm.title}>إضافة</Button>
          </div>
        </div>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="إضافة مرحلة جديدة">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">عنوان المرحلة *</label>
            <input
              type="text"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              placeholder="مثال: إطلاق النسخة الأولية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق</label>
            <input
              type="date"
              value={milestoneForm.due_date}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none"
              placeholder="وصف المرحلة..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)}>إلغاء</Button>
            <Button onClick={handleAddMilestone} disabled={!milestoneForm.title}>إضافة</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedProject(null); }}
        onConfirm={handleDelete}
        title="حذف المشروع"
        description={`هل أنت متأكد من حذف المشروع "${selectedProject?.name}"؟ سيتم حذف جميع المهام والفريق المرتبطين به.`}
        confirmText="حذف"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default Projects;
