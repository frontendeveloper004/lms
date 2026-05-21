"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle, PlusCircle, ArrowLeft, Loader2, Trash2, Edit3, Check, X, GripVertical, AlertTriangle, Code2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { PremiumModal } from "@/components/ui/premium-modal";

interface Module { id: string; title: string; orderIdx: number; }

export default function CourseModulesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sorted = [...modules].sort((a, b) => a.orderIdx - b.orderIdx);

  const [subjectType, setSubjectType] = useState<string>("PROGRAMMING");

  useEffect(() => {
    fetch(`/api/courses/${courseId}/modules`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setModules(data); setIsLoading(false); });

    fetch("/api/teacher/profile")
      .then(res => res.json())
      .then(data => { if (data.subjectType) setSubjectType(data.subjectType); });
  }, [courseId]);

  // ── Add module ──────────────────────────────────────────────────────────────
  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, orderIdx: modules.length + 1 }),
      });
      const newModule = await res.json();
      setModules(prev => [...prev, newModule]);
      setTitle("");
      toast.success("Modul qo'shildi!");
    } catch { toast.error("Xatolik yuz berdi."); }
    finally { setIsSaving(false); }
  }

  // ── Delete module ───────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${deleteTargetId}`, { method: "DELETE" });
      if (res.ok) {
        setModules(prev => prev.filter(m => m.id !== deleteTargetId));
        toast.success("Modul o'chirildi.");
      } else { toast.error("O'chirishda xatolik."); }
    } catch { toast.error("Xatolik yuz berdi."); }
    finally { setIsDeleting(false); setDeleteTargetId(null); }
  }

  // ── Edit module title ───────────────────────────────────────────────────────
  function startEdit(mod: Module) {
    setEditingId(mod.id);
    setEditTitle(mod.title);
  }

  async function saveEdit(modId: string) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${modId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      if (res.ok) {
        setModules(prev => prev.map(m => m.id === modId ? { ...m, title: editTitle } : m));
        setEditingId(null);
        toast.success("Modul yangilandi!");
      } else { toast.error("Yangilashda xatolik."); }
    } catch { toast.error("Xatolik yuz berdi."); }
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────
  function onDragStart(idx: number) {
    dragIdx.current = idx;
    setIsDragging(true);
  }

  function onDragEnter(idx: number) {
    dragOverIdx.current = idx;
  }

  function onDragEnd() {
    setIsDragging(false);
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) {
      dragIdx.current = null;
      dragOverIdx.current = null;
      return;
    }
    const reordered = [...sorted];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const updated = reordered.map((m, i) => ({ ...m, orderIdx: i + 1 }));
    setModules(updated);
    dragIdx.current = null;
    dragOverIdx.current = null;
    // Save new order to server
    saveOrder(updated);
  }

  async function saveOrder(updated: Module[]) {
    try {
      await Promise.all(updated.map(m =>
        fetch(`/api/courses/${courseId}/modules/${m.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIdx: m.orderIdx }),
        })
      ));
      toast.success("Tartib saqlandi!");
    } catch { toast.error("Tartibni saqlashda xatolik."); }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="pb-5 border-b border-slate-100 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kursga qaytish
        </button>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mb-1">Kurs modullari</h1>
        <p className="text-slate-500 text-sm font-medium">Darslarni mazmuniga qarab qismlarga (modullarga) ajrating.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── Add Module Form ── */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-blue-600" /> Yangi modul
          </h2>
          <form onSubmit={handleAddModule} className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Modul nomi</label>
              <input
                required type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
                placeholder="1-Modul: Kirish"
              />
            </div>
            <Button
              type="submit" disabled={isSaving || !title.trim()}
              className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PlusCircle className="w-4 h-4 mr-1.5" /> Modul qo'shish</>}
            </Button>
          </form>

          {/* Hint */}
          {modules.length > 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5" />
                Modullarni sudrab tartibini o'zgartiring
              </p>
            </div>
          )}
        </div>

        {/* ── Modules List ── */}
        <div className="lg:col-span-3">
          <h2 className="text-base font-black text-slate-900 mb-4">Mavjud modullar</h2>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 font-medium text-sm">Ushbu kursda hali modullar yo'q.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((mod, idx) => (
                <div
                  key={mod.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`group flex flex-col gap-3 p-4 border rounded-2xl bg-white transition-all ${
                    isDragging && dragOverIdx.current === idx
                      ? "border-blue-400 shadow-md scale-[1.01]"
                      : "border-slate-100 hover:border-blue-200 hover:shadow-sm"
                  }`}
                >
                  {/* Top row: drag handle + number + title/edit */}
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab active:cursor-grabbing shrink-0" />
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center border border-blue-100 shrink-0">
                      {mod.orderIdx}
                    </span>

                    {editingId === mod.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(mod.id); if (e.key === "Escape") setEditingId(null); }}
                        className="flex-1 h-9 px-3 rounded-xl border border-blue-300 bg-blue-50 text-slate-900 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-400/30 min-w-0"
                      />
                    ) : (
                      <>
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex-1 min-w-0 truncate">
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEdit(mod)} className="w-8 h-8 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTargetId(mod.id)} className="w-8 h-8 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Bottom row: nav buttons OR save/cancel when editing */}
                  {editingId === mod.id ? (
                    <div className="flex items-center gap-2 pl-11">
                      <button
                        onClick={() => saveEdit(mod.id)}
                        className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Saqlash
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Bekor
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 pl-11">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => router.push(`/teacher/courses/${courseId}/modules/${mod.id}/lessons`)}
                        className="h-8 px-2 rounded-xl gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 border border-blue-100 w-full"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" /> Darslar
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => router.push(`/teacher/courses/${courseId}/modules/${mod.id}/quizzes`)}
                        className="h-8 px-2 rounded-xl gap-1 text-violet-600 font-black text-[10px] uppercase tracking-widest hover:bg-violet-50 border border-violet-100 w-full"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" /> Testlar
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => router.push(`/teacher/courses/${courseId}/modules/${mod.id}/assignment`)}
                        className={`h-8 px-2 rounded-xl gap-1 font-black text-[10px] uppercase tracking-widest border w-full transition-all ${
                          subjectType === "ENGLISH" 
                            ? "text-indigo-600 hover:bg-indigo-50 border-indigo-100" 
                            : "text-blue-600 hover:bg-blue-50 border-blue-100"
                        }`}
                      >
                        {subjectType === "ENGLISH" ? (
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                        Topshiriq
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <PremiumModal
        isOpen={!!deleteTargetId}
        onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
        title="MODULNI O'CHIRISH"
        description={`Ushbu modulni o'chirishni xohlaysizmi? Barcha darslar va testlar ham butunlay o'chib ketadi.`}
        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
      >
        <div className="space-y-3">
          <Button
            variant="destructive"
            type="button"
            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-0"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Ha, o'chirish</>}
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full h-11 rounded-2xl font-black text-slate-500 hover:text-slate-900 text-xs uppercase tracking-widest"
            onClick={() => setDeleteTargetId(null)}
            disabled={isDeleting}
          >
            Bekor qilish
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
