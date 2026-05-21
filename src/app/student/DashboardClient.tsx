"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PlayCircle, Trophy, BookOpen, Clock,
  Compass, LayoutDashboard, CheckCircle2,
  Zap, User, GraduationCap, ChevronRight, Clock3, X, Info, Star, MessageCircle, Target
} from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";

interface Certificate { id: string; courseId: string; }
interface Teacher { id: string; name: string; avatar: string | null; }
interface Course { id: string; title: string; description: string; image: string | null; category: { name: string }; teacher: Teacher; }
interface Enrollment { id: string; progress: number; courseId: string; course: Course; student?: { certificates?: Certificate[] }; }

interface Props {
  enrollments: Enrollment[];
  xp: number;
  seasonalXp: number;
  league: string;
  streak: number;
  pointsToNextLeague: number;
  challenges: { id: string; title: string; description: string; rewardXp: number; targetCount: number; currentCount: number; isCompleted: boolean }[];
}

export function DashboardClient({ 
  enrollments, 
  xp, 
  seasonalXp, 
  league, 
  streak, 
  pointsToNextLeague,
  challenges
}: Props) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<"courses" | "completed" | "xp" | "league" | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Enrollment | null>(null);
  const [pendingCertCourse, setPendingCertCourse] = useState<string | null>(null);

  const completedCourses = enrollments.filter((e) => e.progress >= 100).length;

  // Body scroll lock
  useEffect(() => {
    const isOpen = !!pendingCertCourse || !!activeModal || !!selectedCourse;
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [pendingCertCourse, activeModal, selectedCourse]);

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          O'quv xonasi
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Bilim olishda davom eting. O'zlashtirish darajangiz va yutuqlaringizni kuzatib boring.
        </p>
        {streak > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black animate-in fade-in slide-in-from-top-2 duration-500">
            <Zap className="w-4 h-4 fill-orange-500 animate-pulse" />
            <span className="uppercase tracking-widest">{streak} kunlik streak!</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3 mb-10">
        {[
          { key: "courses", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", hover: "hover:border-blue-200", label: "Mening kurslarim", value: enrollments.length },
          { key: "completed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-200", label: "Tugatilganlar", value: completedCourses },
          { key: "league", icon: Trophy, color: "text-indigo-600", bg: "bg-indigo-50", hover: "hover:border-indigo-200", label: "Mening ligam", value: league },
          { key: "xp", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-200", label: "Mening XP", value: xp, suffix: "XP" },
        ].map((stat) => (
          <div key={stat.key} onClick={() => setActiveModal(stat.key as any)}
            className={`bg-white border border-slate-100 shadow-sm rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md ${stat.hover} group`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">
                  {stat.value} {"suffix" in stat && stat.suffix && <span className={`text-xs ${stat.color}`}>{stat.suffix}</span>}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo */}
      <div className="mb-10 flex flex-col md:flex-row gap-6 justify-between items-center bg-gradient-to-r from-blue-600 to-violet-600 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 w-full md:w-2/3">
          <h2 className="text-xl font-black text-white">Yangi bilimlarga chanqoqmisiz?</h2>
          <p className="text-blue-100 mt-1 text-sm font-medium">O'z sohangizdagi eng yangi kurslarni kashf eting.</p>
        </div>
        <Link href="/student/catalog" className="relative z-10 w-full md:w-auto">
          <Button size="lg" className="w-full md:w-auto h-11 px-6 bg-white text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] gap-2 rounded-xl border-0 shadow-lg">
            <Compass className="w-4 h-4" /> Katalogni ko'rish
          </Button>
        </Link>
      </div>

      {/* Weekly Challenges */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
            <Target className="w-5 h-5 text-indigo-500" /> Haftalik topshiriqlar
          </h2>
          <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            {challenges.filter(c => c.isCompleted).length} / {challenges.length} Yakunlandi
          </div>
        </div>
        <HorizontalScrollRow>
          {challenges.map((challenge) => (
            <div key={challenge.id} className={`min-w-[280px] sm:min-w-[300px] p-5 rounded-2xl border transition-all snap-center ${challenge.isCompleted ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100 shadow-sm"}`}>
               <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-xl ${challenge.isCompleted ? "bg-emerald-100" : "bg-slate-100"}`}>
                     {challenge.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Star className="w-4 h-4 text-slate-400" />}
                  </div>
                  <span className="text-[10px] font-black text-amber-600">+{challenge.rewardXp} XP</span>
               </div>
               <h4 className="font-bold text-slate-900 text-sm mb-1">{challenge.title}</h4>
               <p className="text-xs text-slate-400 mb-4 line-clamp-1">{challenge.description}</p>
               <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400">
                     <span>Jarayon</span>
                     <span>{challenge.currentCount} / {challenge.targetCount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div className={`h-full transition-all duration-700 ${challenge.isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${Math.min(100, (challenge.currentCount / challenge.targetCount) * 100)}%` }} />
                  </div>
               </div>
            </div>
          ))}
        </HorizontalScrollRow>
      </section>

      {/* Active Courses */}
      {enrollments.filter((e) => e.progress < 100).length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
              <Clock className="w-5 h-5 text-primary" /> Davom etayotgan darslar
            </h2>
          </div>
          <HorizontalScrollRow>
            {enrollments.filter((e) => e.progress < 100).map((e) => (
              <div key={e.id} className="min-w-[280px] sm:min-w-[320px] group bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:border-blue-200 hover:shadow-md transition-all snap-center">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-5">
                    <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">O'rganilmoqda</div>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all w-8 h-8" onClick={(ev) => { ev.stopPropagation(); router.push(`/student/courses/${e.courseId}/comments`); }}>
                         <MessageCircle className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-all w-8 h-8" onClick={() => setSelectedCourse(e)}>
                         <Info className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-black mb-1.5 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{e.course.title}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-5 font-medium text-xs">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center shrink-0">
                      {e.course.teacher.avatar ? <img src={e.course.teacher.avatar} alt={e.course.teacher.name} className="w-full h-full object-cover" /> : <User className="w-3 h-3" />}
                    </div>
                    <Link href={`/teachers/${e.course.teacher.id}?from=/student`} className="hover:text-blue-600 transition-colors hover:underline">{e.course.teacher.name}</Link>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>O'zlashtirish</span><span className="text-blue-600">{e.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${e.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-3 mt-auto border-t border-slate-100 bg-slate-50/50">
                  <Link href={`/student/courses/${e.courseId}`} className="block">
                    <Button className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-1.5">
                      <PlayCircle className="w-4 h-4 shrink-0" /> Davom etish
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </HorizontalScrollRow>
        </>
      )}

      {/* Empty state */}
      {enrollments.length === 0 && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-2">Hech qanday kursga yozilmagansiz</h3>
          <p className="text-slate-500 mb-6 text-sm">Katalogdan o'zingizga yoqgan kursni topib o'rganishni boshlang.</p>
          <Button asChild className="rounded-xl font-black"><Link href="/student/catalog">Kurslarni kashf etish</Link></Button>
        </div>
      )}

      {/* Completed Courses */}
      {enrollments.filter((e) => e.progress >= 100).length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Tugallangan kurslar
            </h2>
          </div>
          <HorizontalScrollRow>
            {enrollments.filter((e) => e.progress >= 100).map((e) => {
              const cert = e.student?.certificates?.find((c) => c.courseId === e.courseId);
              return (
                <div key={e.id} className="min-w-[280px] sm:min-w-[320px] group bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:border-emerald-200 hover:shadow-md transition-all snap-center">
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-5">
                      <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Tugallangan
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all w-8 h-8" onClick={(ev) => { ev.stopPropagation(); router.push(`/student/courses/${e.courseId}/comments`); }}>
                           <MessageCircle className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all w-8 h-8" onClick={() => setSelectedCourse(e)}>
                           <Info className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black mb-1.5 text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{e.course.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 mb-5 font-medium text-xs">
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center shrink-0">
                        {e.course.teacher.avatar ? <img src={e.course.teacher.avatar} alt={e.course.teacher.name} className="w-full h-full object-cover" /> : <User className="w-3 h-3" />}
                      </div>
                      <Link href={`/teachers/${e.course.teacher.id}?from=/student`} className="hover:text-emerald-600 transition-colors hover:underline">{e.course.teacher.name}</Link>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>O'zlashtirish</span><span className="text-emerald-600">100%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-3 mt-auto border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/student/courses/${e.courseId}`} className="min-w-0">
                        <Button variant="outline" className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-1.5">
                          <PlayCircle className="w-4 h-4 shrink-0" /><span className="truncate">Takrorlash</span>
                        </Button>
                      </Link>
                      <Button onClick={() => cert?.id ? router.push(`/student/certificates/${cert.id}`) : setPendingCertCourse(e.course.title)} className="min-w-0 w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0">
                        <Trophy className="w-4 h-4 shrink-0" /><span className="truncate">Sertifikat</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </HorizontalScrollRow>
        </section>
      )}

      {/* Certificates section */}
      {enrollments.filter((e) => e.progress >= 100).length > 0 && (
        <section className="mt-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Mening sertifikatlarim</h2>
              <p className="text-slate-400 text-xs font-medium">Sizning yutuqlaringiz</p>
            </div>
          </div>
          <HorizontalScrollRow>
            {enrollments.filter((e) => e.progress >= 100).map((e) => {
              const cert = e.student?.certificates?.find((c) => c.courseId === e.courseId);
              return (
                <div key={e.id} className="min-w-[260px] sm:min-w-[300px] bg-white border border-slate-100 shadow-sm rounded-2xl p-6 snap-center hover:border-amber-200 transition-all group">
                  <div className="aspect-[1.4/1] bg-slate-50 rounded-xl flex items-center justify-center p-5 border border-slate-100 mb-5 relative">
                    <GraduationCap className="w-12 h-12 text-slate-200 absolute" />
                    <div className="relative text-center">
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight mb-1">Sertifikat</p>
                      <p className="text-[7px] text-slate-400 uppercase tracking-widest mb-3">Tugatganlik haqida</p>
                      <p className="text-xs font-black text-slate-700 italic border-t border-slate-200 pt-2">O'quvchi</p>
                    </div>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm mb-4 line-clamp-1">{e.course.title}</h3>
                  <Button onClick={() => cert?.id ? router.push(`/student/certificates/${cert.id}`) : setPendingCertCourse(e.course.title)}
                    className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-50 border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
                    Yuklab olish
                  </Button>
                </div>
              );
            })}
          </HorizontalScrollRow>
        </section>
      )}

      {/* Modals */}
      <PremiumModal isOpen={activeModal === "courses"} onClose={() => setActiveModal(null)} title="Mening kurslarim" description="Siz a'zo bo'lgan va o'rganayotgan barcha kurslar." icon={<BookOpen className="w-10 h-10 text-primary" />}>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {enrollments.map((e) => (
            <div key={e.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 text-left">
                <h4 className="font-bold text-sm text-slate-900 truncate">{e.course.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">O'zlashtirish: {e.progress}%</p>
              </div>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-primary rounded-full" style={{ width: `${e.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </PremiumModal>

      <PremiumModal isOpen={activeModal === "completed"} onClose={() => setActiveModal(null)} title="Mening sertifikatlarim" description="Tasdiqlangan va yakunlangan o'quv natijalari." icon={<Trophy className="w-10 h-10 text-yellow-500" />}>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {enrollments.filter((e) => e.progress >= 100).length === 0 ? (
            <p className="text-center py-8 text-slate-400 font-medium text-sm">Hali sertifikatlar yo'q</p>
          ) : enrollments.filter((e) => e.progress >= 100).map((e) => {
            const certId = e.student?.certificates?.find((c) => c.courseId === e.courseId)?.id;
            return (
              <div key={e.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate text-left">{e.course.title}</h4>
                </div>
                {certId ? (
                  <Link href={`/student/certificates/${certId}`}>
                    <Button size="sm" className="ml-2 rounded-lg text-[10px] font-black h-8 shrink-0 bg-amber-500 hover:bg-amber-600 text-white border-0">Ko'rish</Button>
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => { setActiveModal(null); setPendingCertCourse(e.course.title); }} className="ml-2 rounded-lg text-[10px] font-black h-8 shrink-0 bg-slate-200 hover:bg-slate-300 text-slate-600 border-0">Ko'rish</Button>
                )}
              </div>
            );
          })}
        </div>
      </PremiumModal>
      <PremiumModal isOpen={activeModal === "xp"} onClose={() => setActiveModal(null)} title="XP Ochkolari" description="Bilim olishdagi faolligingiz ko'rsatkichi." icon={<Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" />}>
        <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 text-center mb-5">
          <h4 className="text-5xl font-black text-amber-500 mb-1">{xp}</h4>
          <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Jami ochkolar</p>
        </div>
        <div className="mb-5 p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-500" />
            <div className="text-left">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mavsumiy XP</p>
              <h5 className="text-lg font-black text-slate-900">{seasonalXp} XP</h5>
            </div>
          </div>
          <Link href="/student/ranking">
            <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest h-8 border-slate-200">Reytingni ko'rish</Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left">
          <Star className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-900">Darslarni yakunlash</p>
            <p className="text-xs text-slate-400">+10 XP har bir dars uchun</p>
          </div>
        </div>
      </PremiumModal>

      <PremiumModal isOpen={activeModal === "league"} onClose={() => setActiveModal(null)} title="Mening ligam" description="Sizning hozirgi darajangiz va ligalar progressioni." icon={<Trophy className="w-10 h-10 text-indigo-500" />}>
        <div className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100 text-center mb-6">
          <h4 className="text-4xl font-black text-indigo-600 mb-1">{league}</h4>
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Hozirgi liga</p>
        </div>
        {pointsToNextLeague > 0 ? (
          <div className="mb-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Keyingi ligagacha</span>
              <span className="text-indigo-600">{pointsToNextLeague} XP kerak</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.max(5, 100 - (pointsToNextLeague / 10))}%` }} />
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Siz eng yuqori ligadasiz! 💎</p>
          </div>
        )}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {["BRONZA", "KUMUSH", "OLTIN", "PLATINA", "ALMOS"].map((l) => (
            <div key={l} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 ${l === league ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
               <Trophy className={`w-4 h-4 ${l === league ? "text-white" : "text-slate-300"}`} />
               <span className="text-[6px] font-black uppercase">{l}</span>
            </div>
          ))}
        </div>
        <Link href="/student/ranking" className="block w-full">
           <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">Umumiy reytingni ko'rish</Button>
        </Link>
      </PremiumModal>

      <PremiumModal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse?.course.title || ""} description={selectedCourse?.course?.description || ""} icon={<div className="w-full h-full flex items-center justify-center bg-primary text-white rounded-[1.5rem]"><BookOpen className="w-8 h-8" /></div>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ustoz</p>
              <Link href={`/teachers/${selectedCourse?.course.teacher.id}?from=/student`} className="text-sm font-black text-primary hover:underline" onClick={() => setSelectedCourse(null)}>
                {selectedCourse?.course.teacher.name}
              </Link>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
              <p className={`text-sm font-black ${selectedCourse?.progress === 100 ? "text-emerald-600" : "text-primary"}`}>
                {selectedCourse?.progress === 100 ? "Tugatilgan" : "O'rganilmoqda"}
              </p>
            </div>
          </div>
          <Link href={`/student/courses/${selectedCourse?.courseId}`} className="block">
            <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs" onClick={() => setSelectedCourse(null)}>
              Darslarni Takrorlash
            </Button>
          </Link>
        </div>
      </PremiumModal>

      {/* Pending Certificate Modal */}
      {pendingCertCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full text-center">
            <button type="button" onClick={() => setPendingCertCourse(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock3 className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Barakalla! 🎉</h2>
            <p className="text-sm text-slate-600 mb-2"><strong className="text-slate-900">{pendingCertCourse}</strong> kursini a'lo darajada bitirdingiz!</p>
            <p className="text-sm text-slate-500 mb-6">Lekin topshiriqlaringiz hali baholanmagan. O'qituvchi barcha topshiriqlarni baholab bo'lgach, sertifikatni yuklab olishingiz mumkin bo'ladi.</p>
            <Button onClick={() => setPendingCertCourse(null)} className="w-full h-11 rounded-xl font-black text-sm bg-amber-500 hover:bg-amber-600 text-white border-0">Tushunarli</Button>
          </div>
        </div>
      )}
    </div>
  );
}
