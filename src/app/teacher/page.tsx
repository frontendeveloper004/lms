// Server Component — "use client" yo'q, useEffect yo'q, fetch() yo'q
// Ma'lumot to'g'ridan-to'g'ri DB dan olinadi → Neon cold start muammosi yo'q

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen, PlusCircle, Users, CheckCircle2,
  TrendingUp, Wallet, ArrowUpRight, LayoutDashboard, ChevronRight,
} from "lucide-react";
import { requireTeacherSession, getTeacherDashboardData } from "@/lib/data/teacher";

export default async function TeacherDashboard() {
  // Server tomonida session tekshiruvi — redirect agar login qilinmagan
  const session = await requireTeacherSession();

  // To'g'ridan-to'g'ri DB dan — HTTP round-trip yo'q
  const courses = await getTeacherDashboardData(session.userId);

  const totalEarnings = courses.reduce(
    (acc, c) => acc + c.price * c._count.enrollments,
    0
  );
  const totalStudents = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const topCourse =
    courses.length > 0
      ? [...courses].sort((a, b) => b._count.enrollments - a._count.enrollments)[0]
      : null;


  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
          <LayoutDashboard className="w-7 h-7 text-blue-600" />
          Umumnazorat
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Bugungi natijalaringiz va platforma tahlili bilan tanishing.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Earnings */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
          <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-20 h-20 text-slate-900" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Umumiy Daromad
          </p>
          <h3 className="text-3xl font-black text-slate-900 mb-4">
            {totalEarnings.toLocaleString()}{" "}
            <span className="text-sm font-medium text-slate-400">UZS</span>
          </h3>
          {topCourse && topCourse._count.enrollments > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100">
              <TrendingUp className="w-3 h-3" /> {topCourse.title}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Real vaqtda tahlil
            </div>
          )}
        </div>

        {/* Students */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 group hover:border-blue-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Faol
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Jami Talabalar
          </p>
          <h3 className="text-3xl font-black text-slate-900">{totalStudents}</h3>
        </div>

        {/* Courses & Content */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 group hover:border-violet-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <Link
              href="/teacher/courses"
              className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black border border-violet-100 hover:bg-violet-600 hover:text-white transition-all uppercase tracking-widest"
            >
              Barchasi
            </Link>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Jami Kurslar
          </p>
          <h3 className="text-3xl font-black text-slate-900">{courses.length}</h3>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
            Yangi kursingizni yaratishga{" "}
            <span className="text-blue-200">tayyormisiz?</span>
          </h2>
          <p className="text-white/70 font-medium mb-8 leading-relaxed text-sm">
            O'z tajribangizni kursga aylantiring va minglab talabalarga o'z
            sohangiz sirlarini o'rgatishni bugun boshlang.
          </p>
          <Link href="/teacher/courses/create">
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-sm gap-2 bg-white text-blue-700 hover:bg-blue-50 border-0 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" /> Kurs Yaratish
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
