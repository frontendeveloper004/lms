"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HelpCircle, PlusCircle, Trash2, Edit3, ArrowLeft, Save, X, ListChecks, Loader2, AlertTriangle } from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";

interface Question { id?: string; text: string; options: string[]; correctIdx: number; }
interface Quiz { id: string; title: string; orderIdx: number; questions: Question[]; }

export default function EnglishModuleQuizzesPage() {
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

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Modulga qaytish
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            Module Quizzes (Testlar)
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">O'quvchilar uchun ingliz tili testlarini yarating.</p>
        </div>
        <Button onClick={() => handleEdit('new')} className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm shadow-violet-200 shrink-0 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> Yangi Test
        </Button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="mb-6 bg-white border border-violet-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-violet-600 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-base font-black">{isEditing === 'new' ? "New Quiz Creation" : "Edit Quiz"}</h2>
            <button onClick={() => setIsEditing(null)} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest underline decoration-violet-400 decoration-2">Quiz Title (Sarlavha)</label>
              <input required value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-bold text-sm"
                placeholder="Unit 1: Grammar Check / Placement Test" />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Questions (Savollar)</label>
              {editQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                  <button type="button" onClick={() => removeQuestion(qIdx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-3">
                    <textarea required value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-violet-400 transition-all text-slate-900 placeholder:text-slate-400"
                      placeholder={`Question ${qIdx + 1} text...`} />
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input type="radio" checked={q.correctIdx === oIdx} onChange={() => updateQuestion(qIdx, 'correctIdx', oIdx)}
                            className="w-4 h-4 text-violet-600 accent-violet-600 shrink-0" />
                          <input required value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400 transition-all text-slate-900 placeholder:text-slate-400"
                            placeholder={oIdx === 0 ? "Option A" : oIdx === 1 ? "Option B" : oIdx === 2 ? "Option C" : "Option D"} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addQuestion}
                className="w-full h-11 border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50 rounded-xl text-sm font-bold text-slate-500 hover:text-violet-600 transition-all flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add Question (Savol qo'shish)
              </button>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditing(null)} className="h-10 px-5 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="h-10 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-violet-600 hover:bg-violet-700 text-white border-0 gap-2 shadow-sm shadow-violet-200">
                <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Quiz"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-violet-500" /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListChecks className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 font-medium mb-3">No quizzes in this module yet.</p>
          <button onClick={() => handleEdit('new')} className="text-violet-600 font-black text-xs uppercase tracking-widest hover:underline">Create first quiz</button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-200 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 group-hover:scale-110 transition-transform shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <ListChecks className="w-3 h-3" /> {quiz.questions.length} questions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(quiz)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50"><Edit3 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <PremiumModal
        isOpen={!!deleteTargetId}
        onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
        title="DELETE QUIZ"
        description="Are you sure you want to delete this quiz? All questions will be permanently removed."
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
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Yes, Delete</>}
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="w-full h-11 rounded-2xl font-black text-slate-500 hover:text-slate-900 text-xs uppercase tracking-widest"
            onClick={() => setDeleteTargetId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
