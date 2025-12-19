import { useState } from "react";
import { Project, Client, Department, Employee, Transaction, TreasuryAccount } from "@/types";

// Initial mock data
const initialProjects: Project[] = [
  {
    id: "1",
    name: "تطبيق إدارة المخزون",
    client: "شركة الفجر",
    clientId: "1",
    department: "تطوير التطبيقات",
    departmentId: "1",
    progress: 75,
    status: "in_progress",
    startDate: "2024-01-15",
    budget: 50000,
    description: "تطوير نظام متكامل لإدارة المخزون",
  },
  {
    id: "2",
    name: "نظام حجز المواعيد",
    client: "عيادات النخيل",
    clientId: "2",
    department: "تطوير الويب",
    departmentId: "2",
    progress: 100,
    status: "completed",
    startDate: "2023-11-01",
    endDate: "2024-01-01",
    budget: 35000,
  },
  {
    id: "3",
    name: "منصة التجارة الإلكترونية",
    client: "متجر السعادة",
    clientId: "3",
    department: "تطوير الويب",
    departmentId: "2",
    progress: 45,
    status: "in_progress",
    startDate: "2024-02-01",
    budget: 80000,
  },
];

const initialClients: Client[] = [
  {
    id: "1",
    name: "شركة الفجر للتقنية",
    email: "info@alfajr.com",
    phone: "0551234567",
    type: "company",
    createdAt: "2023-06-15",
  },
  {
    id: "2",
    name: "عيادات النخيل الطبية",
    email: "contact@nakheel.sa",
    phone: "0559876543",
    type: "company",
    createdAt: "2023-08-20",
  },
  {
    id: "3",
    name: "متجر السعادة الإلكتروني",
    email: "hello@saada.store",
    phone: "0541122334",
    type: "company",
    createdAt: "2024-01-10",
  },
];

const initialDepartments: Department[] = [
  { id: "1", name: "تطوير التطبيقات", description: "تطوير تطبيقات الهاتف المحمول iOS و Android", color: "bg-primary" },
  { id: "2", name: "تطوير الويب", description: "تطوير مواقع وتطبيقات الويب", color: "bg-success" },
  { id: "3", name: "التصميم", description: "تصميم واجهات المستخدم وتجربة المستخدم", color: "bg-warning" },
  { id: "4", name: "ضمان الجودة", description: "اختبار وضمان جودة البرمجيات", color: "bg-chart-4" },
  { id: "5", name: "إدارة المشاريع", description: "إدارة وتنسيق المشاريع مع العملاء", color: "bg-chart-5" },
];

const initialEmployees: Employee[] = [
  { id: "1", name: "أحمد محمد العلي", email: "ahmed@raqeem.sa", phone: "0551111111", departmentId: "1", department: "تطوير التطبيقات", position: "مطور أول", salary: 18000, startDate: "2023-01-15", status: "active" },
  { id: "2", name: "فاطمة أحمد السالم", email: "fatima@raqeem.sa", phone: "0552222222", departmentId: "3", department: "التصميم", position: "مصمم UI/UX", salary: 14000, startDate: "2023-03-01", status: "active" },
  { id: "3", name: "خالد عبدالله الحربي", email: "khaled@raqeem.sa", phone: "0553333333", departmentId: "2", department: "تطوير الويب", position: "مطور Full Stack", salary: 16000, startDate: "2023-05-20", status: "active" },
];

const initialTransactions: Transaction[] = [
  { id: "1", type: "income", category: "إيرادات مشاريع", amount: 50000, description: "دفعة مقدمة - مشروع إدارة المخزون", date: "2024-01-20", projectId: "1", projectName: "تطبيق إدارة المخزون", status: "completed" },
  { id: "2", type: "expense", category: "رواتب", amount: 48000, description: "رواتب شهر يناير", date: "2024-01-28", status: "completed" },
  { id: "3", type: "income", category: "إيرادات مشاريع", amount: 35000, description: "دفعة نهائية - نظام حجز المواعيد", date: "2024-01-15", projectId: "2", projectName: "نظام حجز المواعيد", status: "completed" },
  { id: "4", type: "expense", category: "إيجارات", amount: 8000, description: "إيجار المكتب - يناير", date: "2024-01-05", status: "completed" },
  { id: "5", type: "withdrawal", category: "سحب نقدي", amount: 5000, description: "مصاريف طوارئ", date: "2024-01-22", status: "completed" },
];

const initialTreasuryAccounts: TreasuryAccount[] = [
  { id: "1", name: "الحساب الجاري", nameEn: "Operating", percentage: 40, balance: 156000, description: "الرواتب والإيجارات والمصاريف التشغيلية", color: "bg-primary" },
  { id: "2", name: "البحث والتطوير", nameEn: "R&D", percentage: 20, balance: 78000, description: "تطوير المنتجات والأدوات الاحترافية", color: "bg-success" },
  { id: "3", name: "حساب الطوارئ", nameEn: "Emergency", percentage: 15, balance: 58500, description: "صندوق احتياطي يغطي 6 أشهر من المصروفات", color: "bg-warning" },
  { id: "4", name: "المؤتمرات والتسويق", nameEn: "Strategic", percentage: 10, balance: 39000, description: "المؤتمرات والمعارض وبناء العلامة التجارية", color: "bg-chart-4" },
  { id: "5", name: "توزيع الأرباح", nameEn: "Partners", percentage: 15, balance: 58500, description: "حصة الشركاء من الأرباح", color: "bg-chart-5" },
];

export function useStore() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>(initialTreasuryAccounts);

  // Projects CRUD
  const addProject = (project: Omit<Project, "id">) => {
    const newProject = { ...project, id: Date.now().toString() };
    setProjects([...projects, newProject]);
    return newProject;
  };
  
  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...data } : p));
  };
  
  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Clients CRUD
  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    const newClient = { ...client, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] };
    setClients([...clients, newClient]);
    return newClient;
  };
  
  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...data } : c));
  };
  
  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  // Departments CRUD
  const addDepartment = (department: Omit<Department, "id">) => {
    const newDepartment = { ...department, id: Date.now().toString() };
    setDepartments([...departments, newDepartment]);
    return newDepartment;
  };
  
  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, ...data } : d));
  };
  
  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
  };

  // Employees CRUD
  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = { ...employee, id: Date.now().toString() };
    setEmployees([...employees, newEmployee]);
    return newEmployee;
  };
  
  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, ...data } : e));
  };
  
  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  // Transactions CRUD
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions([...transactions, newTransaction]);
    return newTransaction;
  };
  
  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...data } : t));
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Statistics
  const getStats = () => {
    const totalRevenue = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = treasuryAccounts.reduce((sum, a) => sum + a.balance, 0);
    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    
    return { totalRevenue, totalExpenses, totalBalance, activeProjects };
  };

  return {
    projects, addProject, updateProject, deleteProject,
    clients, addClient, updateClient, deleteClient,
    departments, addDepartment, updateDepartment, deleteDepartment,
    employees, addEmployee, updateEmployee, deleteEmployee,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    treasuryAccounts, setTreasuryAccounts,
    getStats,
  };
}
