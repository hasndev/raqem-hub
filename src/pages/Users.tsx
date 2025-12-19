import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  UserPlus,
  Shield,
  Trash2,
  Users,
  ShieldCheck,
  UserCog,
  Calculator,
} from "lucide-react";

type AppRole = "admin" | "supervisor" | "accountant" | "employee";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  roles: AppRole[];
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  admin: "مدير النظام",
  supervisor: "مشرف",
  accountant: "محاسب",
  employee: "موظف",
};

const roleIcons: Record<AppRole, React.ReactNode> = {
  admin: <ShieldCheck className="w-4 h-4" />,
  supervisor: <UserCog className="w-4 h-4" />,
  accountant: <Calculator className="w-4 h-4" />,
  employee: <Users className="w-4 h-4" />,
};

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserProfile[] = (profiles || []).map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        email: "", // Will be populated if accessible
        roles: (allRoles || [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => r.role as AppRole),
        created_at: profile.created_at,
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "خطأ في جلب المستخدمين",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleOpenRoleModal = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles);
    setIsRoleModalOpen(true);
  };

  const handleToggleRole = (role: AppRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      // Delete existing roles
      await supabase.from("user_roles").delete().eq("user_id", selectedUser.id);

      // Insert new roles
      if (selectedRoles.length > 0) {
        const { error } = await supabase.from("user_roles").insert(
          selectedRoles.map((role) => ({
            user_id: selectedUser.id,
            role,
          }))
        );
        if (error) throw error;
      }

      toast({ title: "تم تحديث الصلاحيات بنجاح" });
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الصلاحيات",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoles = async () => {
    if (!selectedUser) return;

    try {
      await supabase.from("user_roles").delete().eq("user_id", selectedUser.id);
      toast({ title: "تم إزالة جميع الصلاحيات" });
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">غير مصرح</h2>
            <p className="text-muted-foreground">
              ليس لديك صلاحية الوصول إلى هذه الصفحة
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-muted-foreground">إدارة حسابات وصلاحيات المستخدمين</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">المدراء</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes("admin")).length}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">المشرفين</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.roles.includes("supervisor")).length}
                </p>
              </div>
              <UserCog className="w-8 h-8 text-warning" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">بدون صلاحيات</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.roles.length === 0).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في المستخدمين..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-slide-up">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    المستخدم
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    الصلاحيات
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    تاريخ الإنشاء
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || "مستخدم"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="gap-1">
                              {roleIcons[role]}
                              {roleLabels[role]}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">بدون صلاحيات</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenRoleModal(user)}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="إدارة الصلاحيات"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {selectedUser?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">{selectedUser?.full_name || "مستخدم"}</p>
              <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">اختر الصلاحيات:</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleToggleRole(role)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    selectedRoles.includes(role)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-border hover:border-primary"
                  }`}
                >
                  {roleIcons[role]}
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveRoles}>حفظ الصلاحيات</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteRoles}
        title="إزالة الصلاحيات"
        description={`هل أنت متأكد من إزالة جميع صلاحيات ${selectedUser?.full_name || "المستخدم"}؟`}
        confirmText="إزالة"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default UsersPage;