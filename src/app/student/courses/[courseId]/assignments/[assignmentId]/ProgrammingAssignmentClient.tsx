"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CodeEditorTabs from "@/components/CodeEditorTabs";
import LivePreview from "@/components/LivePreview";
import FileSystemEditor from "@/components/FileSystemEditor";
import LivePreviewPanel from "@/components/LivePreviewPanel";
import { getTaskTypeConfig, DEFAULT_STARTER_CODE, type TaskType } from "@/lib/task-types";
import {
  ArrowLeft, Loader2, Lock, Code2, Clock, CheckCircle2,
  HelpCircle, Menu, Star, Zap, MessageSquare, Send, RefreshCw,
  Eye, BookOpen, X, ChevronDown, Bot, UserCheck, Info, ChevronRight, ChevronLeft, LayoutDashboard,
  FileText, Music, FileAudio
} from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";
import AudioPlayer from "@/components/AudioPlayer";
import confetti from "canvas-confetti";

type AssignmentStatus = "locked" | "unlocked" | "submitted" | "graded";

interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric: string;
  taskType: string;
  starterCode: string | null;
  attachmentUrl: string | null;
  allowResubmit: boolean;
  aiGradingEnabled: boolean;
}

interface Submission {
  id: string;
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
  aiConfidence: number | null;
}

