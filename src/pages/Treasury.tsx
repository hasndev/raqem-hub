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
  Receipt,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Transaction, transactionTypes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const categories = {
  income: ["إيرادات مشاريع", "إيرادات استشارات", "إيرادات تدريب", "إيرادات أخرى"],
  expense: ["رواتب", "إيجارات", "مشتريات", "تسويق", "مصاريف إدارية", "مصاريف أخرى"],
  withdrawal: ["سحب نقدي", "تحويل بنكي"],
  deposit: ["إيداع نقدي", "تحويل وارد"],
};

const Treasury = () => {
  const { transactions, treasuryAccounts, projects, addTransaction, updateTransaction, deleteTransaction, getStats } = useAppStore();
  const { toast } = useToast();
  const stats = getStats();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: "income" as Transaction["type"],
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    status: "completed" as Transaction["status"],
  });

  const filteredTx = transactions.filter(t => 
    (filterType === "all" || t.type === filterType) &&
    (t.description.includes(search) || t.category.includes(search))
  );

  const totalIncome = transactions.filter(t => t.type === "income" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const resetForm = () => {
    setFormData({ type: "income", category: "", amount: "", description: "", date: new Date().toISOString().split("T")[0], projectId: "", status: "completed" });
  };

  const handleAdd = () => {
    const project = projects.find(p => p.id === formData.projectId);
    addTransaction({
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      date: formData.date,
      projectId: formData.projectId || undefined,
      projectName: project?.name,
      status: formData.status,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تمت إضافة المعاملة بنجاح" });
  };

  const handleEdit = () => {
    if (!selectedTx) return;
    const project = projects.find(p => p.id === formData.projectId);
    updateTransaction(selectedTx.id, {
      ...formData,
      amount: Number(formData.amount),
      projectName: project?.name,
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

  const openEdit = (tx: Transaction) => {
    setSelectedTx(tx);
    setFormData({
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
      description: tx.description,
      date: tx.date,
      projectId: tx.projectId || "",
      status: tx.status,
    });
    setIsEditOpen(true);
  };

  const COLORS = ["hsl(216, 100%, 50%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(280, 67%, 50%)", "hsl(340, 82%, 52%)"];

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
          <label className="block text-sm font-medium mb-2">المبلغ (ر.س)</label>
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
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
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
            <p className="text-muted-foreground">إدارة الشؤون المالية للشركة</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            معاملة جديدة
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-success mt-1">{totalIncome.toLocaleString()} ر.س</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-destructive mt-1">{totalExpense.toLocaleString()} ر.س</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  {netProfit.toLocaleString()} ر.س
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الرصيد</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {treasuryAccounts.reduce((s, a) => s + a.balance, 0).toLocaleString()} ر.س
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <PiggyBank className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Treasury Accounts */}
        <div className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-card-foreground mb-4">حسابات الخزينة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {treasuryAccounts.map((account, index) => (
              <div
                key={account.id}
                className="p-4 rounded-xl border border-border hover:shadow-soft transition-shadow animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${account.color}`} />
                  <span className="font-semibold text-sm">{account.name}</span>
                  <span className="text-xs text-muted-foreground mr-auto">{account.percentage}%</span>
                </div>
                <p className="text-xl font-bold text-card-foreground">{account.balance.toLocaleString()} ر.س</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{account.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl shadow-card p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-card-foreground mb-4">توزيع حسابات الخزينة</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={treasuryAccounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="balance"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {treasuryAccounts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ر.س`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-card-foreground mb-4">ملخص سريع</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <span className="text-sm">معاملات الإيرادات</span>
                <span className="font-bold text-success">{transactions.filter(t => t.type === "income").length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                <span className="text-sm">معاملات المصروفات</span>
                <span className="font-bold text-destructive">{transactions.filter(t => t.type === "expense").length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <span className="text-sm">معاملات معلقة</span>
                <span className="font-bold text-warning">{transactions.filter(t => t.status === "pending").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث في المعاملات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">جميع المعاملات</option>
              <option value="income">الإيرادات</option>
              <option value="expense">المصروفات</option>
              <option value="withdrawal">السحوبات</option>
              <option value="deposit">الإيداعات</option>
            </select>
          </div>

          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">النوع</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">التصنيف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الوصف</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">المبلغ</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTx.map((tx, index) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="px-6 py-4 text-card-foreground">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "income" || tx.type === "deposit" ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                        <span className={transactionTypes[tx.type].color}>{transactionTypes[tx.type].label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-card-foreground">{tx.category}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-card-foreground">{tx.description}</p>
                        {tx.projectName && <p className="text-xs text-muted-foreground">{tx.projectName}</p>}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold ${tx.type === "income" || tx.type === "deposit" ? "text-success" : "text-destructive"}`}>
                      {tx.type === "income" || tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()} ر.س
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}>
                        {tx.status === "completed" ? "مكتمل" : tx.status === "pending" ? "معلق" : "ملغي"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tx)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedTx(tx); setIsDeleteOpen(true); }}>
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
      </div>

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة معاملة جديدة">
        <TxForm onSubmit={handleAdd} submitText="إضافة المعاملة" />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedTx(null); resetForm(); }} title="تعديل المعاملة">
        <TxForm onSubmit={handleEdit} submitText="حفظ التغييرات" />
      </Modal>

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
