"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, ArrowLeft, Loader2, HelpCircle,
  ChevronRight, ChevronLeft, PlayCircle, Trophy, Menu, Lock, Code2, Clock, X
} from "lucide-react";
import confetti from "canvas-confetti";

interface Question { id: string; text: string; options: string[]; correctIdx?: number; }
interface Quiz { id: string; title: string; orderIdx: number; questions: Question[]; isCompleted: boolean; isLocked: boolean; }
interface Course { id: string; title: string; modules: any[]; }

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ certificateId?: string } | null>(null);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/student/courses/${courseId}/curriculum`);
        const currData = await res.json();
        setCourse(currData);
        let foundQuiz = null;
        for (const mod of currData.modules) {
          const q = mod.quizzes?.find((q: any) => q.id === quizId);
          if (q) { foundQuiz = q; break; }
        }
        setQuiz(foundQuiz);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [courseId, quizId]);

  // Redirect if quiz is locked
  useEffect(() => {
    if (!quiz || !course) return;
    if (quiz.isLocked) {
      // Find first unlocked incomplete lesson
      const allLessons = course.modules
        .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
        .flatMap((m: any) => m.lessons.sort((a: any, b: any) => a.orderIdx - b.orderIdx));
      const firstUnlocked = allLessons.find((l: any) => !l.isLocked && !l.isCompleted)
        || allLessons.find((l: any) => !l.isLocked);
      if (firstUnlocked) {
        router.replace(`/student/courses/${courseId}/lessons/${firstUnlocked.id}`);
      } else {
        router.replace(`/student/courses/${courseId}`);
      }
    }
  }, [quiz, course]);

  const showLockedToast = (msg: string) => {
    setLockedToast(msg);
    setTimeout(() => setLockedToast(null), 2500);
  };

  // Build allItems same as lesson page
  const allItems = useMemo(() => {
    if (!course) return [];
    return course.modules
      .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
      .flatMap((m: any) => {
        const lessons = m.lessons
          .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
          .map((l: any) => ({ type: 'lesson' as const, id: l.id, data: l }));
        const quizzes = (m.quizzes || [])
          .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
          .map((q: any) => ({ type: 'quiz' as const, id: q.id, data: q }));
        const assignmentItems = m.assignment
          ? [{ type: 'assignment' as const, id: m.assignment.id, data: m.assignment }]
          : [];
        return [...lessons, ...quizzes, ...assignmentItems];
      });
  }, [course]);

  const currentItemIndex = allItems.findIndex(i => i.type === 'quiz' && i.id === quizId);
  const prevItem = allItems[currentItemIndex - 1];
  const nextItem = allItems[currentItemIndex + 1];

  const handleSelectOption = (optIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIdx < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else { finishQuiz(); }
  };

  const finishQuiz = async () => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.questions.forEach((q: any, idx) => {
      if (answers[idx] === q.correctIdx) correctCount++;
    });
    setScore(correctCount);

    try {
      const response = await fetch(`/api/student/courses/${courseId}/quizzes/${quizId}/complete`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: correctCount })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh curriculum so nextItem (assignment) becomes unlocked
        const res = await fetch(`/api/student/courses/${courseId}/curriculum`);
        if (res.ok) {
          const currData = await res.json();
          setCourse(currData);
        }
        setIsFinished(true);
      } else {
        alert(data.error || "Testni yakunlashda xatolik yuz berdi");
      }
    } catch (err) { 
      console.error(err);
      alert("Tarmoq xatosi yoki serverda muammo");
    }
  };

  const navigateNext = () => {
    if (!nextItem) {
      router.push(`/student/courses/${courseId}`);
      return;
    }
    if (nextItem.type === 'quiz') {
      router.push(`/student/courses/${courseId}/quizzes/${nextItem.id}`);
    } else if (nextItem.type === 'assignment') {
      router.push(`/student/courses/${courseId}/assignments/${nextItem.id}`);
    } else {
      router.push(`/student/courses/${courseId}/lessons/${nextItem.id}`);
    }
  };

  // ── Sidebar ──────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    if (!course) return null;
    return (
      <div className={`flex flex-col h-full bg-white ${mobile ? '' : 'border-r border-slate-100'}`}>
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
        <div className="flex-1 overflow-y-auto py-3">
          {course.modules?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((mod: any) => (
            <div key={mod.id} className="mb-4">
              <div className="px-4 py-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mod.orderIdx}-Modul</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{mod.title}</p>
              </div>
              <div>
                {mod.lessons?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((lesson: any) => {
                  const isLocked = lesson.isLocked;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (isLocked) {
                          showLockedToast("Avval oldingi darsni tugatish kerak");
                          return;
                        }
                        setSidebarOpen(false);
                        router.push(`/student/courses/${courseId}/lessons/${lesson.id}`);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${
                        isLocked
                          ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                          : 'border-l-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                      }`}>
                      <div className="shrink-0">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-slate-400" />
                        ) : lesson.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                      <span className="text-xs font-semibold leading-snug">{lesson.title}</span>
                    </button>
                  );
                })}
                {mod.quizzes?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((q: any) => {
                  const isActive = q.id === quizId;
                  const isLocked = q.isLocked;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (isLocked) {
                          showLockedToast("Avval barcha darslarni tugatish kerak");
                          return;
                        }
                        setSidebarOpen(false);
                        router.push(`/student/courses/${courseId}/quizzes/${q.id}`);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${
                        isLocked
                          ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                          : isActive
                            ? 'bg-violet-50 border-l-violet-600 text-violet-700'
                            : 'border-l-transparent text-violet-600 hover:bg-violet-50 cursor-pointer'
                      }`}>
                      {isLocked ? (
                        <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                      ) : q.isCompleted ? (
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-600' : 'text-emerald-500'}`} />
                      ) : (
                        <HelpCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold ${isLocked ? 'text-slate-400' : ''}`}>
                        Test: {q.title}
                      </span>
                    </button>
                  );
                })}
                {mod.assignment && (
                  <button
                    onClick={() => {
                      if (mod.assignment.isLocked) {
                        showLockedToast("Avval testni tugatish kerak");
                        return;
                      }
                      setSidebarOpen(false);
                      router.push(`/student/courses/${courseId}/assignments/${mod.assignment.id}`);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-2 transition-all text-left ${
                      mod.assignment.isLocked
                        ? 'border-l-transparent text-slate-400 cursor-not-allowed opacity-60'
                        : 'border-l-transparent text-amber-600 hover:bg-amber-50 cursor-pointer'
                    }`}>
                    {mod.assignment.isLocked ? (
                      <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                    ) : mod.assignment.status === 'graded' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : mod.assignment.status === 'submitted' ? (
                      <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                    ) : (
                      <Code2 className="w-4 h-4 shrink-0" />
                    )}
                    <span className={`text-xs font-semibold ${mod.assignment.isLocked ? 'text-slate-400' : ''}`}>
                      Topshiriq: {mod.assignment.title}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  );
  if (!quiz || !course) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="text-slate-500 font-medium">Test topilmadi.</p>
      <Button onClick={() => router.push(`/student/courses/${courseId}`)} className="rounded-xl h-10 px-5 font-bold text-sm">
        Kursga qaytish
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 xl:w-80 flex-col shrink-0 h-full overflow-hidden">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 lg:hidden shadow-2xl animate-in slide-in-from-right-2 duration-200">
            <Sidebar mobile />
          </div>
        </>
      )}

      {/* Locked Toast */}
      {lockedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-200">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {lockedToast}
        </div>
      )}

      {/* Main */}
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
              <p className="text-sm font-black text-slate-900 truncate leading-tight mt-0.5">Test: {quiz.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Prev/Next nav */}
            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg gap-1 font-bold text-xs hidden sm:flex"
              disabled={!prevItem}
              onClick={() => prevItem && router.push(
                prevItem.type === 'quiz'
                  ? `/student/courses/${courseId}/quizzes/${prevItem.id}`
                  : prevItem.type === 'assignment'
                    ? `/student/courses/${courseId}/assignments/${prevItem.id}`
                    : `/student/courses/${courseId}/lessons/${prevItem.id}`
              )}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg gap-1 font-bold text-xs hidden sm:flex"
              disabled={!nextItem || !!nextItem?.data?.isLocked}
              onClick={() => {
                if (!nextItem || nextItem.data?.isLocked) return;
                router.push(
                  nextItem.type === 'quiz'
                    ? `/student/courses/${courseId}/quizzes/${nextItem.id}`
                    : nextItem.type === 'assignment'
                      ? `/student/courses/${courseId}/assignments/${nextItem.id}`
                      : `/student/courses/${courseId}/lessons/${nextItem.id}`
                );
              }}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
          {!isFinished ? (
            /* ── Quiz taking ── */
            <div className="max-w-xl w-full bg-white border border-slate-100 rounded-2xl shadow-sm p-7 md:p-10">
              <div className="mb-8 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-full inline-block mb-4">
                  SAVOL {currentQuestionIdx + 1} / {quiz.questions.length}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {quiz.questions[currentQuestionIdx].text}
                </h2>
              </div>

              <div className="space-y-3 mb-8">
                {quiz.questions[currentQuestionIdx].options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-semibold text-sm ${
                      answers[currentQuestionIdx] === idx
                        ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
                    }`}>
                    <span className="font-black mr-2">{String.fromCharCode(65 + idx)})</span> {opt}
                  </button>
                ))}
              </div>

              <Button className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-black border-0 shadow-sm shadow-violet-200 gap-2"
                disabled={answers[currentQuestionIdx] === undefined}
                onClick={handleNext}>
                {currentQuestionIdx === quiz.questions.length - 1 ? "Natijani ko'rish" : "Keyingi savol"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* ── Result ── */
            <div className="max-w-sm w-full bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
              <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Tabriklaymiz!</h2>
              <p className="text-slate-500 mb-6 font-medium text-sm">Siz testni muvaffaqiyatli yakunladingiz.</p>

              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Natijangiz</p>
                <p className="text-4xl font-black text-violet-600">{score} / {quiz.questions.length}</p>
              </div>

              <div className="flex flex-col gap-3">
                {nextItem && !nextItem.data?.isLocked ? (
                  <Button className="w-full h-11 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2"
                    onClick={navigateNext}>
                    {nextItem.type === 'quiz' ? 'Keyingi test' : nextItem.type === 'assignment' ? "Topshiriqqa o'tish" : 'Keyingi dars'}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button className="w-full h-11 rounded-xl font-black text-sm bg-slate-700 hover:bg-slate-800 text-white border-0"
                    onClick={() => router.push(`/student/courses/${courseId}`)}>
                    Kursga qaytish
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal — triggered from assignment page, not quiz */}
    </div>
  );
}
