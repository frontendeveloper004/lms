"use client";

import { useState } from "react";
import { Users, Search, Mail, Calendar, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200" },
  { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
  { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" },
  { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200" },
];

function StudentAvatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "md" | "lg" }) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const c = AVATAR_COLORS[idx];
  const sizeClass = size === "lg" ? "w-12 h-12 text-lg rounded-2xl" : "w-10 h-10 text-base rounded-xl";
  if (avatar) {
    return (
      <div className={`${sizeClass} overflow-hidden border shrink-0 ${c.border}`}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizeClass} flex items-center justify-center font-black border shrink-0 ${c.bg} ${c.text} ${c.border}`}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  joined: string;
  courseCount: number;
  courses: string[];
}

export function StudentsClient({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <Users className="w-7 h-7 text-blue-600" />
            Talabalar
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Sizning darslaringizni o'rganayotgan faol talabalar ro'yxati.
          </p>
        </div>
        {students.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl self-start sm:self-auto">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-700">{students.length} talaba</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Talabani qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm font-medium"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl py-16 flex flex-col items-center gap-3 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium text-sm">
            {search ? "Qidiruv bo'yicha talabalar topilmadi." : "Hozircha talabalar mavjud emas."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Talaba</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kurslar</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qo'shilgan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar name={student.name} avatar={student.avatar} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {student.courses.map((c, idx) => (
                          <span key={idx} className="bg-blue-50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 border border-blue-100">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs text-slate-500 font-medium border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {formatDate(student.joined)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/students/${student.id}?from=/teacher/students`}
                        className="h-8 px-3 rounded-lg font-bold text-[11px] text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-100 transition-all inline-flex items-center gap-1.5"
                      >
                        Profil <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((student) => {
              const idx = student.name.charCodeAt(0) % AVATAR_COLORS.length;
              const c = AVATAR_COLORS[idx];
              return (
                <div key={student.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <div className={`h-1 w-full ${c.bg}`} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar name={student.name} avatar={student.avatar} size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </p>
                      </div>
                      <Link
                        href={`/students/${student.id}?from=/teacher/students`}
                        className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center border transition-colors ${c.bg} ${c.border} ${c.text} hover:opacity-80`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="border-t border-slate-100" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Kurslar
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.courses.map((course, i) => (
                          <span key={i} className="bg-blue-50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 border border-blue-100">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>Qo'shilgan:</span>
                        <span className="font-bold text-slate-600">{formatDate(student.joined)}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                        {student.courses.length} kurs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
