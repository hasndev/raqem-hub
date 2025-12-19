export interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  department: string;
  departmentId: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  startDate: string;
  endDate?: string;
  budget: number;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  type: "government" | "company" | "individual";
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  department: string;
  position: string;
  salary: number;
  startDate: string;
  status: "active" | "inactive" | "on_leave";
}

export interface Transaction {
  id: string;
  type: "income" | "expense" | "withdrawal" | "deposit";
  category: string;
  amount: number;
  description: string;
  date: string;
  projectId?: string;
  projectName?: string;
  status: "completed" | "pending" | "cancelled";
}

export interface TreasuryAccount {
  id: string;
  name: string;
  nameEn: string;
  percentage: number;
  balance: number;
  description: string;
  color: string;
}

export const projectStatuses = {
  pending: { label: "قيد البدء", color: "bg-warning text-warning-foreground" },
  in_progress: { label: "جاري", color: "bg-primary text-primary-foreground" },
  completed: { label: "مكتمل", color: "bg-success text-success-foreground" },
  on_hold: { label: "معلق", color: "bg-destructive text-destructive-foreground" },
};

export const clientTypes = {
  government: "جهة حكومية",
  company: "شركة خاصة",
  individual: "فرد",
};

export const transactionTypes = {
  income: { label: "إيراد", color: "text-success" },
  expense: { label: "مصروف", color: "text-destructive" },
  withdrawal: { label: "سحب", color: "text-warning" },
  deposit: { label: "إيداع", color: "text-primary" },
};
