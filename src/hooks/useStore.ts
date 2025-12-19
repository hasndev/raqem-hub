import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types matching database schema
export interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  color: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: "government" | "company" | "individual";
  notes: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department_id: string | null;
  department?: Department | null;
  position: string | null;
  salary: number;
  start_date: string | null;
  status: "active" | "inactive" | "on_leave";
  user_id: string | null;
}

export interface Project {
  id: string;
  name: string;
  client_id: string | null;
  client?: Client | null;
  department_id: string | null;
  department?: Department | null;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  start_date: string | null;
  end_date: string | null;
  budget: number;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  estimated_hours: number;
  actual_hours: number;
  notes: string | null;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  employee_id: string;
  employee?: Employee | null;
  role: string;
  assigned_at: string;
  assigned_by: string | null;
  hours_allocated: number;
  is_lead: boolean;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  assigned_to: string | null;
  assignee?: Employee | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimated_hours: number;
  actual_hours: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: "pending" | "completed";
  created_at: string;
}

export interface ProjectTimeLog {
  id: string;
  project_id: string;
  task_id: string | null;
  employee_id: string;
  employee?: Employee | null;
  hours: number;
  date: string;
  description: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "withdrawal" | "deposit";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  project_id: string | null;
  project?: Project | null;
  status: "completed" | "pending" | "cancelled";
  created_by: string | null;
}

export interface TreasuryAccount {
  id: string;
  name: string;
  name_en: string | null;
  percentage: number;
  balance: number;
  description: string | null;
  color: string;
}

export interface SalaryPayment {
  id: string;
  employee_id: string;
  month: string;
  amount: number;
  transaction_id: string | null;
  paid_at: string;
  paid_by: string | null;
}

