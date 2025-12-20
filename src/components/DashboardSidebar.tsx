import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  StickyNote,
  KeyRound,
} from "lucide-react";
import raqeemLogo from "@/assets/raqeem-logo-white.png";
import { useAuth } from "@/context/AuthContext";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: ("admin" | "supervisor" | "accountant" | "employee")[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/", roles: ["admin", "supervisor", "accountant"] },
  { icon: FolderKanban, label: "المشاريع", path: "/projects", roles: ["admin", "supervisor", "employee"] },
  { icon: Users, label: "العملاء", path: "/clients", roles: ["admin", "supervisor"] },
  { icon: Building2, label: "الأقسام", path: "/departments", roles: ["admin", "supervisor"] },
  { icon: UserCircle, label: "الموظفين", path: "/employees", roles: ["admin"] },
  { icon: Landmark, label: "الخزينة", path: "/treasury", roles: ["admin", "accountant"] },
  { icon: Wallet, label: "الرواتب", path: "/salaries", roles: ["admin", "accountant", "employee"] },
  { icon: StickyNote, label: "الملاحظات", path: "/notes" }, // All roles can access
  { icon: Settings, label: "الإعدادات", path: "/settings" }, // All roles can access
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdmin, hasRole, roles } = useAuth();

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter((item) => {
    // If no roles specified, show to all authenticated users
    if (!item.roles) return true;
    // Admin sees everything
    if (isAdmin) return true;
    // Check if user has any of the required roles
    return item.roles.some((role) => hasRole(role));
  });

  return (
    <aside
      className={`h-screen gradient-primary flex flex-col transition-all duration-300 sticky top-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo - Fixed */}
      <div className="p-4 flex items-center justify-center border-b border-sidebar-border shrink-0">
        <img
          src={raqeemLogo}
          alt="رقيم"
          className={`transition-all duration-300 ${collapsed ? "w-8" : "w-24"}`}
        />
      </div>

      {/* Menu - Scrollable */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto min-h-0">
        <ul className="space-y-2">
          {visibleMenuItems.map((item) => {
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

          {/* Admin Only: Users Management & Credentials */}
          {isAdmin && (
            <>
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
              <li>
                <NavLink
                  to="/credentials"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    location.pathname === "/credentials"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <KeyRound className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium text-sm">كلمات المرور</span>
                  )}
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

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
