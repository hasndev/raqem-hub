import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";

const clients = [
  {
    id: 1,
    name: "شركة الفجر للتقنية",
    email: "info@alfajr.com",
    projects: 3,
    initials: "ف",
    color: "bg-primary",
  },
  {
    id: 2,
    name: "عيادات النخيل الطبية",
    email: "contact@nakheel.sa",
    projects: 2,
    initials: "ن",
    color: "bg-success",
  },
  {
    id: 3,
    name: "متجر السعادة الإلكتروني",
    email: "hello@saada.store",
    projects: 1,
    initials: "س",
    color: "bg-warning",
  },
  {
    id: 4,
    name: "مطاعم الريف العربي",
    email: "support@reef.sa",
    projects: 1,
    initials: "ر",
    color: "bg-chart-4",
  },
];

export function RecentClients() {
  return (
    <div className="bg-card rounded-xl shadow-card animate-slide-up">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-card-foreground">أحدث العملاء</h2>
      </div>
      <div className="divide-y divide-border">
        {clients.map((client, index) => (
          <div
            key={client.id}
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <Avatar className={`${client.color} text-primary-foreground`}>
                <AvatarFallback className={client.color}>
                  {client.initials}
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
                {client.projects} مشاريع
              </span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
