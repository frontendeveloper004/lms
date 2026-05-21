"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Code2, PlusCircle, Trash2, Edit3, ArrowLeft, Save, X, ListChecks, Loader2, AlertTriangle, Terminal } from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";

interface Question { id?: string; text: string; options: string[]; correctIdx: number; }
interface Quiz { id: string; title: string; orderIdx: number; questions: Question[]; }

export default function ModuleQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/quizzes`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuizzes(data.map(q => ({
          ...q,
          questions: q.questions.map((ques: any) => ({
            ...ques,
            options: typeof ques.options === 'string' ? JSON.parse(ques.options) : ques.options
          }))
        })));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchQuizzes(); }, [courseId, moduleId]);

  const handleEdit = (quiz: Quiz | 'new') => {
    if (quiz === 'new') {
      setIsEditing('new'); setEditTitle("");
      setEditQuestions([{ text: "", options: ["", "", "", ""], correctIdx: 0 }]);
    } else {
      setIsEditing(quiz.id); setEditTitle(quiz.title); setEditQuestions(quiz.questions);
    }
  };

  const addQuestion = () => setEditQuestions([...editQuestions, { text: "", options: ["", "", "", ""], correctIdx: 0 }]);
  const removeQuestion = (idx: number) => setEditQuestions(editQuestions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: string, value: any) => {
    const q = [...editQuestions]; (q[idx] as any)[field] = value; setEditQuestions(q);
  };
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const q = [...editQuestions]; q[qIdx].options[oIdx] = value; setEditQuestions(q);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      const isNew = isEditing === 'new';
      const url = isNew
        ? `/api/courses/${courseId}/modules/${moduleId}/quizzes`
        : `/api/courses/${courseId}/modules/${moduleId}/quizzes/${isEditing}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, questions: editQuestions }),
      });
      if (res.ok) { await fetchQuizzes(); setIsEditing(null); }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (quizId: string) => {
    setDeleteTargetId(quizId);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/quizzes/${deleteTargetId}`, { method: "DELETE" });
      if (res.ok) {
        fetchQuizzes();
        setDeleteTargetId(null);
      }
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); setDeleteTargetId(null); }
  };

  const commonInputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm px-4";

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Modulga qaytish
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            Dasturlash Testlari
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Texnik bilimlarni sinash uchun savollar to'plamini yarating.</p>
        </div>
        <Button onClick={() => handleEdit('new')} className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm shadow-blue-200 shrink-0 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> Yangi Test
        </Button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="mb-6 bg-white border border-blue-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-black uppercase tracking-widest">{isEditing === 'new' ? "Yangi Test Konstruktori" : "Test Mantiqini Tahrirlash"}</h2>
            </div>
            <button onClick={() => setIsEditing(null)} className="text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Test Sarlavhasi
              </label>
              <input required value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className={`${commonInputCls} h-12 border-2 focus:border-blue-500 placeholder:italic font-mono`}
                placeholder="Masalan: JavaScript Async/Await va Promises" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Mantiqiy Savollar
              </label>
              {editQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200 relative group hover:border-blue-200 transition-all">
                  <button type="button" onClick={() => removeQuestion(qIdx)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase">Savol #{qIdx + 1}</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <textarea required value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-mono leading-relaxed outline-none focus:border-blue-400 transition-all text-slate-800 placeholder:text-slate-300 min-h-[100px]"
                      placeholder="Savol kodi yoki matnini bu yerga kiriting... (Masalan: O(n log n) murakkabligi nima?)" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${q.correctIdx === oIdx ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200'}`}>
                          <div className="relative flex items-center">
                            <input type="radio" checked={q.correctIdx === oIdx} onChange={() => updateQuestion(qIdx, 'correctIdx', oIdx)}
                              className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer" />
                          </div>
                          <input required value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-transparent border-none p-0 text-xs font-mono font-bold outline-none text-slate-900 placeholder:text-slate-300"
                            placeholder={`Variant ${oIdx + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addQuestion}
                className="w-full h-12 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4" /> Savol Qo'shish
              </button>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(null)} className="h-11 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100">Bekor qilish</Button>
              <Button type="submit" disabled={isSaving} className="h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-900 hover:bg-black text-white border-0 gap-2 shadow-xl shadow-slate-200">
                <Save className="w-4 h-4" /> {isSaving ? "Saqlanmoqda..." : "Testni Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/30 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5 border border-slate-100">
            <ListChecks className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold mb-4">Ushbu modul uchun hali testlar yaratilmagan.</p>
          <button onClick={() => handleEdit('new')} className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-700 transition-colors">Birinchi Testni Boshlash</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 hover:shadow-xl hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shrink-0 shadow-sm">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{quiz.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" /> {quiz.questions.length} Savol
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Mantiq Darajasi</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(quiz)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white shadow-none transition-all"><Edit3 className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-slate-200 mx-0.5" />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white shadow-none transition-all"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <PremiumModal
        isOpen={!!deleteTargetId}
        onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
        title="TESTNI O'CHIRISH?"
        description="Ushbu amalni ortga qaytarib bo'lmaydi. Barcha savollar butunlay o'chiriladi."
        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
      >
        <div className="space-y-3">
          <Button
            variant="destructive"
            type="button"
            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-0 shadow-lg shadow-red-200"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> O'chirishni Tasdiqlash</>}
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