export function useStore() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: depts },
        { data: cls },
        { data: emps },
        { data: projs },
        { data: trans },
        { data: treasury },
        { data: payments }
      ] = await Promise.all([
        supabase.from("departments").select("*").order("name"),
        supabase.from("clients").select("*").order("name"),
        supabase.from("employees").select("*, department:departments(*)").order("name"),
        supabase.from("projects").select("*, client:clients(*), department:departments(*)").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*, project:projects(*)").order("date", { ascending: false }),
        supabase.from("treasury_accounts").select("*").order("name"),
        supabase.from("salary_payments").select("*")
      ]);

      setDepartments((depts || []) as Department[]);
      setClients((cls || []) as Client[]);
      setEmployees((emps || []) as Employee[]);
      setProjects((projs || []) as Project[]);
      setTransactions((trans || []) as Transaction[]);
      setTreasuryAccounts((treasury || []) as TreasuryAccount[]);
      setSalaryPayments((payments || []) as SalaryPayment[]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Departments CRUD
  const addDepartment = async (department: Omit<Department, "id">) => {
    const { data, error } = await supabase
      .from("departments")
      .insert(department)
      .select()
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة القسم", description: error.message, variant: "destructive" });
      return null;
    }
    setDepartments(prev => [...prev, data as Department]);
    return data as Department;
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    const { error } = await supabase
      .from("departments")
      .update(updates)
      .eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث القسم", description: error.message, variant: "destructive" });
      return;
    }
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف القسم", description: error.message, variant: "destructive" });
      return;
    }
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  // Clients CRUD
  const addClient = async (client: Omit<Client, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("clients")
      .insert(client)
      .select()
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة العميل", description: error.message, variant: "destructive" });
      return null;
    }
    setClients(prev => [...prev, data as Client]);
    return data as Client;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from("clients").update(updates).eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث العميل", description: error.message, variant: "destructive" });
      return;
    }
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف العميل", description: error.message, variant: "destructive" });
      return;
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Employees CRUD
  const addEmployee = async (employee: Omit<Employee, "id" | "department">) => {
    const { data, error } = await supabase
      .from("employees")
      .insert(employee)
      .select("*, department:departments(*)")
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة الموظف", description: error.message, variant: "destructive" });
      return null;
    }
    setEmployees(prev => [...prev, data as Employee]);
    return data as Employee;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    const { department, ...dbUpdates } = updates;
    const { error } = await supabase.from("employees").update(dbUpdates).eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث الموظف", description: error.message, variant: "destructive" });
      return;
    }
    
    // Refetch to get updated department relation
    const { data } = await supabase
      .from("employees")
      .select("*, department:departments(*)")
      .eq("id", id)
      .single();
    
    if (data) {
      setEmployees(prev => prev.map(e => e.id === id ? (data as Employee) : e));
    }
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف الموظف", description: error.message, variant: "destructive" });
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Projects CRUD
  const addProject = async (project: Omit<Project, "id" | "client" | "department">) => {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select("*, client:clients(*), department:departments(*)")
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة المشروع", description: error.message, variant: "destructive" });
      return null;
    }
    setProjects(prev => [data as Project, ...prev]);
    return data as Project;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { client, department, ...dbUpdates } = updates;
    const { error } = await supabase.from("projects").update(dbUpdates).eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث المشروع", description: error.message, variant: "destructive" });
      return;
    }
    
    const { data } = await supabase
      .from("projects")
      .select("*, client:clients(*), department:departments(*)")
      .eq("id", id)
      .single();
    
    if (data) {
      setProjects(prev => prev.map(p => p.id === id ? (data as Project) : p));
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف المشروع", description: error.message, variant: "destructive" });
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Transactions CRUD
  const addTransaction = async (transaction: Omit<Transaction, "id" | "project" | "created_by">) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...transaction, created_by: userData.user?.id })
      .select("*, project:projects(*)")
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة المعاملة", description: error.message, variant: "destructive" });
      return null;
    }
    setTransactions(prev => [data as Transaction, ...prev]);
    return data as Transaction;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { project, ...dbUpdates } = updates;
    const { error } = await supabase.from("transactions").update(dbUpdates).eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث المعاملة", description: error.message, variant: "destructive" });
      return;
    }
    
    const { data } = await supabase
      .from("transactions")
      .select("*, project:projects(*)")
      .eq("id", id)
      .single();
    
    if (data) {
      setTransactions(prev => prev.map(t => t.id === id ? (data as Transaction) : t));
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف المعاملة", description: error.message, variant: "destructive" });
      return;
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Treasury Accounts CRUD
  const addTreasuryAccount = async (account: Omit<TreasuryAccount, "id">) => {
    const { data, error } = await supabase
      .from("treasury_accounts")
      .insert(account)
      .select()
      .single();
    
    if (error) {
      toast({ title: "خطأ في إضافة الحساب", description: error.message, variant: "destructive" });
      return null;
    }
    setTreasuryAccounts(prev => [...prev, data as TreasuryAccount]);
    return data as TreasuryAccount;
  };

  const updateTreasuryAccount = async (id: string, updates: Partial<TreasuryAccount>) => {
    const { error } = await supabase.from("treasury_accounts").update(updates).eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في تحديث الحساب", description: error.message, variant: "destructive" });
      return;
    }
    setTreasuryAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteTreasuryAccount = async (id: string) => {
    const { error } = await supabase.from("treasury_accounts").delete().eq("id", id);
    
    if (error) {
      toast({ title: "خطأ في حذف الحساب", description: error.message, variant: "destructive" });
      return;
    }
    setTreasuryAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Salary Payments
  const addSalaryPayment = async (payment: Omit<SalaryPayment, "id" | "paid_at" | "paid_by">) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("salary_payments")
      .insert({ ...payment, paid_by: userData.user?.id })
      .select()
      .single();
    
    if (error) {
      toast({ title: "خطأ في تسجيل الدفعة", description: error.message, variant: "destructive" });
      return null;
    }
    setSalaryPayments(prev => [...prev, data as SalaryPayment]);
    return data as SalaryPayment;
  };

  const isEmployeePaidForMonth = (employeeId: string, month: string) => {
    return salaryPayments.some(p => p.employee_id === employeeId && p.month === month);
  };

  // Statistics
  const getStats = () => {
    const totalRevenue = transactions
      .filter(t => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter(t => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBalance = treasuryAccounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    
    return { totalRevenue, totalExpenses, totalBalance, activeProjects };
  };

  return {
    loading,
    refetch: fetchData,
    
    departments, addDepartment, updateDepartment, deleteDepartment,
    clients, addClient, updateClient, deleteClient,
    employees, addEmployee, updateEmployee, deleteEmployee,
    projects, addProject, updateProject, deleteProject,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    treasuryAccounts, addTreasuryAccount, updateTreasuryAccount, deleteTreasuryAccount, setTreasuryAccounts,
    salaryPayments, addSalaryPayment, isEmployeePaidForMonth,
    
    getStats,
  };
}