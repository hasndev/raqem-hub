import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Pencil,
  Trash2,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  HandCoins,
  DollarSign,
  FolderKanban,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Transaction, transactionTypes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TreasuryAccount, Debt } from "@/hooks/useStore";
import { supabase } from "@/integrations/supabase/client";

interface ProjectPaymentSchedule {
  id: string;
  project_id: string;
  title: string;
  percentage: number;
  amount: number | null;
  due_date: string;
  status: string;
  paid_at: string | null;
  transaction_id: string | null;
  notes: string | null;
}

const categories = {
  income: ["إيرادات مشاريع", "إيرادات استشارات", "إيرادات تدريب", "إيرادات أخرى"],
  expense: ["رواتب", "إيجارات", "مشتريات", "تسويق", "مصاريف إدارية", "مصاريف أخرى"],
  withdrawal: ["سحب نقدي", "تحويل بنكي"],
  deposit: ["إيداع نقدي", "تحويل وارد"],
};

const debtTypes = {
  receivable: { label: "دين لنا", color: "text-success" },
  payable: { label: "دين علينا", color: "text-destructive" },
};

const entityTypes = {
  client: "عميل",
  employee: "موظف",
  supplier: "مورد",
  other: "أخرى",
};

const Treasury = () => {
  const { 
    transactions, 
    treasuryAccounts, 
    projects, 
    employees, 
    departments,
    clients,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    addTreasuryAccount,
    updateTreasuryAccount,
    deleteTreasuryAccount,
    salaryPayments,
    addSalaryPayment,
    isEmployeePaidForMonth,
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    addDebtPayment,
    getStats,
  } = useAppStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [isPayAllOpen, setIsPayAllOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedEmpForPay, setSelectedEmpForPay] = useState<typeof employees[0] | null>(null);
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Treasury Account state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TreasuryAccount | null>(null);
  const [accountFormData, setAccountFormData] = useState({
    name: "",
    name_en: "",
    percentage: "",
    balance: "",
    description: "",
    color: "#3B82F6",
  });

  // Debt state
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isEditDebtOpen, setIsEditDebtOpen] = useState(false);
  const [isDeleteDebtOpen, setIsDeleteDebtOpen] = useState(false);
  const [isPayDebtOpen, setIsPayDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState("");
  const [debtPayNotes, setDebtPayNotes] = useState("");
  const [debtFormData, setDebtFormData] = useState({
    type: "receivable" as Debt["type"],
    entity_type: "client" as Debt["entity_type"],
    entity_id: "",
    entity_name: "",
    amount: "",
    description: "",
    due_date: "",
    project_id: "",
  });

  // Project payment schedules state
  const [projectPayments, setProjectPayments] = useState<(ProjectPaymentSchedule & { project_name?: string })[]>([]);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<(ProjectPaymentSchedule & { project_name?: string }) | null>(null);
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [formData, setFormData] = useState({
    type: "income" as Transaction["type"],
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    project_id: "",
    account_id: "",
    status: "completed" as Transaction["status"],
  });

  // Get stats
  const stats = getStats();

  // Fetch project payment schedules
  useEffect(() => {
    const fetchProjectPayments = async () => {
      const { data } = await supabase
        .from("project_payment_schedules")
        .select("*, projects(name)")
        .order("due_date");
      
      if (data) {
        setProjectPayments(data.map((p: any) => ({
          ...p,
          project_name: p.projects?.name
        })));
      }
    };
    fetchProjectPayments();
  }, []);

  const filteredTx = transactions.filter(t =>
    (filterType === "all" || t.type === filterType) &&
    ((t.description || "").includes(search) || t.category.includes(search))
  );

  const totalIncome = stats.totalRevenue;
  const totalExpense = stats.totalExpenses;
  const netProfit = totalIncome - totalExpense;
  const totalSalaries = employees.reduce((s, e) => s + Number(e.salary), 0);
  const activeEmployees = employees.filter(e => e.status === "active");
  const totalTreasuryBalance = stats.totalBalance;

  const resetForm = () => {
    setFormData({ type: "income", category: "", amount: "", description: "", date: new Date().toISOString().split("T")[0], project_id: "", account_id: "", status: "completed" });
  };

  const resetAccountForm = () => {
    setAccountFormData({ name: "", name_en: "", percentage: "", balance: "", description: "", color: "#3B82F6" });
  };

  const resetDebtForm = () => {
    setDebtFormData({ type: "receivable", entity_type: "client", entity_id: "", entity_name: "", amount: "", description: "", due_date: "", project_id: "" });
  };

  const handleAdd = async () => {
    if (!formData.account_id) {
      toast({ title: "يرجى اختيار الحساب", variant: "destructive" });
      return;
    }
    await addTransaction({
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      project_id: formData.project_id || null,
      account_id: formData.account_id,
      status: formData.status,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تمت إضافة المعاملة بنجاح" });
  };

  const handleEdit = async () => {
    if (!selectedTx) return;
    await updateTransaction(selectedTx.id, {
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      project_id: formData.project_id || null,
      account_id: formData.account_id || null,
      status: formData.status,
    });
    setIsEditOpen(false);
    setSelectedTx(null);
    resetForm();
    toast({ title: "تم تحديث المعاملة" });
  };

  const handleDelete = async () => {
    if (!selectedTx) return;
    await deleteTransaction(selectedTx.id);
    setIsDeleteOpen(false);
    setSelectedTx(null);
    toast({ title: "تم حذف المعاملة", variant: "destructive" });
  };

  const handlePaySalary = async () => {
    if (!selectedEmpForPay) return;
    
    const transaction = await addTransaction({
      type: "expense",
      category: "رواتب",
      amount: Number(selectedEmpForPay.salary),
      description: `راتب ${selectedEmpForPay.name} - ${salaryMonth}`,
      date: new Date().toISOString().split("T")[0],
      project_id: null,
      account_id: treasuryAccounts[0]?.id || null,
      status: "completed",
    });

    if (transaction) {
      await addSalaryPayment({
        employee_id: selectedEmpForPay.id,
        month: salaryMonth,
        amount: Number(selectedEmpForPay.salary),
        transaction_id: transaction.id,
      });
    }

    setIsPaySalaryOpen(false);
    setSelectedEmpForPay(null);
    toast({ title: `تم صرف راتب ${selectedEmpForPay.name}`, description: `$${Number(selectedEmpForPay.salary).toLocaleString()}` });
  };

  const handlePayAllSalaries = async () => {
    const unpaidEmployees = activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth));
    
    for (const emp of unpaidEmployees) {
      const transaction = await addTransaction({
        type: "expense",
        category: "رواتب",
        amount: Number(emp.salary),
        description: `راتب ${emp.name} - ${salaryMonth}`,
        date: new Date().toISOString().split("T")[0],
        project_id: null,
        account_id: treasuryAccounts[0]?.id || null,
        status: "completed",
      });

      if (transaction) {
        await addSalaryPayment({
          employee_id: emp.id,
          month: salaryMonth,
          amount: Number(emp.salary),
          transaction_id: transaction.id,
        });
      }
    }

    setIsPayAllOpen(false);
    toast({ 
      title: "تم صرف جميع الرواتب", 
      description: `${unpaidEmployees.length} موظف - $${unpaidEmployees.reduce((s, e) => s + Number(e.salary), 0).toLocaleString()}` 
    });
  };

  // Treasury Account handlers
  const handleAddAccount = async () => {
    const balance = Number(accountFormData.balance) || 0;
    
    // Create the account first
    const account = await addTreasuryAccount({
      name: accountFormData.name,
      name_en: accountFormData.name_en || null,
      percentage: Number(accountFormData.percentage) || 0,
      balance: balance,
      description: accountFormData.description || null,
      color: accountFormData.color,
    });

    // If balance > 0, create a withdrawal transaction (deduct from available funds)
    if (account && balance > 0) {
      await addTransaction({
        type: "withdrawal",
        category: "تحويل للخزينة",
        amount: balance,
        description: `توزيع رصيد لحساب: ${accountFormData.name}`,
        date: new Date().toISOString().split("T")[0],
        project_id: null,
        account_id: account.id,
        status: "completed",
      });
    }

    setIsAddAccountOpen(false);
    resetAccountForm();
    toast({ title: "تمت إضافة الحساب بنجاح" });
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;
    
    const oldBalance = Number(selectedAccount.balance) || 0;
    const newBalance = Number(accountFormData.balance) || 0;
    const balanceDiff = newBalance - oldBalance;
    
    await updateTreasuryAccount(selectedAccount.id, {
      name: accountFormData.name,
      name_en: accountFormData.name_en || null,
      percentage: Number(accountFormData.percentage) || 0,
      balance: newBalance,
      description: accountFormData.description || null,
      color: accountFormData.color,
    });

    // If balance increased, create a withdrawal transaction (deduct from available funds)
    if (balanceDiff > 0) {
      await addTransaction({
        type: "withdrawal",
        category: "تحويل للخزينة",
        amount: balanceDiff,
        description: `زيادة رصيد حساب: ${accountFormData.name}`,
        date: new Date().toISOString().split("T")[0],
        project_id: null,
        account_id: selectedAccount.id,
        status: "completed",
      });
    } else if (balanceDiff < 0) {
      // If balance decreased, create a deposit transaction (return to available funds)
      await addTransaction({
        type: "deposit",
        category: "تحويل من الخزينة",
        amount: Math.abs(balanceDiff),
        description: `سحب من حساب: ${accountFormData.name}`,
        date: new Date().toISOString().split("T")[0],
        project_id: null,
        account_id: selectedAccount.id,
        status: "completed",
      });
    }

    setIsEditAccountOpen(false);
    setSelectedAccount(null);
    resetAccountForm();
    toast({ title: "تم تحديث الحساب" });
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    await deleteTreasuryAccount(selectedAccount.id);
    setIsDeleteAccountOpen(false);
    setSelectedAccount(null);
    toast({ title: "تم حذف الحساب", variant: "destructive" });
  };

  // Debt handlers
  const handleAddDebt = async () => {
    await addDebt({
      type: debtFormData.type,
      entity_type: debtFormData.entity_type,
      entity_id: debtFormData.entity_id || null,
      entity_name: debtFormData.entity_name,
      amount: Number(debtFormData.amount),
      paid_amount: 0,
      description: debtFormData.description || null,
      due_date: debtFormData.due_date || null,
      status: "pending",
      project_id: debtFormData.project_id || null,
    });
    setIsAddDebtOpen(false);
    resetDebtForm();
    toast({ title: "تمت إضافة الدين بنجاح" });
  };

  const handleEditDebt = async () => {
    if (!selectedDebt) return;
    await updateDebt(selectedDebt.id, {
      type: debtFormData.type,
      entity_type: debtFormData.entity_type,
      entity_id: debtFormData.entity_id || null,
      entity_name: debtFormData.entity_name,
      amount: Number(debtFormData.amount),
      description: debtFormData.description || null,
      due_date: debtFormData.due_date || null,
      project_id: debtFormData.project_id || null,
    });
    setIsEditDebtOpen(false);
    setSelectedDebt(null);
    resetDebtForm();
    toast({ title: "تم تحديث الدين" });
  };

  const handleDeleteDebt = async () => {
    if (!selectedDebt) return;
    await deleteDebt(selectedDebt.id);
    setIsDeleteDebtOpen(false);
    setSelectedDebt(null);
    toast({ title: "تم حذف الدين", variant: "destructive" });
  };

  const handlePayDebt = async () => {
    if (!selectedDebt) return;
    await addDebtPayment(selectedDebt.id, Number(debtPayAmount), debtPayNotes);
    setIsPayDebtOpen(false);
    setSelectedDebt(null);
    setDebtPayAmount("");
    setDebtPayNotes("");
    toast({ title: "تم تسجيل الدفعة بنجاح" });
  };

  const openEditAccount = (account: TreasuryAccount) => {
    setSelectedAccount(account);
    setAccountFormData({
      name: account.name,
      name_en: account.name_en || "",
      percentage: String(account.percentage),
      balance: String(account.balance),
      description: account.description || "",
      color: account.color,
    });
    setIsEditAccountOpen(true);
  };

  const openEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setDebtFormData({
      type: debt.type,
      entity_type: debt.entity_type,
      entity_id: debt.entity_id || "",
      entity_name: debt.entity_name,
      amount: String(debt.amount),
      description: debt.description || "",
      due_date: debt.due_date || "",
      project_id: debt.project_id || "",
    });
    setIsEditDebtOpen(true);
  };

  const openPayDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setDebtPayAmount(String(Number(debt.amount) - Number(debt.paid_amount)));
    setIsPayDebtOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setFormData({
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
      description: tx.description || "",
      date: tx.date || new Date().toISOString().split("T")[0],
      project_id: tx.project_id || "",
      account_id: tx.account_id || "",
      status: tx.status,
    });
    setIsEditOpen(true);
  };

  // Mark project payment as paid
  const handleMarkPaymentPaid = async () => {
    if (!selectedPayment || !paymentAccountId) return;
    
    // Create income transaction
    const transaction = await addTransaction({
      type: "income",
      category: "إيرادات مشاريع",
      amount: Number(selectedPayment.amount),
      description: `دفعة ${selectedPayment.title} - ${selectedPayment.project_name}`,
      date: new Date().toISOString().split("T")[0],
      project_id: selectedPayment.project_id,
      account_id: paymentAccountId,
      status: "completed",
    });

    if (transaction) {
      // Update payment schedule status
      await supabase
        .from("project_payment_schedules")
        .update({ 
          status: "paid", 
          paid_at: new Date().toISOString(),
          transaction_id: transaction.id 
        })
        .eq("id", selectedPayment.id);

      // Update local state
      setProjectPayments(prev => prev.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, status: "paid", paid_at: new Date().toISOString(), transaction_id: transaction.id }
          : p
      ));

      toast({ title: "تم تسجيل الدفعة بنجاح", description: `$${Number(selectedPayment.amount).toLocaleString()}` });
    }

    setIsMarkPaidOpen(false);
    setSelectedPayment(null);
    setPaymentAccountId("");
  };

  const COLORS = ["hsl(216, 100%, 50%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(280, 67%, 50%)", "hsl(340, 82%, 52%)"];

  const paidCount = activeEmployees.filter(e => isEmployeePaidForMonth(e.id, salaryMonth)).length;
  const unpaidCount = activeEmployees.length - paidCount;

  // Filter debts
  const activeDebts = debts.filter(d => d.status !== "paid" && d.status !== "cancelled");
  const receivables = activeDebts.filter(d => d.type === "receivable");
  const payables = activeDebts.filter(d => d.type === "payable");

  const renderTxForm = (onSubmit: () => void, submitText: string) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">نوع المعاملة</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction["type"], category: "" })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {Object.entries(transactionTypes).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">التصنيف</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">اختر التصنيف</option>
            {categories[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">المبلغ ($)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">التاريخ</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الحالة</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Transaction["status"] })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="completed">مكتمل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الحساب <span className="text-destructive">*</span></label>
        <select
          value={formData.account_id}
          onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">اختر الحساب</option>
          {treasuryAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      {formData.type === "income" && (
        <div>
          <label className="block text-sm font-medium mb-2">المشروع (اختياري)</label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">بدون مشروع</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>إلغاء</Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  const renderAccountForm = (onSubmit: () => void, submitText: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">اسم الحساب (عربي)</label>
          <input
            type="text"
            value={accountFormData.name}
            onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="مثال: حساب التشغيل"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">اسم الحساب (إنجليزي)</label>
          <input
            type="text"
            value={accountFormData.name_en}
            onChange={(e) => setAccountFormData({ ...accountFormData, name_en: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Operating Account"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">الرصيد ($)</label>
          <input
            type="number"
            value={accountFormData.balance}
            onChange={(e) => setAccountFormData({ ...accountFormData, balance: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">النسبة (%)</label>
          <input
            type="number"
            value={accountFormData.percentage}
            onChange={(e) => setAccountFormData({ ...accountFormData, percentage: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">اللون</label>
          <input
            type="color"
            value={accountFormData.color}
            onChange={(e) => setAccountFormData({ ...accountFormData, color: e.target.value })}
            className="w-full h-10 px-2 bg-muted border border-border rounded-lg cursor-pointer"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea
          value={accountFormData.description}
          onChange={(e) => setAccountFormData({ ...accountFormData, description: e.target.value })}
          className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="وصف اختياري للحساب..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddAccountOpen(false); setIsEditAccountOpen(false); resetAccountForm(); }}>إلغاء</Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  const renderDebtForm = (onSubmit: () => void, submitText: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">نوع الدين</label>
          <select
            value={debtFormData.type}
            onChange={(e) => setDebtFormData({ ...debtFormData, type: e.target.value as Debt["type"] })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="receivable">دين لنا (مستحق)</option>
            <option value="payable">دين علينا (مطلوب)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">نوع الجهة</label>
          <select
            value={debtFormData.entity_type}
            onChange={(e) => setDebtFormData({ ...debtFormData, entity_type: e.target.value as Debt["entity_type"], entity_id: "" })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="client">عميل</option>
            <option value="employee">موظف</option>
            <option value="supplier">مورد</option>
            <option value="other">أخرى</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {debtFormData.entity_type === "client" && (
          <div>
            <label className="block text-sm font-medium mb-2">اختر العميل</label>
            <select
              value={debtFormData.entity_id}
              onChange={(e) => {
                const client = clients.find(c => c.id === e.target.value);
                setDebtFormData({ ...debtFormData, entity_id: e.target.value, entity_name: client?.name || "" });
              }}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">اختر عميل</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {debtFormData.entity_type === "employee" && (
          <div>
            <label className="block text-sm font-medium mb-2">اختر الموظف</label>
            <select
              value={debtFormData.entity_id}
              onChange={(e) => {
                const emp = employees.find(emp => emp.id === e.target.value);
                setDebtFormData({ ...debtFormData, entity_id: e.target.value, entity_name: emp?.name || "" });
              }}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">اختر موظف</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
        {(debtFormData.entity_type === "supplier" || debtFormData.entity_type === "other") && (
          <div>
            <label className="block text-sm font-medium mb-2">اسم الجهة</label>
            <input
              type="text"
              value={debtFormData.entity_name}
              onChange={(e) => setDebtFormData({ ...debtFormData, entity_name: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="أدخل اسم الجهة"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">المبلغ ($)</label>
          <input
            type="number"
            value={debtFormData.amount}
            onChange={(e) => setDebtFormData({ ...debtFormData, amount: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">تاريخ الاستحقاق</label>
          <input
            type="date"
            value={debtFormData.due_date}
            onChange={(e) => setDebtFormData({ ...debtFormData, due_date: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">المشروع (اختياري)</label>
          <select
            value={debtFormData.project_id}
            onChange={(e) => setDebtFormData({ ...debtFormData, project_id: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">بدون مشروع</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">الوصف</label>
        <textarea
          value={debtFormData.description}
          onChange={(e) => setDebtFormData({ ...debtFormData, description: e.target.value })}
          className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddDebtOpen(false); setIsEditDebtOpen(false); resetDebtForm(); }}>إلغاء</Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الخزينة</h1>
            <p className="text-muted-foreground">إدارة الشؤون المالية والرواتب والديون</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            معاملة جديدة
          </Button>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">الإيرادات</p>
                <p className="text-xl font-bold text-success">${totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">المصروفات</p>
                <p className="text-xl font-bold text-destructive">${totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">صافي الربح</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>${netProfit.toLocaleString()}</p>
              </div>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">رصيد الخزينة</p>
                <p className="text-xl font-bold text-primary">${totalTreasuryBalance.toLocaleString()}</p>
              </div>
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Debt Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-4 border-r-4 border-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ديون لنا (مستحقات)</p>
                <p className="text-2xl font-bold text-success">${stats.totalReceivables.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{receivables.length} دين نشط</p>
              </div>
              <Receipt className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4 border-r-4 border-destructive">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ديون علينا (مطلوبات)</p>
                <p className="text-2xl font-bold text-destructive">${stats.totalPayables.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{payables.length} دين نشط</p>
              </div>
              <HandCoins className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4 border-r-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الديون</p>
                <p className={`text-2xl font-bold ${stats.totalReceivables - stats.totalPayables >= 0 ? "text-success" : "text-destructive"}`}>
                  ${(stats.totalReceivables - stats.totalPayables).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalReceivables - stats.totalPayables >= 0 ? "لصالحنا" : "علينا"}</p>
              </div>
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="animate-slide-up">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions">المعاملات المالية</TabsTrigger>
            <TabsTrigger value="projectPayments">دفعات المشاريع</TabsTrigger>
            <TabsTrigger value="debts">إدارة الديون</TabsTrigger>
            <TabsTrigger value="salaries">إدارة الرواتب</TabsTrigger>
            <TabsTrigger value="accounts">حسابات الخزينة</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="بحث في المعاملات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 px-4 bg-card border border-border rounded-lg text-sm"
              >
                <option value="all">جميع المعاملات</option>
                <option value="income">الإيرادات</option>
                <option value="expense">المصروفات</option>
              </select>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">التاريخ</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">النوع</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الحساب</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">التصنيف</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الوصف</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المبلغ</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTx.map((tx, index) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-4 py-3 text-sm">{tx.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {tx.type === "income" || tx.type === "deposit" ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          )}
                          <span className={`text-sm ${transactionTypes[tx.type].color}`}>{transactionTypes[tx.type].label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {treasuryAccounts.find(a => a.id === tx.account_id)?.name || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{tx.category}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate">{tx.description}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${tx.type === "income" || tx.type === "deposit" ? "text-success" : "text-destructive"}`}>
                        {tx.type === "income" || tx.type === "deposit" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {tx.status === "completed" ? "مكتمل" : "معلق"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(tx)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedTx(tx); setIsDeleteOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Project Payments Tab */}
          <TabsContent value="projectPayments" className="space-y-4">
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المشروع</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الدفعة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">النسبة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المبلغ</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">تاريخ الاستحقاق</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>لا توجد دفعات مشاريع مستحقة</p>
                        <p className="text-sm mt-1">أضف مواعيد الدفع من داخل تفاصيل المشروع</p>
                      </td>
                    </tr>
                  ) : (
                    projectPayments.map((payment) => {
                      const isOverdue = new Date(payment.due_date) < new Date() && payment.status !== "paid";
                      return (
                        <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FolderKanban className="w-4 h-4 text-primary" />
                              <span className="font-medium">{payment.project_name || "مشروع غير معروف"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{payment.title}</td>
                          <td className="px-4 py-3 text-sm">{payment.percentage}%</td>
                          <td className="px-4 py-3 font-semibold text-primary">${Number(payment.amount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              {payment.due_date}
                              {isOverdue && <span className="text-xs">(متأخر)</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={payment.status === "paid" ? "bg-success text-success-foreground" : isOverdue ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}>
                              {payment.status === "paid" ? "مدفوع" : isOverdue ? "متأخر" : "قيد الانتظار"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {payment.status !== "paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsMarkPaidOpen(true);
                                }}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                تسجيل كمدفوع
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Debts Tab */}
          <TabsContent value="debts" className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2" onClick={() => setIsAddDebtOpen(true)}>
                <Plus className="w-4 h-4" />
                إضافة دين جديد
              </Button>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">النوع</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الجهة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المبلغ الكلي</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المدفوع</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المتبقي</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">تاريخ الاستحقاق</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الحالة</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {debts.map((debt, index) => {
                    const remaining = Number(debt.amount) - Number(debt.paid_amount);
                    return (
                      <tr key={debt.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                        <td className="px-4 py-3">
                          <Badge variant={debt.type === "receivable" ? "default" : "destructive"} className="text-xs">
                            {debtTypes[debt.type].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{debt.entity_name}</p>
                            <p className="text-xs text-muted-foreground">{entityTypes[debt.entity_type]}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">${Number(debt.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-success">${Number(debt.paid_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-warning">${remaining.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{debt.due_date || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={debt.status === "paid" ? "default" : debt.status === "partial" ? "secondary" : "outline"}
                            className="text-xs"
                          >
                            {debt.status === "paid" ? "مدفوع" : debt.status === "partial" ? "جزئي" : "معلق"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {debt.status !== "paid" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPayDebt(debt)}>
                                <CreditCard className="w-3.5 h-3.5 text-success" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDebt(debt)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedDebt(debt); setIsDeleteDebtOpen(true); }}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm text-muted-foreground ml-2">الشهر:</label>
                  <input
                    type="month"
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(e.target.value)}
                    className="h-10 px-4 bg-card border border-border rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="w-4 h-4" /> {paidCount} مدفوع
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <Clock className="w-4 h-4" /> {unpaidCount} متبقي
                  </span>
                </div>
              </div>
              <Button onClick={() => setIsPayAllOpen(true)} disabled={unpaidCount === 0} className="gap-2">
                <CreditCard className="w-4 h-4" />
                صرف جميع الرواتب (${activeEmployees.reduce((s, e) => !isEmployeePaidForMonth(e.id, salaryMonth) ? s + Number(e.salary) : s, 0).toLocaleString()})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">إجمالي الرواتب الشهرية</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">${totalSalaries.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">تم صرفه</p>
                <p className="text-2xl font-bold text-success mt-1">
                  ${activeEmployees.filter(e => isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + Number(e.salary), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-2xl font-bold text-warning mt-1">
                  ${activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + Number(e.salary), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">عدد الموظفين النشطين</p>
                <p className="text-2xl font-bold text-primary mt-1">{activeEmployees.length}</p>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الموظف</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">القسم</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">المنصب</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">الراتب</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">حالة الصرف</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeEmployees.map((emp, index) => {
                    const isPaid = isEmployeePaidForMonth(emp.id, salaryMonth);
                    return (
                      <tr key={emp.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 bg-primary">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">{emp.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{departments.find(d => d.id === emp.department_id)?.name || "-"}</td>
                        <td className="px-4 py-3 text-sm">{emp.position}</td>
                        <td className="px-4 py-3 text-sm font-bold">${Number(emp.salary).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {isPaid ? (
                            <Badge className="bg-success text-success-foreground gap-1">
                              <CheckCircle2 className="w-3 h-3" /> تم الصرف
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="w-3 h-3" /> لم يُصرف
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={isPaid ? "outline" : "default"}
                            disabled={isPaid}
                            onClick={() => { setSelectedEmpForPay(emp); setIsPaySalaryOpen(true); }}
                          >
                            {isPaid ? "تم" : "صرف الراتب"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2" onClick={() => setIsAddAccountOpen(true)}>
                <Plus className="w-4 h-4" />
                إضافة حساب جديد
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {treasuryAccounts.map((account, index) => (
                    <div
                      key={account.id}
                      className="bg-card rounded-xl shadow-card p-5 border-r-4 animate-scale-in"
                      style={{ borderColor: account.color || COLORS[index % COLORS.length], animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{account.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{account.percentage}%</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAccount(account)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedAccount(account); setIsDeleteAccountOpen(true); }}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-card-foreground">${Number(account.balance).toLocaleString()}</p>
                      {account.name_en && <p className="text-xs text-muted-foreground mt-1">{account.name_en}</p>}
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{account.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-bold mb-4">توزيع الحسابات</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={treasuryAccounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="balance"
                      nameKey="name"
                    >
                      {treasuryAccounts.map((account, index) => (
                        <Cell key={`cell-${index}`} fill={account.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Modals */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة معاملة جديدة">
        {renderTxForm(handleAdd, "إضافة المعاملة")}
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedTx(null); resetForm(); }} title="تعديل المعاملة">
        {renderTxForm(handleEdit, "حفظ التغييرات")}
      </Modal>

      {/* Treasury Account Modals */}
      <Modal isOpen={isAddAccountOpen} onClose={() => { setIsAddAccountOpen(false); resetAccountForm(); }} title="إضافة حساب جديد">
        {renderAccountForm(handleAddAccount, "إضافة الحساب")}
      </Modal>

      <Modal isOpen={isEditAccountOpen} onClose={() => { setIsEditAccountOpen(false); setSelectedAccount(null); resetAccountForm(); }} title="تعديل الحساب">
        {renderAccountForm(handleEditAccount, "حفظ التغييرات")}
      </Modal>

      {/* Debt Modals */}
      <Modal isOpen={isAddDebtOpen} onClose={() => { setIsAddDebtOpen(false); resetDebtForm(); }} title="إضافة دين جديد">
        {renderDebtForm(handleAddDebt, "إضافة الدين")}
      </Modal>

      <Modal isOpen={isEditDebtOpen} onClose={() => { setIsEditDebtOpen(false); setSelectedDebt(null); resetDebtForm(); }} title="تعديل الدين">
        {renderDebtForm(handleEditDebt, "حفظ التغييرات")}
      </Modal>

      <Modal isOpen={isPayDebtOpen} onClose={() => { setIsPayDebtOpen(false); setSelectedDebt(null); setDebtPayAmount(""); setDebtPayNotes(""); }} title="تسجيل دفعة" size="sm">
        {selectedDebt && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-bold">{selectedDebt.entity_name}</p>
              <p className="text-sm text-muted-foreground">{debtTypes[selectedDebt.type].label}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span>المبلغ الكلي:</span>
                <span className="font-bold">${Number(selectedDebt.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>المدفوع:</span>
                <span className="text-success">${Number(selectedDebt.paid_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>المتبقي:</span>
                <span className="text-warning font-bold">${(Number(selectedDebt.amount) - Number(selectedDebt.paid_amount)).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">مبلغ الدفعة ($)</label>
              <input
                type="number"
                value={debtPayAmount}
                onChange={(e) => setDebtPayAmount(e.target.value)}
                max={Number(selectedDebt.amount) - Number(selectedDebt.paid_amount)}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ملاحظات</label>
              <textarea
                value={debtPayNotes}
                onChange={(e) => setDebtPayNotes(e.target.value)}
                className="w-full h-20 px-4 py-2 bg-muted border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsPayDebtOpen(false); setSelectedDebt(null); }}>إلغاء</Button>
              <Button onClick={handlePayDebt}>تسجيل الدفعة</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isPaySalaryOpen} onClose={() => { setIsPaySalaryOpen(false); setSelectedEmpForPay(null); }} title="تأكيد صرف الراتب" size="sm">
        {selectedEmpForPay && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Avatar className="h-12 w-12 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">{selectedEmpForPay.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{selectedEmpForPay.name}</p>
                <p className="text-sm text-muted-foreground">{selectedEmpForPay.position}</p>
              </div>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">مبلغ الراتب</p>
              <p className="text-3xl font-bold text-primary">${Number(selectedEmpForPay.salary).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">شهر: {salaryMonth}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsPaySalaryOpen(false); setSelectedEmpForPay(null); }}>إلغاء</Button>
              <Button onClick={handlePaySalary}>تأكيد الصرف</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isPayAllOpen}
        onClose={() => setIsPayAllOpen(false)}
        onConfirm={handlePayAllSalaries}
        title="صرف جميع الرواتب"
        description={`سيتم صرف رواتب ${unpaidCount} موظف بإجمالي $${activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + Number(e.salary), 0).toLocaleString()}. هل تريد المتابعة؟`}
        confirmText="صرف الرواتب"
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedTx(null); }}
        onConfirm={handleDelete}
        title="حذف المعاملة"
        description="هل أنت متأكد من حذف هذه المعاملة؟"
        confirmText="حذف"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => { setIsDeleteAccountOpen(false); setSelectedAccount(null); }}
        onConfirm={handleDeleteAccount}
        title="حذف الحساب"
        description={`هل أنت متأكد من حذف حساب "${selectedAccount?.name}"؟`}
        confirmText="حذف"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={isDeleteDebtOpen}
        onClose={() => { setIsDeleteDebtOpen(false); setSelectedDebt(null); }}
        onConfirm={handleDeleteDebt}
        title="حذف الدين"
        description={`هل أنت متأكد من حذف دين "${selectedDebt?.entity_name}"؟`}
        confirmText="حذف"
        variant="destructive"
      />

      {/* Mark Payment as Paid Modal */}
      <Modal 
        isOpen={isMarkPaidOpen} 
        onClose={() => { setIsMarkPaidOpen(false); setSelectedPayment(null); setPaymentAccountId(""); }} 
        title="تسجيل الدفعة كمدفوعة"
        size="sm"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المشروع:</span>
                <span className="font-medium">{selectedPayment.project_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الدفعة:</span>
                <span className="font-medium">{selectedPayment.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ:</span>
                <span className="font-bold text-primary">${Number(selectedPayment.amount).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الحساب المستلم *</label>
              <select
                value={paymentAccountId}
                onChange={(e) => setPaymentAccountId(e.target.value)}
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">اختر الحساب</option>
                {treasuryAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => { setIsMarkPaidOpen(false); setSelectedPayment(null); setPaymentAccountId(""); }}>إلغاء</Button>
              <Button onClick={handleMarkPaymentPaid} disabled={!paymentAccountId}>تسجيل كمدفوع</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Treasury;
