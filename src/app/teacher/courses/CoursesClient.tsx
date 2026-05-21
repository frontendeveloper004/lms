"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import {
  BookOpen, PlusCircle, Users, CheckCircle2, ShieldAlert,
  Edit3, Clock, Trash2, AlertTriangle, Loader2,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  createdAt: string;
  category: { name: string };
  image: string | null;
  xpPoints: number;
  _count: { enrollments: number };
  modules: {
    id: string;
    _count: { lessons: number; quizzes: number };
    assignment: { id: string } | null;
  }[];
}

function CourseCard({ course, onDelete }: { course: Course; onDelete: () => void }) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m._count.lessons, 0);
  const totalQuizzes = course.modules.reduce((acc, m) => acc + m._count.quizzes, 0);
  const totalAssignments = course.modules.filter(m => m.assignment).length;

  const statusConfig = {
    APPROVED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    REJECTED: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50" },
    PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  };
  const { icon: StatusIcon, color, bg } =
    statusConfig[course.status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden flex flex-col group">
      <div className="h-44 bg-slate-50 relative overflow-hidden">
        {course.image ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-xl">LEARNEDU</div>
        )}
        <div className={`absolute top-3 right-3 ${bg} p-2 rounded-xl border ${color.replace("text-", "border-").replace("600", "200").replace("500", "200")}`}>
          <StatusIcon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
          {course.xpPoints} XP
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-blue-600 border border-blue-100 mb-3 w-fit">
          {course.category.name}
        </span>
        <h3 className="font-black text-base mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed flex-1">
          {course.description}
        </p>
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 mb-4">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Darslar</p>
            <p className="font-black text-slate-900 text-xs text-center">{totalLessons}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Testlar</p>
            <p className="font-black text-slate-900 text-xs text-center">{totalQuizzes}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Vazifalar</p>
            <p className="font-black text-slate-900 text-xs text-center">{totalAssignments}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Narxi</p>
            <p className="font-black text-slate-900 text-sm">
              {course.price === 0 ? <span className="text-emerald-600">BEPUL</span> : `${course.price.toLocaleString()} UZS`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">O'quvchilar</p>
            <p className="font-black text-slate-900 flex items-center justify-end gap-1.5 text-sm">
              <Users className="w-3.5 h-3.5 text-blue-500" /> {course._count.enrollments}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 p-4 flex gap-2 border-t border-slate-100">
        <Link href={`/teacher/courses/${course.id}/modules`} className="flex-1">
          <Button variant="ghost" className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest gap-1.5 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 transition-all text-slate-600">
            <BookOpen className="w-3.5 h-3.5" /> Darslar
          </Button>
        </Link>
        <Link href={`/teacher/courses/${course.id}/edit`}>
          <Button variant="ghost" className="h-10 w-10 rounded-xl px-0 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 transition-all">
            <Edit3 className="w-4 h-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="h-10 w-10 rounded-xl px-0 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 transition-all"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function CoursesClient({ initialCourses, subjectType }: { initialCourses: Course[]; subjectType: string }) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const createLink = subjectType === "ENGLISH" ? "/teacher/courses/create/english" : "/teacher/courses/create";

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const sections = [
    { status: "PENDING", label: "Kutilmoqda", sub: "Admin tasdig'ini kutayotgan kurslar", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { status: "APPROVED", label: "Tasdiqlangan", sub: "O'quvchilar ko'ra oladigan kurslar", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    { status: "REJECTED", label: "Rad etilgan", sub: "Kamchiliklar sababli rad etilganlar", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Mening kurslarim
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Siz yaratgan barcha o'quv dasturlari va modullar.
          </p>
        </div>
        <Button asChild className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm shadow-blue-200 self-start sm:self-auto">
          <Link href={createLink}>
            <PlusCircle className="w-4 h-4" /> Yangi Kurs
          </Link>
        </Button>
      </div>

      <div className="space-y-10">
        {sections.map(({ status, label, sub, icon: Icon, color, bg, border }) => {
          const filtered = courses.filter((c) => c.status === status);
          return (
            <section key={status}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center ${color} border ${border} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-slate-900 leading-tight">{label}</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{sub}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black border ${bg} ${color} ${border}`}>
                  {filtered.length}
                </span>
              </div>
              {filtered.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-400 font-medium text-sm">Hozircha kurslar yo'q</p>
                </div>
              ) : (
                <>
                  <div className="md:hidden">
                    <HorizontalScrollRow itemFullWidth>
                      {filtered.map((course) => (
                        <div key={course.id} className="w-[calc(100vw-2rem)] shrink-0 snap-center">
                          <CourseCard course={course} onDelete={() => setDeleteTarget(course)} />
                        </div>
                      ))}
                    </HorizontalScrollRow>
                  </div>
                  <div className="hidden md:block">
                    <HorizontalScrollRow>
                      {filtered.map((course) => (
                        <div key={course.id} className="w-[300px] xl:w-[calc(33.333%-14px)] shrink-0 snap-start">
                          <CourseCard course={course} onDelete={() => setDeleteTarget(course)} />
                        </div>
                      ))}
                    </HorizontalScrollRow>
                  </div>
                </>
              )}
            </section>
          );
        })}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 text-center mb-2">Kursni o'chirish</h2>
            <p className="text-slate-500 text-sm text-center font-medium leading-relaxed mb-2">
              Quyidagi kursni o'chirishni tasdiqlaysizmi?
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center mb-6">
              <p className="font-black text-slate-900 text-sm">{deleteTarget.title}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{deleteTarget.category.name}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-semibold leading-relaxed">
                Bu amalni qaytarib bo'lmaydi. Kurs bilan birga barcha modullar, darslar va testlar ham o'chib ketadi.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-sm" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>
                Bekor qilish
              </Button>
              <Button className="flex-1 h-11 rounded-xl font-black text-sm bg-red-600 hover:bg-red-700 text-white border-0 gap-2" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
