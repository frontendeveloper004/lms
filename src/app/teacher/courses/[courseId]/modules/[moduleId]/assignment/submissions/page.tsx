"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import FileSystemEditor from "@/components/FileSystemEditor";
import LivePreviewPanel from "@/components/LivePreviewPanel";
import { getTaskTypeConfig, type TaskType } from "@/lib/task-types";
import {
  ArrowLeft, Code2, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Star, MessageSquare, Zap, Save,
  Eye, BookOpen, Bot, UserCheck, RefreshCw, Info, FileText
} from "lucide-react";
import EnglishSubmissionReview from "./EnglishSubmissionReview";

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

function StudentAvatar({ name }: { name: string }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const c = AVATAR_COLORS[idx];
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base border shrink-0 ${c.bg} ${c.text} ${c.border}`}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  filesCode: string | null;
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
  student: Student;
}

interface Assignment {
  id: string;
  title: string;
  rubric: string;
  taskType: string;
}

// ── AI hisobot paneli ─────────────────────────────────────────
function AIReportBanner({ sub }: { sub: Submission }) {
  if (sub.gradedBy !== "AI" || sub.aiScore === null) return null;
  const confidence = sub.aiConfidence ?? 0;
  const confidenceLabel =
    confidence >= 0.9 ? "Yuqori ishonch" :
    confidence >= 0.7 ? "O'rtacha ishonch" : "Past ishonch";
  const confidenceColor =
    confidence >= 0.9 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    confidence >= 0.7 ? "text-amber-700 bg-amber-50 border-amber-200" :
    "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="mx-4 mt-3 mb-0 rounded-xl border border-violet-200 bg-violet-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-4 h-4 text-violet-600 shrink-0" />
        <p className="text-xs font-black text-violet-700 uppercase tracking-widest">AI Baholash Hisoboti</p>
        <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${confidenceColor}`}>
          <Info className="w-2.5 h-2.5" /> {confidenceLabel} ({Math.round(confidence * 100)}%)
        </span>
      </div>
      <div className="flex items-start gap-3">
        <div className="bg-white border border-violet-100 rounded-lg px-3 py-1.5 text-center shrink-0">
          <p className="text-lg font-black text-violet-700">{sub.aiScore}</p>
          <p className="text-[10px] text-violet-500 font-bold">/ 100</p>
        </div>
        {sub.aiFeedback && (
          <p className="text-xs text-violet-800 leading-relaxed">{sub.aiFeedback}</p>
        )}
      </div>
    </div>
  );
}

