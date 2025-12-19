import { useAppStore } from "@/context/StoreContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";

const typeColors = {
  government: "bg-primary",
  company: "bg-success",
  individual: "bg-warning",
};

export function RecentClients() {
  const { clients, projects } = useAppStore();
  const recentClients = clients.slice(0, 4);

  const getClientProjects = (clientId: string) => 
    projects.filter(p => p.client_id === clientId).length;

  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">أحدث العملاء</h2>
      </div>
      <div className="divide-y divide-border">
        {recentClients.map((client, index) => (
          <div
            key={client.id}
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <Avatar className={`${typeColors[client.type]} text-primary-foreground`}>
                <AvatarFallback className={typeColors[client.type]}>
                  {client.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-card-foreground">
                  {client.name}
                </h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {getClientProjects(client.id)} مشاريع
              </span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
        {recentClients.length === 0 && (
          <p className="text-center text-muted-foreground py-8">لا يوجد عملاء</p>
        )}
      </div>
    </div>
  );
}