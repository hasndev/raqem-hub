import { Bell, Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
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
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="text-left">
            <p className="text-sm font-semibold text-card-foreground">أحمد محمد</p>
            <p className="text-xs text-muted-foreground">مدير النظام</p>
          </div>
          <Avatar className="bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground">
              أ
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
