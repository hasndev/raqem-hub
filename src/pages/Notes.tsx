import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Search,
  StickyNote,
  Pencil,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Note {
  id: string;
  title: string;
  content: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

const NotesPage = () => {
  const { toast } = useToast();
  const { user, profile, isAdmin } = useAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data: notesData, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each note
      const userIds = [...new Set((notesData || []).map(n => n.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const notesWithUsers = (notesData || []).map(note => ({
        ...note,
        user_name: profileMap.get(note.user_id) || "مستخدم",
      }));

      setNotes(notesWithUsers);
    } catch (error: any) {
      toast({
        title: "خطأ في جلب الملاحظات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setSelectedNote(note);
      setForm({ title: note.title, content: note.content || "" });
    } else {
      setSelectedNote(null);
      setForm({ title: "", content: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "يرجى إدخال عنوان الملاحظة", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedNote) {
        const { error } = await supabase
          .from("notes")
          .update({ title: form.title, content: form.content })
          .eq("id", selectedNote.id);
        if (error) throw error;
        toast({ title: "تم تحديث الملاحظة بنجاح" });
      } else {
        const { error } = await supabase
          .from("notes")
          .insert({ title: form.title, content: form.content, user_id: user?.id });
        if (error) throw error;
        toast({ title: "تم إضافة الملاحظة بنجاح" });
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    try {
      const { error } = await supabase.from("notes").delete().eq("id", selectedNote.id);
      if (error) throw error;
      toast({ title: "تم حذف الملاحظة" });
      setIsDeleteOpen(false);
      fetchNotes();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()) ||
      n.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const canEditNote = (note: Note) => {
    return note.user_id === user?.id || isAdmin;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الملاحظات</h1>
            <p className="text-muted-foreground">ملاحظات ومذكرات الفريق</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة ملاحظة
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الملاحظات</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
              <StickyNote className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ملاحظاتي</p>
                <p className="text-2xl font-bold">
                  {notes.filter((n) => n.user_id === user?.id).length}
                </p>
              </div>
              <User className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">اليوم</p>
                <p className="text-2xl font-bold">
                  {notes.filter((n) => {
                    const today = new Date().toDateString();
                    return new Date(n.created_at).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث في الملاحظات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pr-10 pl-4 bg-card border border-border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              لا توجد ملاحظات
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <div
                key={note.id}
                className="bg-card rounded-xl shadow-card p-5 animate-fade-in hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-foreground line-clamp-1">{note.title}</h3>
                  {canEditNote(note) && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleOpenModal(note)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setSelectedNote(note);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {note.content || "لا يوجد محتوى"}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 bg-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {note.user_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{note.user_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedNote ? "تعديل الملاحظة" : "إضافة ملاحظة جديدة"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">العنوان *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="عنوان الملاحظة"
              className="w-full h-10 px-4 bg-muted border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">المحتوى</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="محتوى الملاحظة..."
              rows={6}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : selectedNote ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="حذف الملاحظة"
        description={`هل أنت متأكد من حذف "${selectedNote?.title}"؟`}
        confirmText="حذف"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default NotesPage;
