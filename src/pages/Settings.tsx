import { Save } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import raqeemLogo from "@/assets/raqeem-logo.png";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات النظام والحساب</p>
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-xl shadow-card p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-card-foreground mb-4">معلومات الشركة</h2>
          <div className="flex items-center gap-6 mb-6">
            <img src={raqeemLogo} alt="رقيم" className="w-20 h-20 object-contain" />
            <div>
              <h3 className="font-semibold text-card-foreground">شعار الشركة</h3>
              <p className="text-sm text-muted-foreground">PNG, JPG حتى 2MB</p>
              <Button variant="outline" size="sm" className="mt-2">
                تغيير الشعار
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                اسم الشركة
              </label>
              <input
                type="text"
                defaultValue="شركة رقيم التقنية"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                defaultValue="info@raqeem.sa"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                defaultValue="920000000"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                العنوان
              </label>
              <input
                type="text"
                defaultValue="الرياض، المملكة العربية السعودية"
                className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl shadow-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-bold text-card-foreground mb-4">الإشعارات</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">إشعارات البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">استلام إشعارات عبر البريد</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">إشعارات المشاريع</p>
                <p className="text-sm text-muted-foreground">تحديثات حالة المشاريع</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">تذكير الرواتب</p>
                <p className="text-sm text-muted-foreground">تنبيه قبل موعد صرف الرواتب</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-slide-up" style={{ animationDelay: "200ms" }}>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
