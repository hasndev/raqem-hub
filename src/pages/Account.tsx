import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Shield, Mail, Calendar, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  supervisor: "مشرف",
  accountant: "محاسب",
  employee: "موظف",
};

const Account = () => {
  const { user, profile, roles, updatePassword, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: "تم تحديث الملف الشخصي بنجاح" });
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;

      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">الحساب الشخصي</h1>
          <p className="text-muted-foreground">إدارة بيانات حسابك الشخصي</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 bg-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {profile?.full_name || "مستخدم"}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                {roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {roleLabels[role] || role}
                  </Badge>
                ))}
                {roles.length === 0 && (
                  <Badge variant="outline">بدون صلاحيات</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="animate-slide-up">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              الملف الشخصي
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="w-4 h-4" />
              كلمة المرور
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              الأمان
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="text-lg font-bold mb-6">تعديل الملف الشخصي</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 pr-11 pl-4 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full h-12 pr-11 pl-4 bg-muted/50 border border-border rounded-xl text-muted-foreground"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    لا يمكن تغيير البريد الإلكتروني
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تاريخ الإنشاء</label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={new Date(user?.created_at || "").toLocaleDateString("ar-SA")}
                      disabled
                      className="w-full h-12 pr-11 pl-4 bg-muted/50 border border-border rounded-xl text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="text-lg font-bold mb-6">تغيير كلمة المرور</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 pr-11 pl-11 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      dir="ltr"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 pr-11 pl-4 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      dir="ltr"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="text-lg font-bold mb-6">معلومات الأمان</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">الصلاحيات</p>
                    <p className="text-sm text-muted-foreground">الأدوار المسندة إلى حسابك</p>
                  </div>
                  <div className="flex gap-2">
                    {roles.map((role) => (
                      <Badge key={role}>{roleLabels[role] || role}</Badge>
                    ))}
                    {roles.length === 0 && <Badge variant="outline">لا توجد صلاحيات</Badge>}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">آخر تسجيل دخول</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user?.last_sign_in_at || "").toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Account;