import { useState } from "react";
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
  XCircle,
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

const categories = {
  income: ["إيرادات مشاريع", "إيرادات استشارات", "إيرادات تدريب", "إيرادات أخرى"],
  expense: ["رواتب", "إيجارات", "مشتريات", "تسويق", "مصاريف إدارية", "مصاريف أخرى"],
  withdrawal: ["سحب نقدي", "تحويل بنكي"],
  deposit: ["إيداع نقدي", "تحويل وارد"],
};

const Treasury = () => {
  const { transactions, treasuryAccounts, projects, employees, departments, addTransaction, updateTransaction, deleteTransaction, updateEmployee } = useAppStore();
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
  const [formData, setFormData] = useState({
    type: "income" as Transaction["type"],
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    project_id: "",
    status: "completed" as Transaction["status"],
  });

  // Salary payment tracking
  const [paidSalaries, setPaidSalaries] = useState<Record<string, string[]>>({});
  
  const isEmployeePaidForMonth = (empId: string, month: string) => {
    return paidSalaries[month]?.includes(empId) || false;
  };

  const filteredTx = transactions.filter(t => 
    (filterType === "all" || t.type === filterType) &&
    (t.description.includes(search) || t.category.includes(search))
  );

  const totalIncome = transactions.filter(t => t.type === "income" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const totalSalaries = employees.reduce((s, e) => s + e.salary, 0);
  const activeEmployees = employees.filter(e => e.status === "active");

  const resetForm = () => {
    setFormData({ type: "income", category: "", amount: "", description: "", date: new Date().toISOString().split("T")[0], project_id: "", status: "completed" });
  };

  const handleAdd = () => {
    addTransaction({
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      project_id: formData.project_id || null,
      status: formData.status,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تمت إضافة المعاملة بنجاح" });
  };

  const handleEdit = () => {
    if (!selectedTx) return;
    updateTransaction(selectedTx.id, {
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      project_id: formData.project_id || null,
      status: formData.status,
    });
    setIsEditOpen(false);
    setSelectedTx(null);
    resetForm();
    toast({ title: "تم تحديث المعاملة" });
  };

  const handleDelete = () => {
    if (!selectedTx) return;
    deleteTransaction(selectedTx.id);
    setIsDeleteOpen(false);
    setSelectedTx(null);
    toast({ title: "تم حذف المعاملة", variant: "destructive" });
  };

  const handlePaySalary = () => {
    if (!selectedEmpForPay) return;
    
    addTransaction({
      type: "expense",
      category: "رواتب",
      amount: selectedEmpForPay.salary,
      description: `راتب ${selectedEmpForPay.name} - ${salaryMonth}`,
      date: new Date().toISOString().split("T")[0],
      project_id: null,
      status: "completed",
    });

    setPaidSalaries(prev => ({
      ...prev,
      [salaryMonth]: [...(prev[salaryMonth] || []), selectedEmpForPay.id]
    }));

    setIsPaySalaryOpen(false);
    setSelectedEmpForPay(null);
    toast({ title: `تم صرف راتب ${selectedEmpForPay.name}`, description: `$${selectedEmpForPay.salary.toLocaleString()}` });
  };

  const handlePayAllSalaries = () => {
    const unpaidEmployees = activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth));
    
    unpaidEmployees.forEach(emp => {
      addTransaction({
        type: "expense",
        category: "رواتب",
        amount: emp.salary,
        description: `راتب ${emp.name} - ${salaryMonth}`,
        date: new Date().toISOString().split("T")[0],
        project_id: null,
        status: "completed",
      });
    });

    setPaidSalaries(prev => ({
      ...prev,
      [salaryMonth]: [...(prev[salaryMonth] || []), ...unpaidEmployees.map(e => e.id)]
    }));

    setIsPayAllOpen(false);
    toast({ 
      title: "تم صرف جميع الرواتب", 
      description: `${unpaidEmployees.length} موظف - $${unpaidEmployees.reduce((s, e) => s + e.salary, 0).toLocaleString()}` 
    });
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
      status: tx.status,
    });
    setIsEditOpen(true);
  };

  const COLORS = ["hsl(216, 100%, 50%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(280, 67%, 50%)", "hsl(340, 82%, 52%)"];

  const paidCount = activeEmployees.filter(e => isEmployeePaidForMonth(e.id, salaryMonth)).length;
  const unpaidCount = activeEmployees.length - paidCount;

  const TxForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الخزينة</h1>
            <p className="text-muted-foreground">إدارة الشؤون المالية والرواتب</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            معاملة جديدة
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">الإيرادات</p>
                <p className="text-xl font-bold text-success">{totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">المصروفات</p>
                <p className="text-xl font-bold text-destructive">{totalExpense.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">صافي الربح</p>
                <p className={`text-xl font-bold ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>{netProfit.toLocaleString()}</p>
              </div>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الرصيد</p>
                <p className="text-xl font-bold text-primary">{treasuryAccounts.reduce((s, a) => s + a.balance, 0).toLocaleString()}</p>
              </div>
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">مجموع الرواتب</p>
                <p className="text-xl font-bold text-warning">{totalSalaries.toLocaleString()}</p>
              </div>
              <Users className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="animate-slide-up">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions">المعاملات المالية</TabsTrigger>
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
                      <td className="px-4 py-3 text-sm">{tx.category}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate">{tx.description}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${tx.type === "income" || tx.type === "deposit" ? "text-success" : "text-destructive"}`}>
                        {tx.type === "income" || tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()}
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
                صرف جميع الرواتب (${activeEmployees.reduce((s, e) => !isEmployeePaidForMonth(e.id, salaryMonth) ? s + e.salary : s, 0).toLocaleString()}$)
              </Button>
            </div>

            {/* Summary Cards for Salaries */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">إجمالي الرواتب الشهرية</p>
                <p className="text-2xl font-bold text-card-foreground mt-1">${totalSalaries.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">تم صرفه</p>
                <p className="text-2xl font-bold text-success mt-1">
                  ${activeEmployees.filter(e => isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + e.salary, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-2xl font-bold text-warning mt-1">
                  ${activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + e.salary, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl shadow-card p-5">
                <p className="text-sm text-muted-foreground">عدد الموظفين النشطين</p>
                <p className="text-2xl font-bold text-primary mt-1">{activeEmployees.length}</p>
              </div>
            </div>

            {/* Employees Salary Table */}
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
                        <td className="px-4 py-3 text-sm font-bold">${emp.salary.toLocaleString()}</td>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {treasuryAccounts.map((account, index) => (
                    <div
                      key={account.id}
                      className="bg-card rounded-xl shadow-card p-5 border-r-4 animate-scale-in"
                      style={{ borderColor: COLORS[index % COLORS.length], animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{account.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{account.percentage}%</span>
                      </div>
                      <p className="text-2xl font-bold text-card-foreground">${account.balance.toLocaleString()}</p>
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
                      {treasuryAccounts.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

      {/* Modals */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة معاملة جديدة">
        <TxForm onSubmit={handleAdd} submitText="إضافة المعاملة" />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedTx(null); resetForm(); }} title="تعديل المعاملة">
        <TxForm onSubmit={handleEdit} submitText="حفظ التغييرات" />
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
              <p className="text-3xl font-bold text-primary">${selectedEmpForPay.salary.toLocaleString()}</p>
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
        description={`سيتم صرف رواتب ${unpaidCount} موظف بإجمالي $${activeEmployees.filter(e => !isEmployeePaidForMonth(e.id, salaryMonth)).reduce((s, e) => s + e.salary, 0).toLocaleString()}. هل تريد المتابعة؟`}
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
    </DashboardLayout>
  );
};

export default Treasury;
