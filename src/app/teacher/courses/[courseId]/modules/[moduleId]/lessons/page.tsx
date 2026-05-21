"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import { PremiumModal } from "@/components/ui/premium-modal";
import { 
  PlayCircle, PlusCircle, Trash2, Edit3, AlertTriangle,
  ArrowLeft, FileText, ChevronUp, ChevronDown, Save, X, Video, Loader2,
  Paperclip, UploadCloud
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
  attachmentUrl: string | null;
  orderIdx: number;
}

export default function ModuleLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAttachmentUrl, setEditAttachmentUrl] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const editFormRef = useRef<HTMLDivElement>(null);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
      const data = await res.json();
      if (Array.isArray(data)) setLessons(data.sort((a, b) => a.orderIdx - b.orderIdx));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchLessons(); }, [courseId, moduleId]);

  const handleEdit = (lesson: Lesson | 'new') => {
    if (lesson === 'new') {
      setIsEditing('new'); setEditTitle(""); setEditVideoUrl(""); setEditContent("");
      setEditAttachmentUrl(null); setAttachmentFile(null);
    } else {
      setIsEditing(lesson.id); setEditTitle(lesson.title);
      setEditVideoUrl(lesson.videoUrl || ""); setEditContent(lesson.content || "");
      setEditAttachmentUrl(lesson.attachmentUrl || null); setAttachmentFile(null);
    }
    // Scroll to form after state update
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      alert("Faqat PDF yoki DOCX formatlar qabul qilinadi");
      e.target.value = "";
      return;
    }
    setAttachmentFile(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      // Upload file first if a new file was selected
      let finalAttachmentUrl = editAttachmentUrl;
      if (attachmentFile) {
        setIsUploadingFile(true);
        const fd = new FormData();
        fd.append("file", attachmentFile);
        fd.append("courseId", courseId);
        const uploadRes = await fetch("/api/upload/lesson-attachment", { method: "POST", body: fd });
        setIsUploadingFile(false);
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(err.error || "Fayl yuklanmadi");
          setIsSaving(false);
          return;
        }
        const { url } = await uploadRes.json();
        finalAttachmentUrl = url;
      }

      const isNew = isEditing === 'new';
      const url = isNew
        ? `/api/courses/${courseId}/modules/${moduleId}/lessons`
        : `/api/courses/${courseId}/modules/${moduleId}/lessons/${isEditing}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          videoUrl: editVideoUrl || null,
          content: editContent || null,
          orderIdx: isNew ? lessons.length + 1 : undefined,
          attachmentUrl: finalAttachmentUrl,
        }),
      });
      if (res.ok) { await fetchLessons(); setIsEditing(null); }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); setIsUploadingFile(false); }
  };

  const handleDelete = async (lessonId: string) => {
    setDeleteTargetId(lessonId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${deleteTargetId}`, { method: "DELETE" });
      if (res.ok) {
        setLessons(prev => prev.filter(l => l.id !== deleteTargetId));
        setDeleteTargetId(null);
      }
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const handleMove = async (lessonId: string, direction: 'up' | 'down') => {
    const idx = lessons.findIndex(l => l.id === lessonId);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === lessons.length - 1)) return;
    const newLessons = [...lessons];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newLessons[idx], newLessons[targetIdx]] = [newLessons[targetIdx], newLessons[idx]];
    setLessons(newLessons.map((l, i) => ({ ...l, orderIdx: i + 1 })));
    try {
      await Promise.all([
        fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${newLessons[idx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderIdx: idx + 1 }) }),
        fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${newLessons[targetIdx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderIdx: targetIdx + 1 }) }),
      ]);
    } catch (err) { console.error(err); }
  };

  const inputCls = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm";

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Modulga qaytish
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            Darslar jadvali
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Ushbu modul uchun dars materiallari, videolar va matnlarni boshqaring.</p>
        </div>
        <Button onClick={() => handleEdit('new')} className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm shadow-blue-200 shrink-0 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> Yangi dars
        </Button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div ref={editFormRef} className="mb-6 bg-white border border-blue-200 rounded-2xl shadow-md p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              {isEditing === 'new' ? <PlusCircle className="w-5 h-5 text-blue-600" /> : <Edit3 className="w-5 h-5 text-blue-600" />}
              {isEditing === 'new' ? "Yangi dars qo'shish" : "Darsni tahrirlash"}
            </h2>
            <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Dars nomi</label>
                <input required value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputCls} placeholder="Mavzu: Kirish qismi" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Video URL</label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)}
                    className={`${inputCls} pl-10`} placeholder="YouTube yoki mp4 link" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Fayl biriktirish (PDF / DOCX, ixtiyoriy)</label>
              {editAttachmentUrl && !attachmentFile ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
                  <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700 truncate flex-1">
                    {editAttachmentUrl.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditAttachmentUrl(null)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : attachmentFile ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50">
                  <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-semibold text-blue-700 truncate flex-1">{attachmentFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachmentFile(null)}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-500">Fayl tanlash (PDF yoki DOCX)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Dars matni (ixtiyoriy)</label>
              <RichTextEditor value={editContent} onChange={setEditContent} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(null)} className="h-10 px-5 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100">Bekor qilish</Button>
              <Button type="submit" disabled={isSaving} className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Save className="w-4 h-4" /> {isUploadingFile ? "Yuklanmoqda..." : isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lessons List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-500" /></div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium mb-3">Ushbu modulda hali darslar yo'q.</p>
          <button onClick={() => handleEdit('new')} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Darsni yarating</button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="group bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 flex-1 w-full min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center border border-blue-100 shrink-0">
                  {lesson.orderIdx}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {lesson.videoUrl ? (
                      <span className="flex items-center text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                        <PlayCircle className="w-3 h-3 mr-1" /> Video bor
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">Video yo'q</span>
                    )}
                    {lesson.content ? (
                      <span className="flex items-center text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <FileText className="w-3 h-3 mr-1" /> Matn bor
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">Matn yo'q</span>
                    )}
                    {lesson.attachmentUrl && (
                      <span className="flex items-center text-[10px] text-violet-600 font-black uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                        <Paperclip className="w-3 h-3 mr-1" /> Fayl bor
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                <div className="flex items-center gap-1 pr-3 border-r border-slate-100">
                  <button onClick={() => handleMove(lesson.id, 'up')} disabled={idx === 0}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMove(lesson.id, 'down')} disabled={idx === lessons.length - 1}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit3 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <PremiumModal
        isOpen={!!deleteTargetId}
        onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
        title="DARSNI O'CHIRISH"
        description="Ushbu darsni o'chirishni xohlaysizmi? Dars bilan birga barcha materiallar ham butunlay o'chib ketadi."
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
