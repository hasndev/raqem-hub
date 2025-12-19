import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Landmark,
  UserCog,
  LogOut,
  User,
} from "lucide-react";
import raqeemLogo from "@/assets/raqeem-logo-white.png";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
  { icon: FolderKanban, label: "المشاريع", path: "/projects" },
  { icon: Users, label: "العملاء", path: "/clients" },
  { icon: Building2, label: "الأقسام", path: "/departments" },
  { icon: UserCircle, label: "الموظفين", path: "/employees" },
  { icon: Landmark, label: "الخزينة", path: "/treasury" },
  { icon: Wallet, label: "الرواتب", path: "/salaries" },
  { icon: Settings, label: "الإعدادات", path: "/settings" },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside
      className={`h-screen gradient-primary flex flex-col transition-all duration-300 sticky top-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border">
        <img
          src={raqeemLogo}
          alt="رقيم"
          className={`transition-all duration-300 ${collapsed ? "w-10" : "w-32"}`}
        />
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* Admin Only: Users Management */}
          {isAdmin && (
            <li>
              <NavLink
                to="/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === "/users"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <UserCog className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">إدارة المستخدمين</span>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2">
            <NavLink
              to="/account"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                location.pathname === "/account"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
              }`}
            >
              <Avatar className="h-8 w-8 bg-sidebar-accent">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || "مستخدم"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </NavLink>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <NavLink
              to="/account"
              className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                location.pathname === "/account"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
              }`}
            >
              <User className="w-5 h-5" />
            </NavLink>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <>
              <ChevronRight className="w-5 h-5" />
              <span className="text-sm">طي القائمة</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}