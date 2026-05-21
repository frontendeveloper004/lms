"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import { PremiumModal } from "@/components/ui/premium-modal";
import TaskTypeSelector from "@/components/TaskTypeSelector";
import FileSystemEditor from "@/components/FileSystemEditor";
import LivePreviewPanel from "@/components/LivePreviewPanel";
import {
  ArrowLeft, Code2, PlusCircle, Edit3, Trash2, Save, X,
  Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  type TaskType,
  getTaskTypeConfig,
  DEFAULT_STARTER_CODE,
} from "@/lib/task-types";

interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric: string;
  taskType: string;
  starterCode: string | null;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProgrammingAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starterPreviewExpanded, setStarterPreviewExpanded] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRubric, setFormRubric] = useState("");
  const [formTaskType, setFormTaskType] = useState<TaskType>("HTML_CSS_JS");
  const [formStarterFiles, setFormStarterFiles] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  const fetchAssignment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [courseId, moduleId]);

  const handleTaskTypeChange = (type: TaskType) => {
    setFormTaskType(type);
    setFormStarterFiles({ ...DEFAULT_STARTER_CODE[type] });
  };

  const openCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormRubric("");
    setFormTaskType("HTML_CSS_JS");
    setFormStarterFiles({ ...DEFAULT_STARTER_CODE["HTML_CSS_JS"] });
    setError(null);
    setIsCreating(true);
    setIsEditing(false);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openEdit = () => {
    if (!assignment) return;
    setFormTitle(assignment.title);
    setFormDescription(assignment.description);
    setFormRubric(assignment.rubric);
    const taskType = (assignment.taskType as TaskType) || "HTML_CSS_JS";
    setFormTaskType(taskType);
    if (assignment.starterCode) {
      try {
        setFormStarterFiles(JSON.parse(assignment.starterCode));
      } catch {
        setFormStarterFiles({ ...DEFAULT_STARTER_CODE[taskType] });
      }
    } else {
      setFormStarterFiles({ ...DEFAULT_STARTER_CODE[taskType] });
    }
    setError(null);
    setIsEditing(true);
    setIsCreating(false);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formTitle.trim()) { setError("Sarlavha kiritilishi shart"); return; }
    if (!formDescription.trim()) { setError("Tavsif kiritilishi shart"); return; }
    if (!formRubric.trim()) { setError("Baholash mezonlari kiritilishi shart"); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          rubric: formRubric,
          taskType: formTaskType,
          starterCode: JSON.stringify(formStarterFiles),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Xatolik yuz berdi");
        return;
      }
      await fetchAssignment();
      setIsCreating(false);
      setIsEditing(false);
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`, { method: "DELETE" });
      if (res.ok) { setAssignment(null); setDeleteModalOpen(false); }
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const inputCls =
    "w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm";

  const assignmentTaskConfig = assignment
    ? getTaskTypeConfig(assignment.taskType || "HTML_CSS_JS")
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6">
        <button
          onClick={() => router.replace(`/teacher/courses/${courseId}/modules`)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Modulga qaytish
        </button>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          Topshiriq boshqaruvi (Dev)
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Ushbu modul uchun amaliy dasturlash topshirig'ini yarating va boshqaring.
        </p>
      </div>

      {/* ── Create / Edit Form ── */}
      {(isCreating || isEditing) && (
        <div
          ref={formRef}
          className="mb-8 bg-white border border-blue-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between p-6 border-b border-blue-100 bg-blue-50/30">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-[#0066cc]">
              {isCreating ? <PlusCircle className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              {isCreating ? "Yangi topshiriq yaratish" : "Topshiriqni tahrirlash"}
            </h2>
            <button onClick={() => { setIsCreating(false); setIsEditing(false); setError(null); }} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{error}</div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Topshiriq sarlavhasi</label>
              <input required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className={inputCls} placeholder="Masalan: JavaScript Array Methods Practice" />
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Topshiriq turi (Stack)</label>
              <p className="text-[10px] text-slate-400">Student qaysi texnologiyada kod yozishini tanlang.</p>
              <TaskTypeSelector value={formTaskType} onChange={handleTaskTypeChange} />
            </div>

            {/* Starter Code + Live Preview */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">
                Kod muharriri (Starter Code)
              </label>
              <p className="text-[10px] text-slate-400">
                Boshlang'ich kodni tayyorlang. Professional loyiha strukturasi tavsiya etiladi.
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <div className="flex flex-col lg:flex-row" style={{ height: "480px" }}>
                  <div className="flex-1 overflow-hidden">
                    <FileSystemEditor
                      taskType={formTaskType}
                      files={formStarterFiles}
                      onFilesChange={setFormStarterFiles}
                      showHint={true}
                    />
                  </div>
                  <div className="hidden lg:block w-px bg-slate-700 shrink-0" />
                  <div className="lg:hidden h-px bg-slate-200 shrink-0" />
                  <div className="flex-1 overflow-hidden bg-white flex flex-col">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium font-mono uppercase tracking-widest">Live Preview</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <LivePreviewPanel taskType={formTaskType} files={formStarterFiles} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Topshiriq tavsifi (ko'rsatmalar)</label>
              <RichTextEditor value={formDescription} onChange={setFormDescription} />
            </div>

            {/* Rubric */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Baholash mezonlari (Technical Rubric)</label>
              <textarea
                required
                value={formRubric}
                onChange={(e) => setFormRubric(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm resize-none font-mono"
                placeholder="Baholash mezonlarini kiriting. Masalan:&#10;- Kod tozaligi (Clean Code) - 30 ball&#10;- Algoritm optimalligi - 40 ball&#10;- Barcha test keyslar o'tdi - 30 ball"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setIsEditing(false); setError(null); }} className="h-10 px-5 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                Bekor qilish
              </Button>
              <Button type="submit" disabled={isSaving} className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white border-0 shadow-lg shadow-blue-200">
                <Save className="w-4 h-4" />
                {isSaving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
        </div>
      ) : !assignment ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Code2 className="w-7 h-7 text-blue-400" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Ushbu modul uchun hali topshiriq yo'q.</p>
          <p className="text-slate-400 text-sm mb-5 font-mono">Talabalar uchun amaliy dasturlash topshirig'ini yarating.</p>
          {!isCreating && (
            <button onClick={openCreate} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
              Topshiriq yarating
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
          {/* Card header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Code2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-lg uppercase tracking-tight">{assignment.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {assignmentTaskConfig && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${assignmentTaskConfig.bgColor} ${assignmentTaskConfig.color} ${assignmentTaskConfig.borderColor}`}>
                      {assignmentTaskConfig.icon} {assignmentTaskConfig.label}
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                    Updated: {new Date(assignment.updatedAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={openEdit} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteModalOpen(true)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Starter code preview (collapsible) */}
          {(() => {
            let hasCode = false;
            if (assignment.starterCode) {
              try {
                const parsed = JSON.parse(assignment.starterCode);
                hasCode = Object.values(parsed).some((v) => String(v).trim().length > 0);
              } catch {}
            }
            if (!hasCode) return null;
            return (
              <div className="border-b border-slate-100">
                <button
                  onClick={() => setStarterPreviewExpanded(!starterPreviewExpanded)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 font-mono">
                    <Code2 className="w-3.5 h-3.5" /> Source Code (Read Only)
                  </p>
                  {starterPreviewExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {starterPreviewExpanded && (
                  <div className="px-6 pb-4">
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner" style={{ height: "300px" }}>
                      <FileSystemEditor
                        taskType={(assignment.taskType as TaskType) || "HTML_CSS_JS"}
                        files={(() => { try { return JSON.parse(assignment.starterCode!); } catch { return {}; } })()}
                        readOnly
                        showHint={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Description */}
          <div className="p-6 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Description / Requirements</p>
            <div className="rich-content text-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: assignment.description }} />
          </div>

          {/* Rubric */}
          <div className="p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 font-mono">Technical Rubric</p>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
              {assignment.rubric}
            </pre>
          </div>
        </div>
      )}

      {!assignment && !isCreating && !isLoading && (
        <div className="mt-6 flex justify-center">
          <Button onClick={openCreate} className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-200">
            <PlusCircle className="w-4 h-4" /> Topshiriq yaratish
          </Button>
        </div>
      )}

      <PremiumModal
        isOpen={deleteModalOpen}
        onClose={() => { if (!isDeleting) setDeleteModalOpen(false); }}
        title="TOPSHIRIQNI O'CHIRISH"
        description="Ushbu topshiriqni o'chirishni xohlaysizmi? Barcha talabalar topshiriqlari ham butunlay o'chib ketadi."
        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
      >
        <div className="space-y-3">
          <Button variant="destructive" type="button" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-0" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Ha, o'chirish</>}
          </Button>
          <Button variant="ghost" type="button" className="w-full h-11 rounded-2xl font-black text-slate-500 hover:text-slate-900 text-xs uppercase tracking-widest" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Bekor qilish
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
