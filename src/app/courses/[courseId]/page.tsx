"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, PlayCircle, Lock, ChevronRight, FileText, ExternalLink, ArrowLeft, HelpCircle, ClipboardList } from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((res) => res.json())
      .then((data) => setCourse(data));

    fetch("/api/student/profile")
      .then((res) => { if (res.ok) return res.json(); return null; })
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, [courseId]);

  const backHref = session ? "/student/catalog" : "/courses";
  const backLabel = session ? "Barcha kurslarga" : "Kurslarga qaytish";

  async function handleEnroll() {
    setIsEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push(`/login?error=enroll&redirect=/courses/${courseId}`);
          return;
        }
        throw new Error(data.error || "Xatolik ro'y berdi");
      }
      setShowSuccess(true);
      setTimeout(() => router.push(`/student/courses/${courseId}`), 2000);
    } catch (err: any) {
      setError(err.message);
      setIsEnrolling(false);
    }
  }

  if (!course) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const technologies: string[] = Array.isArray(course.technologies) ? course.technologies : [];

  const levelLabel = course.level === "BEGINNER" ? "Boshlang'ich" : course.level === "INTERMEDIATE" ? "O'rta" : "Ilg'or";
  const levelColor = course.level === "BEGINNER" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : course.level === "INTERMEDIATE" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-red-50 text-red-700 ring-red-200";

  return (
    <div className="min-h-screen bg-white">

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-emerald-200 px-6 py-4 rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-900 font-black text-sm">Tabriklaymiz!</p>
              <p className="text-slate-500 text-xs font-medium">Kursga muvaffaqiyatli yozildingiz!</p>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8 max-w-6xl px-4 md:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <a href={backHref} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {backLabel}
          </a>
          <span className="text-slate-200">/</span>
          <span className="text-slate-500 font-medium truncate">{course.title}</span>
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-12 gap-10">

          {/* LEFT */}
          <div className="md:col-span-7 space-y-8">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${levelColor}`}>
                {levelLabel}
              </span>
              <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 ring-1 ring-inset ring-blue-200">
                {course.category?.name}
              </span>
            </div>

            {/* Title + Desc */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight text-slate-900">
                {course.title}
              </h1>
              <p className="text-base text-slate-500 font-medium leading-relaxed">{course.description}</p>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm group">
              {course.image ? (
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-4xl">
                  LearnEdu
                </div>
              )}
              {course.xpPoints > 0 && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  +{course.xpPoints} XP Ballar
                </div>
              )}
              {course.introVideo && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <a href={course.introVideo} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="rounded-xl gap-2 font-bold shadow-lg bg-white/90 hover:bg-white text-slate-800 h-10 px-4 text-sm">
                      <PlayCircle className="w-4 h-4 text-blue-600" />
                      Bepul tanishuv videoni ko'rish
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Technologies */}
            {technologies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">O'rganiladigan texnologiyalar</h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Course Outline */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Kurs Tarkibi</h2>
              <div className="space-y-3">
                {course.modules?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((mod: any) => (
                  <div key={mod.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 font-bold flex items-center justify-between text-slate-800 border-b border-slate-100">
                      <span>{mod.orderIdx}-Modul. {mod.title}</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {[
                          mod.lessons?.length > 0 && `${mod.lessons.length} ta dars`,
                          mod.quizzes?.length > 0 && `${mod.quizzes.length} ta test`,
                          mod.assignment && `1 ta topshiriq`
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {mod.lessons.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((lesson: any) => (
                        <div key={lesson.id} className="px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                          <PlayCircle className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>{lesson.title}</span>
                          <Lock className="w-3 h-3 ml-auto text-slate-300 shrink-0" />
                        </div>
                      ))}
                      {mod.quizzes?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((quiz: any) => (
                        <div key={quiz.id} className="px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                          <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>{quiz.title} (Test)</span>
                          <Lock className="w-3 h-3 ml-auto text-slate-300 shrink-0" />
                        </div>
                      ))}
                      {mod.assignment && (
                        <div key={mod.assignment.id} className="px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                          <ClipboardList className="w-4 h-4 text-slate-300 shrink-0" />
                          <span>{mod.assignment.title} (Topshiriq)</span>
                          <Lock className="w-3 h-3 ml-auto text-slate-300 shrink-0" />
                        </div>
                      )}
                      {(mod.lessons.length === 0 && mod.quizzes.length === 0 && !mod.assignment) && (
                        <div className="px-4 py-3 text-sm text-slate-400">Tez kunda...</div>
                      )}
                    </div>
                  </div>
                ))}
                {(!course.modules || course.modules.length === 0) && (
                  <p className="text-slate-400 text-sm">Kurs tarkibi tayyorlanmoqda.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — sticky card */}
          <div className="md:col-span-5">
            <div className="sticky top-20 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-6 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Kurs Narxi</p>
                <div className="text-4xl font-black text-slate-900 tracking-tight">
                  {course.price === 0 ? "Bepul" : `${course.price.toLocaleString()} UZS`}
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-black rounded-xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all text-white gap-2 border-none"
                onClick={handleEnroll}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Kutilmoqda...</>
                ) : (
                  <>Kursni ko'rish <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
                  {error}
                </p>
              )}

              <div className="space-y-3 pt-1">
                {[
                  { icon: CheckCircle, color: "text-emerald-500", text: "Kursni onlayn / oflayn o'zlashtirish imkoni" },
                  { icon: PlayCircle, color: "text-blue-500", text: "Yuqori sifatli video darslar" },
                  { icon: FileText, color: "text-violet-500", text: "Haqiqiy loyihalar ustida ishlash" },
                  { icon: Lock, color: "text-amber-500", text: "Materiallarga cheksiz umrbod ruxsat" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-slate-600">
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold leading-relaxed">
                Barcha darsliklar va materiallarga cheksiz umrbod ruxsat. Kursga yoziling va o'zingizga qulay vaqtda o'rganishni boshlang!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
