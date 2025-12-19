import { Search, User, KeyRound, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const getRoleLabel = () => {
    if (roles.includes("admin")) return "مدير النظام";
    if (roles.includes("supervisor")) return "مشرف";
    if (roles.includes("accountant")) return "محاسب";
    if (roles.includes("employee")) return "موظف";
    return "مستخدم";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
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
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pr-4 border-r border-border hover:opacity-80 transition-opacity cursor-pointer">
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
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
            <DropdownMenuItem 
              onClick={() => navigate("/account")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate("/account?tab=password")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>تغيير كلمة المرور</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
