"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronRight, ChevronLeft, PlayCircle, CheckCircle2,
  FileText, ArrowLeft, Loader2, HelpCircle, GraduationCap,
  BookOpen, Menu, Lock, Download, FileDown, Code2, Clock, X, ChevronDown,
  MessageCircle,
  Sparkles, BrainCircuit, Expand, Hand
} from "lucide-react";
import confetti from "canvas-confetti";
import { AnimatePresence } from "framer-motion";
import { ASLPlayer } from "@/components/student/ASLPlayer";
import { SignAvatar } from "@/components/student/SignAvatar";
import type { TimedSign } from "@/lib/asl-service";

interface Lesson {
  id: string; title: string; videoUrl: string | null;
  content: string | null; attachmentUrl?: string | null;
  orderIdx: number; isCompleted: boolean; isLocked: boolean;
}
interface Module {
  id: string; title: string; orderIdx: number;
  lessons: Lesson[]; quizzes?: any[]; assignment?: any;
}
interface Course { id: string; title: string; modules: Module[]; }

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ certificateId: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  // --- ASL State ---
  const [isASLMode, setIsASLMode] = useState(false);
  const [aslSigns, setAslSigns] = useState<TimedSign[]>([]);
  const [isLoadingASL, setIsLoadingASL] = useState(false);
  const [aslError, setAslError] = useState<string | null>(null);
  const [aslServiceDown, setAslServiceDown] = useState(false);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const [videoTime, setVideoTime] = useState(0);

  const playerContainerRef = React.useRef<HTMLDivElement>(null);
  const ytPlayerRef = React.useRef<any>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchCurriculum = async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}/curriculum`);
      if (res.ok) setCourse(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCurriculum(); }, [courseId]);

  // Redirect if current lesson is locked
  useEffect(() => {
    if (!course) return;
    const allLessons = course.modules
      .sort((a, b) => a.orderIdx - b.orderIdx)
      .flatMap(m => m.lessons.sort((a, b) => a.orderIdx - b.orderIdx));
    const lesson = allLessons.find(l => l.id === lessonId);
    if (lesson?.isLocked) {
      // Find the first unlocked incomplete lesson
      const firstUnlocked = allLessons.find(l => !l.isLocked && !l.isCompleted)
        || allLessons.find(l => !l.isLocked);
      if (firstUnlocked) {
        router.replace(`/student/courses/${courseId}/lessons/${firstUnlocked.id}`);
      } else {
        router.replace(`/student/courses/${courseId}`);
      }
    }
  }, [course, lessonId]);

  // Show locked toast and auto-hide
  const showLockedToast = (msg: string) => {
    setLockedToast(msg);
    setTimeout(() => setLockedToast(null), 2500);
  };

  // Flatten ALL items (lessons + quizzes + assignments) per module in order
  const allItems = useMemo(() => {
    if (!course) return [];
    return course.modules
      .sort((a, b) => a.orderIdx - b.orderIdx)
      .flatMap(m => {
        const lessons = m.lessons
          .sort((a, b) => a.orderIdx - b.orderIdx)
          .map(l => ({ type: 'lesson' as const, id: l.id, data: l }));
        const quizzes = (m.quizzes || [])
          .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
          .map((q: any) => ({ type: 'quiz' as const, id: q.id, data: q }));
        const assignmentItems = m.assignment
          ? [{ type: 'assignment' as const, id: m.assignment.id, data: m.assignment }]
          : [];
        return [...lessons, ...quizzes, ...assignmentItems];
      });
  }, [course]);

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules
      .sort((a, b) => a.orderIdx - b.orderIdx)
      .flatMap(m => m.lessons.sort((a, b) => a.orderIdx - b.orderIdx));
  }, [course]);

  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
  const currentLesson = allLessons[currentLessonIndex];

  // ── Video helper ──────────────────────────────────────────────
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) return url.replace("watch?v=", "embed/") + "?rel=0&modestbranding=1&autoplay=0";
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "www.youtube.com/embed/") + "?rel=0&modestbranding=1";
    return null;
  };

  const isYoutube = currentLesson?.videoUrl && (currentLesson.videoUrl.includes("youtube.com") || currentLesson.videoUrl.includes("youtu.be"));
  const embedUrl = currentLesson?.videoUrl ? getEmbedUrl(currentLesson.videoUrl) : null;

  // For prev/next navigation — use allItems
  const currentItemIndex = allItems.findIndex(i => i.type === 'lesson' && i.id === lessonId);
  const prevItem = allItems[currentItemIndex - 1];
  const nextItem = allItems[currentItemIndex + 1];

  const handleComplete = async () => {
    if (isCompleting || !currentLesson) return;
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/student/courses/${courseId}/lessons/${lessonId}/complete`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const savedNextItem = nextItem;
        // First handle completion celebration
        if (data.courseCompleted) {
          const end = Date.now() + 2500;
          const frame = () => {
             confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
             confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
             if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
          setCelebrationData({ certificateId: data.certificateId });
        } else if (savedNextItem) {
          // Navigate to next item if not course completed
          if (savedNextItem.type === 'quiz') {
            router.push(`/student/courses/${courseId}/quizzes/${savedNextItem.id}`);
          } else if (savedNextItem.type === 'assignment') {
            router.push(`/student/courses/${courseId}/assignments/${savedNextItem.id}`);
          } else {
            router.push(`/student/courses/${courseId}/lessons/${savedNextItem.id}`);
          }
        } else {
           // If no next item, just refresh data
           await fetchCurriculum();
        }
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (err) { 
      console.error(err);
      alert("Tarmoq xatosi yoki serverda muammo");
    } finally { 
      setIsCompleting(false); 
    }
  };

  // ── ASL Logic ──
  const handleToggleASLMode = async () => {
    if (!currentLesson) return;

    const newMode = !isASLMode;
    setIsASLMode(newMode);
    setAslError(null);

    // Only fetch if turning ON and we don't have signs yet
    if (newMode && aslSigns.length === 0) {
      setIsLoadingASL(true);
      try {
        const res = await fetch("/api/asl/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: currentLesson.videoUrl ?? null,
            lessonText: currentLesson.content ?? null,
            lessonTitle: currentLesson.title,
          }),
        });
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        setAslServiceDown(data.serviceDown ?? false);
        setAslSigns(data.signs ?? []);
      } catch (err) {
        console.error("[ASL]", err);
        setAslError("ASL yuklanmadi. Qaytadan urinib ko'ring.");
        setIsASLMode(false);
      } finally {
        setIsLoadingASL(false);
      }
    }
  };

  const togglePlayerFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        alert("Fullscreen xatosi: " + err.message);
      });
      setIsPlayerFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsPlayerFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsPlayerFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // YouTube IFrame API Initialization (Robust Polling)
  useEffect(() => {
    if (!isYoutube || !embedUrl) return;

    const initYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        if (!ytPlayerRef.current) {
          try {
            ytPlayerRef.current = new (window as any).YT.Player('youtube-player');
          } catch(e) {
            console.error("YT Player init error:", e);
          }
        }
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initYT;
    } else {
      setTimeout(initYT, 500); 
    }

    const pollTimer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const time = ytPlayerRef.current.getCurrentTime();
          if (typeof time === 'number') setVideoTime(time);
        } catch (e) {}
      } else if (!ytPlayerRef.current && (window as any).YT) {
        initYT();
      }
    }, 250);

    return () => clearInterval(pollTimer);
  }, [isYoutube, embedUrl]);

  // (ASLPlayer handles its own active sign computation internally)

  // Active gloss for SignAvatar — current sign at videoTime
  const activeGloss = useMemo(() => {
    if (!isASLMode || !aslSigns.length) return undefined;
    const sign = aslSigns.find((s) => videoTime >= s.start && videoTime < s.end);
    if (sign) return sign.gloss;
    const passed = aslSigns.filter((s) => s.end <= videoTime);
    return passed.length > 0 ? passed[passed.length - 1].gloss : aslSigns[0]?.gloss;
  }, [isASLMode, aslSigns, videoTime]);

  // ── Sidebar ──────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    if (!course) return null;

    // Find which module contains the current lesson
    const activeModuleId = course.modules.find((m) =>
      m.lessons.some((l: any) => l.id === lessonId) ||
      m.quizzes?.some((q: any) => q.id === lessonId) ||
      m.assignment?.id === lessonId
    )?.id;

    const [openModuleId, setOpenModuleId] = React.useState<string | null>(activeModuleId ?? null);

    return (
      <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-slate-100'}`}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{course.title}</h2>
          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Curriculum — accordion */}
        <div className="flex-1 overflow-y-auto py-2">
          {course.modules?.sort((a, b) => a.orderIdx - b.orderIdx).map((mod) => {
            const isOpen = openModuleId === mod.id;
            const hasActive = mod.lessons.some((l: any) => l.id === lessonId) ||
              mod.quizzes?.some((q: any) => q.id === lessonId) ||
              mod.assignment?.id === lessonId;

            return (
              <div key={mod.id} className="border-b border-slate-100 last:border-0">
                {/* Module header — clickable to toggle */}
                <button
                  onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    hasActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {mod.orderIdx}-Modul
                    </p>
                    <p className={`text-xs font-bold mt-0.5 ${hasActive ? 'text-blue-700' : 'text-slate-700'}`}>
                      {mod.title}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Module items */}
                {isOpen && (
                  <div className="pb-1">
                    {mod.lessons?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((lesson: any) => {
                      const isActive = lesson.id === lessonId;
                      const isLocked = lesson.isLocked;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            if (isLocked) { showLockedToast("Avval oldingi darsni tugatish kerak"); return; }
                            setSidebarOpen(false);
                            router.push(`/student/courses/${courseId}/lessons/${lesson.id}`);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all border-l-2 text-left ${
                            isLocked
                              ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                              : isActive
                                ? 'bg-blue-50 border-l-blue-600 text-blue-700'
                                : 'border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                          }`}>
                          <div className="shrink-0">
                            {isLocked ? <Lock className="w-4 h-4 text-slate-400" />
                              : lesson.isCompleted ? <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-emerald-500'}`} />
                              : <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-blue-500' : 'border-slate-300'}`} />}
                          </div>
                          <span className="text-xs font-semibold leading-snug">{lesson.title}</span>
                        </button>
                      );
                    })}
                    {mod.quizzes?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((quiz: any) => {
                      const isLocked = quiz.isLocked;
                      return (
                        <button
                          key={quiz.id}
                          onClick={() => {
                            if (isLocked) { showLockedToast("Avval barcha darslarni tugatish kerak"); return; }
                            setSidebarOpen(false);
                            router.push(`/student/courses/${courseId}/quizzes/${quiz.id}`);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${
                            isLocked
                              ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                              : 'border-l-transparent text-violet-600 hover:bg-violet-50 cursor-pointer'
                          }`}>
                          {isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                            : quiz.isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                            : <HelpCircle className="w-4 h-4 shrink-0" />}
                          <span className={`text-xs font-semibold ${isLocked ? 'text-slate-400' : ''}`}>
                            Test: {quiz.title}
                          </span>
                        </button>
                      );
                    })}
                    {mod.assignment && (
                      <button
                        onClick={() => {
                          if (mod.assignment.isLocked) { showLockedToast("Avval testni tugatish kerak"); return; }
                          setSidebarOpen(false);
                          router.push(`/student/courses/${courseId}/assignments/${mod.assignment.id}`);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${
                          mod.assignment.isLocked
                            ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                            : 'border-l-transparent text-amber-600 hover:bg-amber-50 cursor-pointer'
                        }`}>
                        {mod.assignment.isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                          : mod.assignment.status === 'graded' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                          : mod.assignment.status === 'submitted' ? <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                          : <Code2 className="w-4 h-4 shrink-0" />}
                        <span className={`text-xs font-semibold ${mod.assignment.isLocked ? 'text-slate-400' : ''}`}>
                          Topshiriq: {mod.assignment.title}
                        </span>
                      </button>
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

  // ── Loading / Error ───────────────────────────────────────────
  if (isLoading) return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-pulse">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col shrink-0 h-full bg-white border-r border-slate-100">
        <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
          <div className="h-4 w-40 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 px-2 py-2.5">
              <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0" />
              <div className="h-3 bg-slate-200 rounded-lg flex-1" style={{ width: `${55 + i * 8}%` }} />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-slate-200 rounded" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-slate-200 rounded" />
              <div className="h-3.5 w-40 bg-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="h-7 w-24 bg-slate-200 rounded-xl" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5 max-w-3xl mx-auto w-full">
          {/* Video skeleton */}
          <div className="w-full aspect-video bg-slate-200 rounded-2xl" />
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-4 w-24 bg-slate-100 rounded-lg" />
          </div>
          {/* Content lines */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-slate-100 rounded-lg" style={{ width: `${70 + i * 5}%` }} />
            ))}
          </div>
          {/* Message */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-4 h-4 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin shrink-0" />
            <p className="text-sm font-semibold text-blue-600">Dars yuklanmoqda...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!course || !currentLesson) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center gap-5">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
        <HelpCircle className="w-7 h-7" />
      </div>
      <p className="text-lg font-black text-slate-900">Dars topilmadi yoki ruxsat yo'q.</p>
      <Button onClick={() => router.push("/student")} className="h-10 px-6 rounded-xl font-black text-xs uppercase">
        Mening darslarimga qaytish
      </Button>
    </div>
  );

  // Next item locked check (for bottom nav)
  const nextItemLocked = nextItem?.data?.isLocked;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col shrink-0 h-full overflow-hidden">
        <Sidebar />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 lg:hidden shadow-2xl animate-in slide-in-from-right-2 duration-200">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* ── Locked Toast ── */}
      {lockedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-200">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {lockedToast}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push("/student")}
              className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{course.title}</p>
              <p className="text-sm font-black text-slate-900 truncate leading-tight mt-0.5">{currentLesson.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {currentLesson.isCompleted && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> O'zlashtirildi
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleToggleASLMode}
              disabled={isLoadingASL}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border transition-all text-xs ${
                isASLMode 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {isLoadingASL ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Hand className="w-3.5 h-3.5" />
              )}
              {isASLMode ? "ASL Aktiv" : "ASL"}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Video Player + Overlays ── */}
          <div ref={playerContainerRef} className={`relative bg-slate-100 w-full group ${isPlayerFullscreen ? 'h-screen flex items-center justify-center' : ''}`}>
            {currentLesson.videoUrl ? (
              isYoutube && embedUrl ? (
                <div className={`w-full ${isPlayerFullscreen ? 'h-full' : 'aspect-video max-h-[60vh]'}`}>
                  <iframe id="youtube-player" className="w-full h-full" src={embedUrl + "&enablejsapi=1"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              ) : (
                <div className={`w-full ${isPlayerFullscreen ? 'h-full' : 'aspect-video max-h-[60vh]'}`}>
                  <video src={currentLesson.videoUrl} controls className="w-full h-full bg-black" 
                    onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)} />
                </div>
              )
            ) : (
              <div className="aspect-video w-full max-h-[60vh] flex items-center justify-center">
                <div className="text-center text-slate-400 space-y-3">
                  <PlayCircle className="w-16 h-16 mx-auto opacity-20" />
                  <p className="text-sm font-medium">Video mavjud emas</p>
                </div>
              </div>
            )}

            {/* Custom Fullscreen Toggle for Accessibility Hub */}
            <button 
              onClick={togglePlayerFullscreen}
              className="absolute top-4 right-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Expand className="w-5 h-5" />
            </button>

            {/* ASL Avatar overlay — full body, synced with video */}
            <SignAvatar
              currentGloss={activeGloss}
              isVisible={isASLMode}
              isLoading={isLoadingASL}
              isActive={isASLMode && !isLoadingASL}
              videoTime={videoTime}
            />

            {/* ASL error toast */}
            {aslError && (
              <div className="absolute top-4 left-4 z-50 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg">
                {aslError}
              </div>
            )}
          </div>

          {/* ── Lesson Info + Content ── */}
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">

            {/* Lesson title + nav */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{currentLesson.title}</h1>
                <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Dars {currentLessonIndex + 1} / {allLessons.length}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100" />

            {/* Theory content */}
            {currentLesson.content && currentLesson.content.replace(/<[^>]*>/g, "").trim() ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="font-black text-slate-900 text-base">Dars matni</h2>
                </div>
                <div className="rich-content text-sm md:text-base text-slate-700"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-300" />
                </div>
                <p className="font-bold text-slate-500 text-sm">Ushbu dars uchun qo'shimcha matn mavjud emas.</p>
                <p className="text-slate-400 text-xs mt-1">Barcha ma'lumotlar video orqali tushuntirilgan.</p>
              </div>
            )}

            {/* Attachment download */}
            {currentLesson.attachmentUrl && (
              <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100">
                    <FileDown className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="font-black text-slate-900 text-base">Qo'shimcha material</h2>
                </div>
                <a
                  href={currentLesson.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-violet-200 shrink-0">
                    {currentLesson.attachmentUrl.endsWith(".pdf") ? (
                      <span className="text-[10px] font-black text-red-600">PDF</span>
                    ) : (
                      <span className="text-[10px] font-black text-blue-600">DOCX</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-violet-700 truncate flex-1 group-hover:text-violet-900">
                    {currentLesson.attachmentUrl.split("/").pop()}
                  </span>
                  <Download className="w-4 h-4 text-violet-500 shrink-0" />
                </a>
              </div>
            )}

            {/* Bottom nav */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm"
                disabled={!prevItem}
                onClick={() => prevItem && router.push(
                  prevItem.type === 'quiz'
                    ? `/student/courses/${courseId}/quizzes/${prevItem.id}`
                    : prevItem.type === 'assignment'
                      ? `/student/courses/${courseId}/assignments/${prevItem.id}`
                      : `/student/courses/${courseId}/lessons/${prevItem.id}`
                )}>
                <ChevronLeft className="w-4 h-4" /> Oldingi
              </Button>
              {!currentLesson.isCompleted ? (
                <Button onClick={handleComplete} disabled={isCompleting}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 border-0 text-sm">
                  {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Tugatish
                </Button>
              ) : (
                <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm"
                  disabled={!nextItem || !!nextItemLocked}
                  onClick={() => {
                    if (!nextItem || nextItemLocked) return;
                    router.push(
                      nextItem.type === 'quiz'
                        ? `/student/courses/${courseId}/quizzes/${nextItem.id}`
                        : nextItem.type === 'assignment'
                          ? `/student/courses/${courseId}/assignments/${nextItem.id}`
                          : `/student/courses/${courseId}/lessons/${nextItem.id}`
                    );
                  }}>
                  {nextItem?.type === 'quiz' ? "Testga o'tish" : nextItem?.type === 'assignment' ? "Topshiriqqa o'tish" : 'Keyingi dars'} <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Comments link */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl gap-2 font-bold text-sm text-blue-600 border-blue-100 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => router.push(`/student/courses/${courseId}/comments`)}
              >
                <MessageCircle className="w-4 h-4" /> Kurs muhokamasi
              </Button>
            </div>
          </div>
        </div>
      </div>

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
