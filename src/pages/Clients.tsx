import { Plus, Search, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const clients = [
  {
    id: 1,
    name: "شركة الفجر للتقنية",
    email: "info@alfajr.com",
    phone: "0551234567",
    projects: 3,
    totalValue: "135,000 ر.س",
    initials: "ف",
    color: "bg-primary",
  },
  {
    id: 2,
    name: "عيادات النخيل الطبية",
    email: "contact@nakheel.sa",
    phone: "0559876543",
    projects: 2,
    totalValue: "70,000 ر.س",
    initials: "ن",
    color: "bg-success",
  },
  {
    id: 3,
    name: "متجر السعادة الإلكتروني",
    email: "hello@saada.store",
    phone: "0541122334",
    projects: 1,
    totalValue: "80,000 ر.س",
    initials: "س",
    color: "bg-warning",
  },
  {
    id: 4,
    name: "مطاعم الريف العربي",
    email: "support@reef.sa",
    phone: "0567788990",
    projects: 1,
    totalValue: "60,000 ر.س",
    initials: "ر",
    color: "bg-chart-4",
  },
  {
    id: 5,
    name: "شركة البناء المتقدم",
    email: "info@advanced-build.sa",
    phone: "0534455667",
    projects: 1,
    totalValue: "45,000 ر.س",
    initials: "ب",
    color: "bg-chart-5",
  },
];

const Clients = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">العملاء</h1>
            <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            عميل جديد
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في العملاء..."
            className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client, index) => (
            <div
              key={client.id}
              className="bg-card rounded-xl shadow-card p-6 hover:shadow-soft transition-shadow duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <Avatar className={`${client.color} w-14 h-14 text-xl`}>
                  <AvatarFallback className={`${client.color} text-primary-foreground`}>
                    {client.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-card-foreground">{client.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">المشاريع</p>
                  <p className="font-semibold text-card-foreground">{client.projects}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">إجمالي القيمة</p>
                  <p className="font-semibold text-primary">{client.totalValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
