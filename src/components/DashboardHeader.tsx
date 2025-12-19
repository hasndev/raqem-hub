import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { user, profile, roles } = useAuth();

  const getRoleLabel = () => {
    if (roles.includes("admin")) return "مدير النظام";
    if (roles.includes("supervisor")) return "مشرف";
    if (roles.includes("accountant")) return "محاسب";
    if (roles.includes("employee")) return "موظف";
    return "مستخدم";
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث..."
          className="w-full h-10 pr-10 pl-4 bg-muted rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* Profile */}
        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="text-left">
            <p className="text-sm font-semibold text-card-foreground">
              {profile?.full_name || "مستخدم"}
            </p>
            <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
          </div>
          <Avatar className="bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
