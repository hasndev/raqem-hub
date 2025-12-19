import { useState } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/context/StoreContext";
import { Client, clientTypes } from "@/types";
import { useToast } from "@/hooks/use-toast";

const typeColors = {
  government: "bg-primary",
  company: "bg-success",
  individual: "bg-warning",
};

const Clients = () => {
  const { clients, projects, addClient, updateClient, deleteClient } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", type: "company" as Client["type"], notes: ""
  });

  const filteredClients = clients.filter(c => 
    c.name.includes(search) || c.email?.includes(search)
  );

  const getClientProjects = (clientId: string) => projects.filter(p => p.client_id === clientId);
  const getClientTotalValue = (clientId: string) => 
    getClientProjects(clientId).reduce((sum, p) => sum + p.budget, 0);

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "", type: "company", notes: "" });
  };

  const handleAdd = async () => {
    await addClient({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      type: formData.type,
      notes: formData.notes || null,
    });
    setIsAddOpen(false);
    resetForm();
    toast({ title: "تم إضافة العميل بنجاح" });
  };

  const handleEdit = async () => {
    if (!selectedClient) return;
    await updateClient(selectedClient.id, {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      type: formData.type,
      notes: formData.notes || null,
    });
    setIsEditOpen(false);
    setSelectedClient(null);
    resetForm();
    toast({ title: "تم تحديث بيانات العميل" });
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    await deleteClient(selectedClient.id);
    setIsDeleteOpen(false);
    setSelectedClient(null);
    toast({ title: "تم حذف العميل", variant: "destructive" });
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      type: client.type,
      notes: client.notes || "",
    });
    setIsEditOpen(true);
  };

  const ClientForm = ({ onSubmit, submitText }: { onSubmit: () => void; submitText: string }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">اسم العميل</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="أدخل اسم العميل"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">نوع العميل</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Client["type"] })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {Object.entries(clientTypes).map(([key, val]) => (
            <option key={key} value={key}>{val}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">العنوان</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">ملاحظات</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full h-24 px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>
          إلغاء
        </Button>
        <Button onClick={onSubmit}>{submitText}</Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">العملاء</h1>
            <p className="text-muted-foreground">إدارة قاعدة بيانات العملاء</p>
          </div>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            عميل جديد
          </Button>
        </div>

        <div className="relative max-w-md animate-slide-up">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في العملاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => {
            const clientProjects = getClientProjects(client.id);
            const totalValue = getClientTotalValue(client.id);
            return (
              <div
                key={client.id}
                className="bg-card rounded-xl shadow-card p-6 hover:shadow-soft transition-shadow duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className={`${typeColors[client.type]} w-14 h-14 text-xl`}>
                      <AvatarFallback className={`${typeColors[client.type]} text-primary-foreground`}>
                        {client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-card-foreground">{client.name}</h3>
                      <Badge variant="secondary" className="mt-1">{clientTypes[client.type]}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClient(client); setIsViewOpen(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClient(client); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {client.email || "-"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {client.phone || "-"}
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">المشاريع</p>
                    <p className="font-semibold text-card-foreground">{clientProjects.length}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">إجمالي القيمة</p>
                    <p className="font-semibold text-primary">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredClients.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">لا يوجد عملاء</p>
          )}
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="إضافة عميل جديد">
        <ClientForm onSubmit={handleAdd} submitText="إضافة العميل" />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedClient(null); resetForm(); }} title="تعديل بيانات العميل">
        <ClientForm onSubmit={handleEdit} submitText="حفظ التغييرات" />
      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setSelectedClient(null); }} title="تفاصيل العميل" size="lg">
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className={`${typeColors[selectedClient.type]} w-20 h-20 text-3xl`}>
                <AvatarFallback className={`${typeColors[selectedClient.type]} text-primary-foreground`}>
                  {selectedClient.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{selectedClient.name}</h3>
                <Badge className="mt-1">{clientTypes[selectedClient.type]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-medium">{selectedClient.email || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium">{selectedClient.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإضافة</p>
                <p className="font-medium">{selectedClient.created_at?.split('T')[0] || "-"}</p>
              </div>
              {selectedClient.address && (
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">{selectedClient.address}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-3">مشاريع العميل</h4>
              <div className="space-y-2">
                {getClientProjects(selectedClient.id).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-primary font-semibold">${project.budget.toLocaleString()}</span>
                  </div>
                ))}
                {getClientProjects(selectedClient.id).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">لا توجد مشاريع</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedClient(null); }}
        onConfirm={handleDelete}
        title="حذف العميل"
        description={`هل أنت متأكد من حذف العميل "${selectedClient?.name}"؟`}
        confirmText="حذف"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default Clients;