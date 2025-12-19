// Re-export types from useStore for backward compatibility
export type { 
  Department, 
  Client, 
  Employee, 
  Project, 
  Transaction, 
  TreasuryAccount,
  SalaryPayment 
} from "@/hooks/useStore";

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

export const employeeStatuses = {
  active: { label: "نشط", color: "bg-success text-success-foreground" },
  inactive: { label: "غير نشط", color: "bg-muted text-muted-foreground" },
  on_leave: { label: "في إجازة", color: "bg-warning text-warning-foreground" },
};