interface CurriculumAssignment {
  type: "assignment";
  id: string;
  title: string;
  status: AssignmentStatus;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  orderIdx: number;
  lessons: any[];
  quizzes: any[];
  assignment: CurriculumAssignment | null;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface ProgrammingAssignmentClientProps {
  courseId: string;
  assignmentId: string;
  course: Course;
  assignment: Assignment;
  submission: Submission | null;
  assignmentStatus: AssignmentStatus;
  onRefresh: () => void;
}

// ── Right pane: tabbed Ko'rsatmalar / Preview ────────────────
function RightPane({
  assignment, submission, isGraded, taskType, files,
}: {
  assignment: Assignment;
  submission: Submission | null;
  isGraded: boolean;
  taskType: TaskType;
  files: Record<string, string>;
}) {
  const [tab, setTab] = useState<"instructions" | "preview">("preview");
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 bg-slate-800 border-b border-slate-700 shrink-0">
        <button
          onClick={() => setTab("instructions")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-t-lg border-b-2 transition-all ${
            tab === "instructions"
              ? "text-amber-600 border-amber-500 bg-amber-50"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />Ko'rsatmalar
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-t-lg border-b-2 transition-all ${
            tab === "preview"
              ? "text-emerald-600 border-emerald-500 bg-emerald-50"
              : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          <Eye className="w-3.5 h-3.5 inline mr-1.5" />Jonli Ko'rinish
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {tab === "instructions" ? (
          <div className="h-full overflow-y-auto p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Code2 className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="font-black text-slate-900 text-base">{assignment.title}</h2>
              </div>

              <div
                className="rich-content text-sm text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: assignment.description }}
              />

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Baholash mezonlari
                </p>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {assignment.rubric}
                </pre>
              </div>

              {isGraded && submission && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Baholash natijasi
                  </p>
                  {/* Baholagan shaxs */}
                  {submission.gradedBy === "AI" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100">
                      <Bot className="w-4 h-4 text-violet-600 shrink-0" />
                      <p className="text-xs font-bold text-violet-700">
                        Sun'iy intellekt (AI) tomonidan baholandi
                        {submission.aiConfidence !== null && (
                          <span className="ml-1 text-violet-500">
                            · Ishonch: {Math.round((submission.aiConfidence ?? 0) * 100)}%
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {submission.gradedBy === "TEACHER" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                      <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-xs font-bold text-blue-700">O'qituvchi tomonidan baholandi</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <Star className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-2xl font-black text-emerald-700">{submission.score}</p>
                      <p className="text-xs text-emerald-600 font-bold">/ 100 ball</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                      <Zap className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <p className="text-2xl font-black text-yellow-700">+{submission.xpBonus}</p>
                      <p className="text-xs text-yellow-600 font-bold">XP bonus</p>
                    </div>
                  </div>
                  {submission.feedback && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-black text-blue-700 uppercase tracking-widest">
                          {submission.gradedBy === "AI" ? "AI izohi" : "O'qituvchi izohi"}
                        </p>
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full p-3">
            <div className="h-full rounded-xl overflow-hidden border border-slate-200 bg-white flex flex-col">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-slate-400 font-medium">Jonli Ko'rinish</span>
                {(() => {
                  const cfg = getTaskTypeConfig(taskType);
                  return (
                    <span className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex-1 overflow-hidden">
                <LivePreviewPanel taskType={taskType} files={files} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgrammingAssignmentClient({
  courseId,
  assignmentId,
  course,
  assignment: initialAssignment,
  submission: initialSubmission,
  assignmentStatus,
  onRefresh
}: ProgrammingAssignmentClientProps) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(initialAssignment);
  const [submission, setSubmission] = useState(initialSubmission);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  // Editor state — multi-file support
  const [files, setFiles] = useState<Record<string, string>>({});
  const taskType = (assignment?.taskType as TaskType) ?? "HTML_CSS_JS";

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // AI Polling state
  const [isPollingAI, setIsPollingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [nextItemUrl, setNextItemUrl] = useState<string | null>(null);
  const [celebrationData, setCelebrationData] = useState<{ certificateId: string } | null>(null);
  const [pendingCelebration, setPendingCelebration] = useState<string | null>(null);

  // Curriculum logic for Previous / Next buttons
  const allItems = React.useMemo(() => {
    return course?.modules
      ?.slice()
      .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
      .flatMap((m: any) => {
        const lessons = (m.lessons || []).slice().sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((l: any) => ({ type: "lesson" as const, id: l.id, data: l }));
        const quizzes = (m.quizzes || []).slice().sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((q: any) => ({ type: "quiz" as const, id: q.id, data: q }));
        const assignmentItems = m.assignment ? [{ type: "assignment" as const, id: m.assignment.id, data: m.assignment }] : [];
        return [...lessons, ...quizzes, ...assignmentItems];
      }) || [];
  }, [course]);

  const currentIdx = allItems.findIndex((i: any) => i.type === "assignment" && i.id === assignmentId);
  const prevItem = currentIdx > 0 ? allItems[currentIdx - 1] : null;
  const nextItem = currentIdx >= 0 && currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null;

  const getUrl = (item: any) => {
    if (!item) return null;
    if (item.type === "lesson") return `/student/courses/${courseId}/lessons/${item.id}`;
    if (item.type === "quiz") return `/student/courses/${courseId}/quizzes/${item.id}`;
    if (item.type === "assignment") return `/student/courses/${courseId}/assignments/${item.id}`;
    return null;
  };
  
  const prevItemUrl = getUrl(prevItem);
  const calculatedNextItemUrl = getUrl(nextItem);

  const showLockedToast = (msg: string) => {
    setLockedToast(msg);
    setTimeout(() => setLockedToast(null), 2500);
  };

  useEffect(() => {
    setAssignment(initialAssignment);
    setSubmission(initialSubmission);

    const type: TaskType = (initialAssignment?.taskType as TaskType) ?? "HTML_CSS_JS";

    if (initialSubmission) {
      if (initialSubmission.filesCode) {
        try {
          setFiles(JSON.parse(initialSubmission.filesCode));
        } catch {
          setFiles({ ...DEFAULT_STARTER_CODE[type] });
        }
      } else {
        setFiles({
          "index.html": initialSubmission.htmlCode || "",
          "style.css": initialSubmission.cssCode || "",
          "script.js": initialSubmission.jsCode || "",
        });
      }
    } else if (initialAssignment?.starterCode) {
      try {
        setFiles(JSON.parse(initialAssignment.starterCode));
      } catch {
        setFiles({ ...DEFAULT_STARTER_CODE[type] });
      }
    } else {
      setFiles({ ...DEFAULT_STARTER_CODE[type] });
    }
  }, [initialAssignment, initialSubmission]);

  // AI Polling Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPollingAI) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.submission?.status === "GRADED" && data.submission?.gradedBy === "AI") {
              setSubmission(data.submission);
              setIsPollingAI(false);
              setSubmitSuccess(false);

              // Refetch curriculum to check if course is newly completed
              const curRes = await fetch(`/api/student/courses/${courseId}/curriculum`);
              if (curRes.ok) {
                const curData = await curRes.json();
                if (curData.earnedCertificateId) {
                  setPendingCelebration(curData.earnedCertificateId);
                }
              }
              setShowAIModal(true);
              onRefresh();
            }
          }
        } catch (err) {
          console.error("AI polling error", err);
        }
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isPollingAI, courseId, assignmentId, onRefresh]);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    const isMultiFile = taskType !== "HTML_CSS_JS";
    const hasContent = Object.values(files).some((v) => v.trim());

    if (!hasContent) {
      setSubmitError("Javob bo'sh bo'lishi mumkin emas");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = isMultiFile
        ? { filesCode: files }
        : {
            htmlCode: files["index.html"] ?? "",
            cssCode: files["style.css"] ?? "",
            jsCode: files["script.js"] ?? "",
          };

      const res = await fetch(
        `/api/student/courses/${courseId}/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Xatolik yuz berdi");
        alert(data.error || "Xatolik yuz berdi");
        return;
      }

      const updatedSubmission = await res.json();
      setSubmission(updatedSubmission);
      setSubmitSuccess(true);
      onRefresh();

      // Get updated curriculum to check course completion newly
      const updatedRes = await fetch(`/api/student/courses/${courseId}/curriculum`);
      if (updatedRes.ok) {
        const updatedCourse = await updatedRes.json();

        if (assignment?.aiGradingEnabled && updatedSubmission.status !== "GRADED") {
          setNextItemUrl(calculatedNextItemUrl || "/student");
          setIsPollingAI(true);
        } else {
          if (updatedCourse.earnedCertificateId) {
            setCelebrationData({ certificateId: updatedCourse.earnedCertificateId });
            const end = Date.now() + 2500;
            const frame = () => {
              confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
              confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
              if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
          } else {
            setTimeout(() => {
              router.push(calculatedNextItemUrl || "/student");
            }, 1000);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError("Xatoli yuz berdi: " + err.message);
      alert("Xatoli yuz berdi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    if (!course) return null;
    const activeModuleId = course.modules.find((m) => m.assignment?.id === assignmentId)?.id;
    const [openModuleId, setOpenModuleId] = React.useState<string | null>(activeModuleId ?? null);

    return (
      <div className={`flex flex-col h-full bg-white ${mobile ? "" : "border-r border-slate-100"}`}>
        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{course.title}</h2>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {course.modules?.sort((a, b) => a.orderIdx - b.orderIdx).map((mod) => {
            const isOpen = openModuleId === mod.id;
            const hasActive = mod.assignment?.id === assignmentId;
            return (
              <div key={mod.id} className="border-b border-slate-100 last:border-0">
                <button onClick={() => setOpenModuleId(isOpen ? null : mod.id)} className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${hasActive ? "bg-amber-50/50" : "hover:bg-slate-50"}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mod.orderIdx}-Modul</p>
                    <p className={`text-xs font-bold mt-0.5 ${hasActive ? "text-amber-700" : "text-slate-700"}`}>{mod.title}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="pb-1">
                    {mod.lessons?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((lesson: any) => {
                      const isLocked = lesson.isLocked;
                      return (
                        <button key={lesson.id} onClick={() => { if (isLocked) { showLockedToast("Avval oldingi darsni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/lessons/${lesson.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${isLocked ? "border-l-transparent text-slate-400 cursor-not-allowed opacity-60" : "border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"}`}>
                          <div className="shrink-0">{isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : lesson.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}</div>
                          <span className="text-xs font-semibold leading-snug">{lesson.title}</span>
                        </button>
                      );
                    })}
                    {mod.quizzes?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((quiz: any) => {
                      const isLocked = quiz.isLocked;
                      return (
                        <button key={quiz.id} onClick={() => { if (isLocked) { showLockedToast("Avval barcha darslarni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/quizzes/${quiz.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${isLocked ? "border-l-transparent text-slate-400 cursor-not-allowed opacity-60" : "border-l-transparent text-violet-600 hover:bg-violet-50 cursor-pointer"}`}>{isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" /> : quiz.isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <HelpCircle className="w-4 h-4 shrink-0" />} <span className={`text-xs font-semibold ${isLocked ? "text-slate-400" : ""}`}>Test: {quiz.title}</span></button>
                      );
                    })}
                    {mod.assignment && (
                      <button onClick={() => { if (mod.assignment!.isLocked) { showLockedToast("Avval testni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/assignments/${mod.assignment!.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${mod.assignment.isLocked ? "border-l-transparent text-slate-400 cursor-not-allowed opacity-60" : mod.assignment.id === assignmentId ? "bg-amber-50 border-l-amber-600 text-amber-700" : "border-l-transparent text-amber-600 hover:bg-amber-50 cursor-pointer"}`}>{mod.assignment.isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" /> : mod.assignment.status === "graded" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : mod.assignment.status === "submitted" ? <Clock className="w-4 h-4 shrink-0 text-amber-500" /> : <Code2 className="w-4 h-4 shrink-0" />} <span className={`text-xs font-semibold ${mod.assignment.isLocked ? "text-slate-400" : ""}`}>Topshiriq: {mod.assignment.title}</span></button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const triggerCelebrationOrNavigate = (isCloseButton: boolean) => {
    setShowAIModal(false);
    if (pendingCelebration) {
      setCelebrationData({ certificateId: pendingCelebration });
      const end = Date.now() + 2500;
      const frame = () => {
        confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
        confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
      setPendingCelebration(null);
    } else if (!isCloseButton && nextItemUrl) {
      router.push(nextItemUrl);
    }
  };

  const isGraded = assignmentStatus === "graded" || submission?.status === "GRADED";
  const isSubmitted = assignmentStatus === "submitted" || submission?.status === "PENDING";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col shrink-0 h-full overflow-hidden">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 lg:hidden shadow-2xl animate-in slide-in-from-right-2 duration-200">
            <Sidebar mobile />
          </div>
        </>
      )}

      {lockedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-200">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {lockedToast}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push("/student")} className="text-slate-400 hover:text-amber-600 transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{course.title}</p>
              <p className="text-sm font-black text-slate-900 truncate leading-tight mt-0.5">Topshiriq: {assignment.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isGraded && submission?.score !== null && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                <Star className="w-3.5 h-3.5" /> {submission?.score}/100
              </div>
            )}
            {isSubmitted && !isGraded && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 text-xs">
                <Clock className="w-3.5 h-3.5" /> Yuborilgan
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          <div className="h-[360px] lg:h-auto lg:flex-1 flex flex-col overflow-hidden lg:w-1/2 shrink-0 lg:shrink lg:min-h-0 relative">
            <div className="flex-1 overflow-hidden p-3 pb-20 lg:pb-3">
              <FileSystemEditor
                taskType={taskType}
                files={files}
                onFilesChange={setFiles}
                readOnly={isGraded}
                showHint={!isGraded}
              />
            </div>
            {!isGraded && (
              <div className="px-3 pb-3 shrink-0">
                {submitError && <div className="mb-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">{submitError}</div>}
                {submitSuccess && <div className="mb-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Muvaffaqiyatli yuborildi!</div>}
                {isSubmitted && !assignment.allowResubmit ? (
                  <div className="w-full h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest"><Lock className="w-4 h-4" /> Qayta topshirish mumkin emas</div>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting || isPollingAI} className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest gap-2 bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm shadow-amber-200">
                    {isSubmitting || isPollingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : isSubmitted ? <RefreshCw className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    {isPollingAI ? "AI tekshirmoqda..." : isSubmitting ? "Yuborilmoqda..." : isSubmitted ? "Qayta yuborish" : "Topshirish"}
                  </Button>
                )}
              </div>
            )}
            
            <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
               <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm"
                 disabled={!prevItem}
                 onClick={() => prevItemUrl && router.push(prevItemUrl)}>
                 <ChevronLeft className="w-4 h-4" /> Oldingi
               </Button>

               <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800"
                 disabled={!nextItem}
                 onClick={() => {
                   if (!nextItem) return;
                   if (nextItem.data?.isLocked) { showLockedToast("Avval topshiriqni yakunlang"); return; }
                   if (calculatedNextItemUrl) router.push(calculatedNextItemUrl);
                 }}>
                 {nextItem?.type === 'quiz' ? "Testga o'tish" : nextItem?.type === 'assignment' ? "Topshiriqqa o'tish" : 'Keyingi dars'} <ChevronRight className="w-4 h-4" />
               </Button>
            </div>
          </div>
          <div className="hidden lg:block w-px bg-slate-200 shrink-0" />
          <div className="lg:hidden h-px bg-slate-200 shrink-0" />
          <div className="h-[580px] lg:h-auto lg:flex-1 flex flex-col overflow-hidden lg:w-1/2 shrink-0 lg:shrink lg:min-h-0">
            <RightPane assignment={assignment} submission={submission} isGraded={isGraded} taskType={taskType} files={files} />
          </div>
        </div>
      </div>

      <PremiumModal isOpen={showAIModal} onClose={() => {}} title="Baholash Natijasi" icon={<Bot className="w-8 h-8 text-violet-600" />} size="xl" footer={
        <div className="flex items-center gap-3">
          <Button onClick={() => triggerCelebrationOrNavigate(true)} variant="outline" className="flex-1 h-12 rounded-xl text-slate-500 font-bold border-slate-200 hover:bg-slate-50">Yopish</Button>
          <Button onClick={() => triggerCelebrationOrNavigate(false)} className="flex-[2] h-12 rounded-xl font-black text-xs uppercase tracking-widest bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200">
            {nextItemUrl === "/student" ? <><LayoutDashboard className="w-4 h-4 mr-2" /> Panelga qaytish</> : <>Keyingi darsga o'tish <ChevronRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      }>
        <div className="text-left">
          {submission?.aiConfidence !== null && (
            <div className="flex justify-center mb-4">
               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${ (submission?.aiConfidence ?? 0) >= 0.9 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : (submission?.aiConfidence ?? 0) >= 0.7 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700" }`}>
                 <Info className="w-3.5 h-3.5" /> Tekshiruv aniqligi: {Math.round((submission?.aiConfidence ?? 0) * 100)}%
               </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center shadow-sm">
                <Star className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-emerald-700 leading-none mb-1">{submission?.score}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">/ 100 ball</p>
             </div>
             <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center shadow-sm">
                <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-amber-700 leading-none mb-1">+{submission?.xpBonus}</p>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">XP bonus</p>
             </div>
          </div>
          {submission?.feedback && <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 shadow-sm"><div className="flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4 text-blue-600" /><p className="text-xs font-black text-blue-700 uppercase tracking-widest">Fikr-mulohaza</p></div><p className="text-sm text-blue-900 leading-relaxed font-medium">{submission.feedback}</p></div>}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm max-h-48 overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Baholash mezonlari (Qanday tekshirildi)</p>
            <pre className="text-[13px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{assignment.rubric}</pre>
          </div>
        </div>
      </PremiumModal>

      {/* ── Celebration Modal ── */}
      {celebrationData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl animate-in zoom-in slide-in-from-bottom-6 duration-400">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mx-auto flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black mb-2 text-slate-900">Tabriklaymiz! 🎉</h2>
              <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed">
                Siz <strong className="text-slate-900">{course.title}</strong> kursini muvaffaqiyatli yakunladingiz!
              </p>
              <div className="flex flex-col gap-3">
                <Button className="w-full h-11 font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm shadow-amber-200 text-sm"
                  onClick={() => router.push(`/student/certificates/${celebrationData.certificateId}`)}>
                  Sertifikatni Ko'rish
                </Button>
                <Button variant="outline" className="w-full h-11 font-bold rounded-xl text-sm"
                  onClick={() => router.push('/student')}>
                  O'quv xonasi
                </Button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
