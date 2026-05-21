"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ClipboardList, Loader2, CheckCircle2, Clock,
  ChevronRight, BookOpen, Layers, Filter, X, FolderOpen,
  ChevronDown, ChevronUp, User, SlidersHorizontal, Bot, UserCheck
} from "lucide-react";

interface Course { id: string; title: string; }

interface SubmissionItem {
  submissionId: string;
  status: string;
  score: number | null;
  feedback: string | null;
  xpBonus: number | null;
  submittedAt: string;
  gradedAt: string | null;
  gradedBy: string;
  aiScore: number | null;
  aiFeedback: string | null;
  aiGradedAt: string | null;
  aiConfidence: number | null;
  student: { id: string; name: string; email: string; avatar: string | null };
  assignment: { id: string; title: string };
  module: { id: string; title: string };
  course: { id: string; title: string };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", accent: "bg-blue-400" },
  { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200", accent: "bg-violet-400" },
  { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200", accent: "bg-emerald-400" },
  { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200", accent: "bg-amber-400" },
  { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200", accent: "bg-rose-400" },
  { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200", accent: "bg-cyan-400" },
];

function StudentGroup({
  studentName, studentEmail, submissions, defaultOpen, onNavigate,
}: {
  studentName: string; studentEmail: string;
  submissions: SubmissionItem[]; defaultOpen: boolean;
  onNavigate: (sub: SubmissionItem) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const idx = studentName.charCodeAt(0) % AVATAR_COLORS.length;
  const c = AVATAR_COLORS[idx];
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const gradedCount = submissions.filter((s) => s.status === "GRADED").length;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${c.accent}`} />
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/70 transition-colors text-left">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 ${c.bg} ${c.text} ${c.border}`}>
          {studentName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-tight">{studentName}</p>
          <p className="text-xs text-slate-400 truncate">{studentEmail}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black">
              <Clock className="w-2.5 h-2.5" />{pendingCount}
            </span>
          )}
          {gradedCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
              <CheckCircle2 className="w-2.5 h-2.5" />{gradedCount}
            </span>
          )}
          <span className="text-[11px] font-bold text-slate-400 ml-0.5">{submissions.length}ta</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 ml-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {submissions.map((sub) => {
            const isPending = sub.status === "PENDING";
            return (
              <div key={sub.submissionId} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-wrap items-center gap-1 text-[11px] mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 max-w-[110px] truncate">{sub.course.title}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold max-w-[90px] truncate">{sub.module.title}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100 max-w-[90px] truncate">{sub.assignment.title}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <p className="text-[11px] text-slate-400 font-medium shrink-0">{formatDate(sub.submittedAt)}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPending ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wide">
                        <Clock className="w-2.5 h-2.5" /> Kutilmoqda
                      </span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {sub.score}/100
                        </span>
                        {sub.gradedBy === "AI" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black">
                            <Bot className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                        {sub.gradedBy === "TEACHER" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black">
                            <UserCheck className="w-2.5 h-2.5" /> O'qituvchi
                          </span>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => onNavigate(sub)}
                      className={`h-7 px-3 rounded-xl font-black text-[10px] uppercase tracking-wide inline-flex items-center gap-1 border-0 ${
                        isPending ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isPending ? "Baholash" : sub.gradedBy === "AI" ? "Tekshirish" : "Ko'rish"} <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileFilterSheet({
  open, onClose, courses, availableModules,
  filterCourse, filterModule, filterStatus,
  setFilterCourse, setFilterModule, setFilterStatus, activeCount,
}: {
  open: boolean; onClose: () => void; courses: Course[];
  availableModules: { id: string; title: string }[];
  filterCourse: string; filterModule: string; filterStatus: string;
  setFilterCourse: (v: string) => void; setFilterModule: (v: string) => void;
  setFilterStatus: (v: string) => void; activeCount: number;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" /> Filtrlash
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Kurs</label>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold outline-none focus:border-blue-400 appearance-none">
            <option value="">Barcha kurslar</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        {availableModules.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FolderOpen className="w-3 h-3" /> Modul</label>
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold outline-none focus:border-blue-400 appearance-none">
              <option value="">Barcha modullar</option>
              {availableModules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Layers className="w-3 h-3" /> Holat</label>
          <div className="flex gap-2">
            {[{ value: "", label: "Barchasi" }, { value: "PENDING", label: "Kutilmoqda" }, { value: "GRADED", label: "Baholangan" }].map((opt) => (
              <button key={opt.value} onClick={() => setFilterStatus(opt.value)} className={`flex-1 h-10 rounded-xl text-xs font-black border transition-all ${filterStatus === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          {activeCount > 0 && (
            <button onClick={() => { setFilterCourse(""); setFilterModule(""); setFilterStatus(""); }} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
              Tozalash
            </button>
          )}
          <button onClick={onClose} className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black transition-colors">Qo'llash</button>
        </div>
      </div>
    </>
  );
}

export default function SubmissionsPageClient({
  initialSubmissions,
  courses,
}: {
  initialSubmissions: SubmissionItem[];
  courses: Course[];
}) {
  const router = useRouter();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { setFilterModule(""); }, [filterCourse]);

  const availableModules = useMemo(() => {
    const src = filterCourse ? initialSubmissions.filter((s) => s.course.id === filterCourse) : initialSubmissions;
    const map = new Map<string, string>();
    src.forEach((s) => map.set(s.module.id, s.module.title));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [initialSubmissions, filterCourse]);

  const filtered = useMemo(() => {
    return initialSubmissions.filter((s) => {
      if (filterCourse && s.course.id !== filterCourse) return false;
      if (filterModule && s.module.id !== filterModule) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [initialSubmissions, filterCourse, filterModule, filterStatus]);

  const groupedByStudent = useMemo(() => {
    const map = new Map<string, { student: SubmissionItem["student"]; submissions: SubmissionItem[] }>();
    filtered.forEach((s) => {
      if (!map.has(s.student.id)) map.set(s.student.id, { student: s.student, submissions: [] });
      map.get(s.student.id)!.submissions.push(s);
    });
    return Array.from(map.values()).sort((a, b) => {
      const aPending = a.submissions.some((s) => s.status === "PENDING") ? 0 : 1;
      const bPending = b.submissions.some((s) => s.status === "PENDING") ? 0 : 1;
      return aPending - bPending;
    });
  }, [filtered]);

  const pendingCount = filtered.filter((s) => s.status === "PENDING").length;
  const gradedCount = filtered.filter((s) => s.status === "GRADED").length;
  const activeFilterCount = [filterCourse, filterModule, filterStatus].filter(Boolean).length;

  const selectCls = "h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all appearance-none cursor-pointer";

  const handleNavigate = (sub: SubmissionItem) => {
    router.push(`/teacher/courses/${sub.course.id}/modules/${sub.module.id}/assignment/submissions?submissionId=${sub.submissionId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <ClipboardList className="w-5 h-5" />
            </div>
            Topshiriqlar
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Barcha kurslardagi student topshiriqlari va ularning holati.</p>
        </div>
        <button onClick={() => setFilterSheetOpen(true)} className="md:hidden shrink-0 mt-1 flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:border-blue-300 transition-colors relative">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><User className="w-3 h-3" /> Jami</p>
          <p className="text-2xl font-black text-slate-900">{filtered.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{groupedByStudent.length} talaba</p>
        </div>
        <div className={`border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${filterStatus === "PENDING" ? "bg-amber-100 border-amber-300" : "bg-amber-50 border-amber-100 hover:border-amber-300"}`} onClick={() => setFilterStatus(filterStatus === "PENDING" ? "" : "PENDING")}>
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Kutilmoqda</p>
          <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
        </div>
        <div className={`border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${filterStatus === "GRADED" ? "bg-emerald-100 border-emerald-300" : "bg-emerald-50 border-emerald-100 hover:border-emerald-300"}`} onClick={() => setFilterStatus(filterStatus === "GRADED" ? "" : "GRADED")}>
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Baholangan</p>
          <p className="text-2xl font-black text-emerald-700">{gradedCount}</p>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-widest">Filter</span>
        </div>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className={`${selectCls} pl-8`}>
            <option value="">Barcha kurslar</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        {availableModules.length > 0 && (
          <div className="relative">
            <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className={`${selectCls} pl-8`}>
              <option value="">Barcha modullar</option>
              {availableModules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        )}
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${selectCls} pl-8`}>
            <option value="">Barcha holatlar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="GRADED">Baholangan</option>
          </select>
        </div>
        {activeFilterCount > 0 && (
          <button onClick={() => { setFilterCourse(""); setFilterModule(""); setFilterStatus(""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
            <X className="w-3.5 h-3.5" /> Tozalash
          </button>
        )}
      </div>

      {/* Active filter chips — mobile */}
      {activeFilterCount > 0 && (
        <div className="md:hidden flex flex-wrap gap-2">
          {filterCourse && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              {courses.find((c) => c.id === filterCourse)?.title}
              <button onClick={() => setFilterCourse("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filterModule && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              {availableModules.find((m) => m.id === filterModule)?.title}
              <button onClick={() => setFilterModule("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filterStatus && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              {filterStatus === "PENDING" ? "Kutilmoqda" : "Baholangan"}
              <button onClick={() => setFilterStatus("")}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {groupedByStudent.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ClipboardList className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-slate-500 font-medium">Hali hech qanday topshiriq yo'q.</p>
          <p className="text-slate-400 text-sm mt-1">Studentlar topshiriq yuborishi bilan bu yerda ko'rinadi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByStudent.map(({ student, submissions }, i) => (
            <StudentGroup
              key={student.id}
              studentName={student.name}
              studentEmail={student.email}
              submissions={submissions}
              defaultOpen={i === 0 || submissions.some((s) => s.status === "PENDING")}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}

      <MobileFilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        courses={courses}
        availableModules={availableModules}
        filterCourse={filterCourse}
        filterModule={filterModule}
        filterStatus={filterStatus}
        setFilterCourse={setFilterCourse}
        setFilterModule={setFilterModule}
        setFilterStatus={setFilterStatus}
        activeCount={activeFilterCount}
      />
    </div>
  );
}
