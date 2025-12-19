import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Search,
  KeyRound,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  Globe,
  Server,
  CreditCard,
  Mail,
  Folder,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Credential {
  id: string;
  platform_name: string;
  username: string | null;
  password: string | null;
  url: string | null;
  notes: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: "website", label: "مواقع", icon: Globe },
  { value: "server", label: "خوادم", icon: Server },
  { value: "email", label: "بريد إلكتروني", icon: Mail },
  { value: "payment", label: "دفع", icon: CreditCard },
  { value: "other", label: "أخرى", icon: Folder },
];

const CredentialsVaultPage = () => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    platform_name: "",
    username: "",
    password: "",
    url: "",
    notes: "",
    category: "other",
  });

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("credentials_vault")
        .select("*")
        .order("platform_name");

      if (error) throw error;
      setCredentials(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCredentials();
    }
  }, [isAdmin]);

  const handleOpenModal = (credential?: Credential) => {
    if (credential) {
      setSelectedCredential(credential);
      setForm({
        platform_name: credential.platform_name,
        username: credential.username || "",
        password: credential.password || "",
        url: credential.url || "",
        notes: credential.notes || "",
        category: credential.category || "other",
      });
    } else {
      setSelectedCredential(null);
      setForm({
        platform_name: "",
        username: "",
        password: "",
        url: "",
        notes: "",
        category: "other",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.platform_name.trim()) {
      toast({ title: "يرجى إدخال اسم المنصة", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedCredential) {
        const { error } = await supabase
          .from("credentials_vault")
          .update(form)
          .eq("id", selectedCredential.id);
        if (error) throw error;
        toast({ title: "تم تحديث البيانات بنجاح" });
      } else {
        const { error } = await supabase.from("credentials_vault").insert(form);
        if (error) throw error;
        toast({ title: "تم إضافة البيانات بنجاح" });
      }
      setIsModalOpen(false);
      fetchCredentials();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCredential) return;
    try {
      const { error } = await supabase
        .from("credentials_vault")
        .delete()
        .eq("id", selectedCredential.id);
      if (error) throw error;
      toast({ title: "تم حذف البيانات" });
      setIsDeleteOpen(false);
      fetchCredentials();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `تم نسخ ${label}` });
  };

  const filteredCredentials = credentials.filter(
    (c) =>
      c.platform_name.toLowerCase().includes(search.toLowerCase()) ||
      c.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.url?.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || Folder;
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">
              هذه الصفحة متاحة فقط لمدراء النظام
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">خزنة كلمات المرور</h1>
            <p className="text-muted-foreground">إدارة بيانات الدخول للمنصات والحسابات</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة حساب
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الحسابات</p>
                <p className="text-2xl font-bold">{credentials.length}</p>
              </div>
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          {categories.slice(0, 3).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.value} className="bg-card rounded-xl shadow-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{cat.label}</p>
                    <p className="text-2xl font-bold">
                      {credentials.filter((c) => c.category === cat.value).length}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في الحسابات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Credentials Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد حسابات مسجلة
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    المنصة
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    اسم المستخدم
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    كلمة المرور
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    التصنيف
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCredentials.map((cred, index) => {
                  const CategoryIcon = getCategoryIcon(cred.category);
                  return (
                    <tr
                      key={cred.id}
                      className="hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{cred.platform_name}</p>
                            {cred.url && (
                              <a
                                href={cred.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                {cred.url.replace(/https?:\/\//, "").slice(0, 30)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cred.username || "-"}</span>
                          {cred.username && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(cred.username!, "اسم المستخدم")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">
                            {visiblePasswords.has(cred.id)
                              ? cred.password
                              : "••••••••"}
                          </span>
                          {cred.password && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => togglePasswordVisibility(cred.id)}
                              >
                                {visiblePasswords.has(cred.id) ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(cred.password!, "كلمة المرور")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {categories.find((c) => c.value === cred.category)?.label || "أخرى"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal(cred)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedCredential(cred);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCredential ? "تعديل الحساب" : "إضافة حساب جديد"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المنصة *</label>
            <input
              type="text"
              value={form.platform_name}
              onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
              placeholder="مثال: GitHub, AWS, Google"
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="اسم المستخدم أو البريد"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور</label>
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="كلمة المرور"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">الرابط</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">التصنيف</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
              rows={3}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : selectedCredential ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="حذف الحساب"
        description={`هل أنت متأكد من حذف بيانات "${selectedCredential?.platform_name}"؟`}
        confirmText="حذف"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default CredentialsVaultPage;