// ── Right pane for grading: tabbed Preview / Rubric+Grade ─────
function GradingRightPane({
  sub, assignment, isGraded,
  gradeScore, gradeFeedback, gradeXp, gradeError, gradeSuccess, isSaving,
  setGradeScore, setGradeFeedback, setGradeXp, onGrade,
}: {
  sub: Submission;
  assignment: Assignment | null;
  isGraded: boolean;
  gradeScore: Record<string, string>;
  gradeFeedback: Record<string, string>;
  gradeXp: Record<string, string>;
  gradeError: Record<string, string>;
  gradeSuccess: Record<string, boolean>;
  isSaving: Record<string, boolean>;
  setGradeScore: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGradeFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGradeXp: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGrade: (sub: Submission) => void;
}) {
  const [tab, setTab] = useState<"preview" | "grade">("preview");
  const taskType = (assignment?.taskType as TaskType) ?? "HTML_CSS_JS";
  const isAIGraded = sub.gradedBy === "AI";

  const previewFiles: Record<string, string> = (() => {
    if (sub.filesCode) {
      try { return JSON.parse(sub.filesCode); } catch {}
    }
    return {
      "index.html": sub.htmlCode,
      "style.css": sub.cssCode,
      "script.js": sub.jsCode,
    };
  })();

  const taskConfig = getTaskTypeConfig(taskType);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 bg-slate-800 border-b border-slate-700 shrink-0">
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-t-lg border-b-2 transition-all ${
            tab === "preview"
              ? "text-emerald-400 border-emerald-400 bg-slate-700"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          <Eye className="w-3.5 h-3.5 inline mr-1.5" />Jonli Ko'rinish
        </button>
        <button
          onClick={() => setTab("grade")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-t-lg border-b-2 transition-all ${
            tab === "grade"
              ? "text-amber-400 border-amber-400 bg-slate-700"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          {isAIGraded
            ? <><RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />Qayta Baholash</>
            : <><BookOpen className="w-3.5 h-3.5 inline mr-1.5" />Baholash</>
          }
        </button>
        <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border mr-2 ${taskConfig.bgColor} ${taskConfig.color} ${taskConfig.borderColor}`}>
          {taskConfig.icon} {taskConfig.label}
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {tab === "preview" ? (
          <div className="h-full bg-white flex flex-col">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-slate-400 font-medium">Jonli Ko'rinish</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreviewPanel taskType={taskType} files={previewFiles} readOnly />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {/* AI grading info banner */}
            {isAIGraded && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-violet-600" />
                  <p className="text-xs font-black text-violet-700 uppercase tracking-widest">AI Baholagan</p>
                  {sub.aiConfidence !== null && (
                    <span className={`ml-auto text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      (sub.aiConfidence ?? 0) >= 0.9 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                      (sub.aiConfidence ?? 0) >= 0.7 ? "bg-amber-50 border-amber-200 text-amber-700" :
                      "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      Ishonch: {Math.round((sub.aiConfidence ?? 0) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-violet-600 leading-relaxed">
                  Bu topshiriq AI tomonidan avtomatik baholangan. Quyida AI natijasi ko'rsatilgan.
                  Agar noto'g'ri deb hisoblasangiz, yangi ball va izoh kiritib qayta baholang.
                </p>
              </div>
            )}

            {/* Rubric */}
            {assignment?.rubric && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2">
                  Baholash mezonlari
                </p>
                <pre className="text-sm text-amber-900 whitespace-pre-wrap font-sans leading-relaxed">
                  {assignment.rubric}
                </pre>
              </div>
            )}

            {/* Grading form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              {gradeError[sub.id] && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                  {gradeError[sub.id]}
                </div>
              )}
              {gradeSuccess[sub.id] && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Muvaffaqiyatli saqlandi!
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" /> Ball (0–100)
                  </label>
                  <input
                    type="number" min={0} max={100}
                    value={gradeScore[sub.id] ?? ""}
                    onChange={(e) => setGradeScore((p) => ({ ...p, [sub.id]: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all font-semibold text-sm"
                    placeholder="85"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" /> XP (100–1000)
                  </label>
                  <input
                    type="number" min={100} max={1000} step={50}
                    value={gradeXp[sub.id] ?? ""}
                    onChange={(e) => setGradeXp((p) => ({ ...p, [sub.id]: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all font-semibold text-sm"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Fikr-mulohaza
                </label>
                <textarea
                  rows={4}
                  value={gradeFeedback[sub.id] ?? ""}
                  onChange={(e) => setGradeFeedback((p) => ({ ...p, [sub.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 outline-none transition-all font-semibold text-sm resize-none"
                  placeholder="Talabaning ishi haqida fikringizni yozing..."
                />
              </div>

              <Button
                onClick={() => onGrade(sub)}
                disabled={isSaving[sub.id]}
                className={`w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest gap-2 border-0 shadow-sm ${
                  isAIGraded
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                }`}
              >
                {isSaving[sub.id] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAIGraded ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isAIGraded ? "O'qituvchi sifatida qayta baholash" : isGraded ? "Qayta baholash" : "Baholash"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GradingPanelPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const targetSubmissionId = searchParams.get("submissionId");

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [gradeScore, setGradeScore] = useState<Record<string, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<string, string>>({});
  const [gradeXp, setGradeXp] = useState<Record<string, string>>({});
  const [gradeError, setGradeError] = useState<Record<string, string>>({});
  const [gradeSuccess, setGradeSuccess] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const aRes = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`);
        if (aRes.ok) {
          const aData = await aRes.json();
          setAssignment(aData);
          if (aData) {
            const sRes = await fetch(`/api/teacher/assignments/${aData.id}/submissions`);
            if (sRes.ok) {
              const sData = await sRes.json();
              setSubmissions(sData);
              const scores: Record<string, string> = {};
              const feedbacks: Record<string, string> = {};
              const xps: Record<string, string> = {};
              for (const sub of sData) {
                if (sub.score !== null) scores[sub.id] = String(sub.score);
                if (sub.feedback) feedbacks[sub.id] = sub.feedback;
                if (sub.xpBonus !== null) xps[sub.id] = String(sub.xpBonus);
              }
              setGradeScore(scores);
              setGradeFeedback(feedbacks);
              setGradeXp(xps);

              if (targetSubmissionId) {
                const found = sData.find((s: Submission) => s.id === targetSubmissionId);
                if (found) {
                  setExpandedId(targetSubmissionId);
                  setTimeout(() => {
                    submissionRefs.current[targetSubmissionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId, moduleId]);

  const handleGrade = async (submission: Submission) => {
    const score = parseFloat(gradeScore[submission.id] ?? "");
    const feedback = gradeFeedback[submission.id] ?? "";
    const xpBonus = parseFloat(gradeXp[submission.id] ?? "");

    setGradeError((prev) => ({ ...prev, [submission.id]: "" }));
    setGradeSuccess((prev) => ({ ...prev, [submission.id]: false }));

    if (isNaN(score) || score < 0 || score > 100) {
      setGradeError((prev) => ({ ...prev, [submission.id]: "Ball 0 dan 100 gacha bo'lishi kerak" }));
      return;
    }
    if (!feedback.trim()) {
      setGradeError((prev) => ({ ...prev, [submission.id]: "Fikr-mulohaza kiritilishi shart" }));
      return;
    }
    if (isNaN(xpBonus) || xpBonus < 100 || xpBonus > 1000) {
      setGradeError((prev) => ({ ...prev, [submission.id]: "XP bonus 100 dan 1000 gacha bo'lishi kerak" }));
      return;
    }

    setIsSaving((prev) => ({ ...prev, [submission.id]: true }));
    try {
      const res = await fetch(
        `/api/teacher/assignments/${submission.assignmentId}/submissions/${submission.id}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, feedback: feedback.trim(), xpBonus }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setGradeError((prev) => ({ ...prev, [submission.id]: data.error || "Xatolik yuz berdi" }));
        return;
      }
      const updated = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? { ...s, ...updated, gradedBy: "TEACHER" } : s))
      );
      setGradeSuccess((prev) => ({ ...prev, [submission.id]: true }));
      if (targetSubmissionId) {
        setTimeout(() => router.push("/teacher/submissions"), 1000);
      } else {
        setTimeout(() => setExpandedId(null), 1200);
      }
    } catch (err) {
      setGradeError((prev) => ({ ...prev, [submission.id]: "Xatolik yuz berdi" }));
    } finally {
      setIsSaving((prev) => ({ ...prev, [submission.id]: false }));
    }
  };

  const submissionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const toggleExpand = (id: string) => {
    const isOpening = expandedId !== id;
    setExpandedId((prev) => (prev === id ? null : id));
    if (isOpening) {
      setTimeout(() => {
        submissionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  // Stats
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const aiGradedCount = submissions.filter((s) => s.gradedBy === "AI").length;
  const teacherGradedCount = submissions.filter((s) => s.gradedBy === "TEACHER").length;
  const isEnglish = assignment?.taskType.startsWith("ENGLISH_");

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Topshiriqqa qaytish
        </button>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
            isEnglish ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
          }`}>
            {isEnglish ? <FileText className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
          </div>
          {isEnglish ? "Topshiriqlarni tekshirish" : "Topshiriqlar baholash"}
        </h1>
        {assignment && (
          <p className="text-slate-500 mt-1 text-sm font-medium pl-0.5">
            {assignment.title} — {submissions.length} ta topshiriq
          </p>
        )}
      </div>

      {/* Stats */}
      {!isLoading && submissions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami</p>
            <p className="text-2xl font-black text-slate-900">{submissions.length}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Kutilmoqda
            </p>
            <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Bot className="w-3 h-3" /> {isEnglish ? "AI tekshirgan" : "AI baholagan"}
            </p>
            <p className="text-2xl font-black text-violet-700">{aiGradedCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> O'qituvchi
            </p>
            <p className="text-2xl font-black text-blue-700">{teacherGradedCount}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            {isEnglish ? <FileText className="w-7 h-7 text-amber-400" /> : <Code2 className="w-7 h-7 text-amber-400" />}
          </div>
          <p className="text-slate-500 font-medium">Hali hech qanday topshiriq yuborilmagan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isGraded = sub.status === "GRADED";
            const isAIGraded = sub.gradedBy === "AI";
            const isTeacherGraded = sub.gradedBy === "TEACHER";

            return (
              <div
                key={sub.id}
                ref={(el) => { submissionRefs.current[sub.id] = el; }}
                className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${
                  isAIGraded ? "border-violet-200 hover:border-violet-300" :
                  isTeacherGraded ? "border-blue-100 hover:border-blue-200" :
                  "border-slate-100 hover:border-amber-200"
                }`}
              >
                {/* Colored accent strip */}
                {(() => {
                  const idx = sub.student.name.charCodeAt(0) % AVATAR_COLORS.length;
                  return <div className={`h-1 w-full ${AVATAR_COLORS[idx].accent}`} />;
                })()}

                {/* Submission row header */}
                <button
                  onClick={() => toggleExpand(sub.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <StudentAvatar name={sub.student.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm leading-tight">{sub.student.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{sub.student.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isGraded ? (
                      <>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black">
                          <CheckCircle2 className="w-3 h-3" /> {sub.score}/100
                        </span>
                        {isAIGraded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black">
                            <Bot className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                        {isTeacherGraded && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black">
                            <UserCheck className="w-2.5 h-2.5" /> O'qituvchi
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black">
                        <Clock className="w-3 h-3" /> Kutilmoqda
                      </span>
                    )}
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* AI report banner (collapsed state) */}
                {!isExpanded && isAIGraded && <AIReportBanner sub={sub} />}

                {!isExpanded && (
                  <div className="px-4 pb-3 mt-1 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-slate-300" />
                    {formatDate(sub.submittedAt)}
                  </div>
                )}

                {/* Expanded: split-pane */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {isEnglish ? (
                       <EnglishSubmissionReview
                        sub={sub}
                        assignment={assignment}
                        isGraded={isGraded}
                        gradeScore={gradeScore}
                        gradeFeedback={gradeFeedback}
                        gradeXp={gradeXp}
                        gradeError={gradeError}
                        gradeSuccess={gradeSuccess}
                        isSaving={isSaving}
                        setGradeScore={setGradeScore}
                        setGradeFeedback={setGradeFeedback}
                        setGradeXp={setGradeXp}
                        onGrade={handleGrade}
                      />
                    ) : (
                      <div className="flex flex-col lg:flex-row">
                        <div className="h-[400px] lg:h-[600px] lg:w-1/2 overflow-hidden shrink-0">
                          {(() => {
                            const taskType = (assignment?.taskType as TaskType) ?? "HTML_CSS_JS";
                            const subFiles: Record<string, string> = (() => {
                              if (sub.filesCode) {
                                try { return JSON.parse(sub.filesCode); } catch {}
                              }
                              return {
                                "index.html": sub.htmlCode,
                                "style.css": sub.cssCode,
                                "script.js": sub.jsCode,
                              };
                            })();
                            return (
                              <FileSystemEditor
                                taskType={taskType}
                                files={subFiles}
                                readOnly
                                showHint={false}
                              />
                            );
                          })()}
                        </div>
                        <div className="hidden lg:block w-px bg-slate-200 shrink-0" />
                        <div className="lg:hidden h-px bg-slate-200 shrink-0" />
                        <div className="h-[560px] lg:h-[600px] lg:w-1/2 overflow-hidden shrink-0">
                          <GradingRightPane
                            sub={sub}
                            assignment={assignment}
                            isGraded={isGraded}
                            gradeScore={gradeScore}
                            gradeFeedback={gradeFeedback}
                            gradeXp={gradeXp}
                            gradeError={gradeError}
                            gradeSuccess={gradeSuccess}
                            isSaving={isSaving}
                            setGradeScore={setGradeScore}
                            setGradeFeedback={setGradeFeedback}
                            setGradeXp={setGradeXp}
                            onGrade={handleGrade}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GradingPanelPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
      </div>
    }>
      <GradingPanelPage />
    </Suspense>
  );
}
