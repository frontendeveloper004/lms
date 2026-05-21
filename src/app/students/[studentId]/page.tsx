"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, BookOpen, Award, Zap, Flame, Calendar,
  Loader2, ArrowLeft, CheckCircle2, Clock,
  GraduationCap, Linkedin, Github, Send, Globe,
  MapPin, Target, Tag, BadgeCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseItem {
  id: string; title: string; image: string | null;
  level: string; category: string; progress: number;
}
interface Certificate {
  id: string; issuedAt: string;
  course: { id: string; title: string };
}
interface StudentData {
  id: string; name: string; avatar: string | null; coverPhoto: string | null;
  bio: string | null; location: string | null; goal: string | null;
  skills: string[]; linkedinUrl: string | null; githubUrl: string | null;
  telegramUrl: string | null; websiteUrl: string | null;
  xpPoints: number; xpLevel: string; league: string; learningStreak: number;
  memberSince: string; badges: string[];
  stats: { totalEnrollments: number; completedCourses: number; activeCourses: number; certificateCount: number; learningStreak: number };
  activeCourses: CourseItem[]; completedCourses: CourseItem[]; certificates: Certificate[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
    ADVANCED: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    BEGINNER: "Boshlang'ich", INTERMEDIATE: "O'rta", ADVANCED: "Ilg'or",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${map[level] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {labels[level] ?? level}
    </span>
  );
}

const XP_LEVEL_COLORS: Record<string, string> = {
  "Boshlang'ich": "bg-slate-100 text-slate-600 border-slate-200",
  "O'rta daraja": "bg-blue-50 text-blue-700 border-blue-200",
  "Ilg'or daraja": "bg-violet-50 text-violet-700 border-violet-200",
  "Ekspert":       "bg-amber-50 text-amber-700 border-amber-200",
};

const XP_LEVEL_LABELS: Record<string, string> = {
  "Boshlang'ich": "Boshlang'ich",
  "O'rta daraja": "O'rta daraja",
  "Ilg'or daraja": "Ilg'or daraja",
  "Ekspert":       "Ekspert",
};

const SKILL_COLORS = [
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId as string;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/students/${studentId}`)
      .then(async (res) => {
        if (res.status === 403 || res.status === 404) { setNotFound(true); setIsLoading(false); return null; }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => { if (data) setStudent(data); setIsLoading(false); })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [studentId]);

  const handleBack = () => {
    const from = new URLSearchParams(window.location.search).get("from");
    if (from) router.push(from);
    else if (window.history.length > 1) router.back();
    else router.push("/student/ranking");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
    </div>
  );

  if (notFound || !student) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <User className="w-9 h-9 text-slate-300" />
      </div>
      <h1 className="text-xl font-black text-slate-900">Talaba topilmadi</h1>
      <p className="text-slate-400 text-sm font-medium">Bu profil mavjud emas yoki sizda ruxsat yo'q.</p>
      <button onClick={handleBack} className="text-blue-600 text-sm font-black hover:underline flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Ortga
      </button>
    </div>
  );

  const joinYear = new Date(student.memberSince).getFullYear();

  const socialLinks = [
    { href: student.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { href: student.githubUrl, icon: Github, label: "GitHub" },
    {
      href: student.telegramUrl
        ? student.telegramUrl.startsWith("http") ? student.telegramUrl : `https://t.me/${student.telegramUrl.replace("@", "")}`
        : null,
      icon: Send, label: "Telegram",
    },
    { href: student.websiteUrl, icon: Globe, label: "Sayt" },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      {/* ── COVER ──────────────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ aspectRatio: "16/4", maxHeight: "240px", minHeight: "140px" }}>
        {student.coverPhoto
          ? <img src={student.coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button
          type="button" onClick={handleBack}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-black text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl transition-all hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Ortga
        </button>
      </div>

      {/* ── PROFILE HEADER ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* Avatar overlaps cover */}
        <div className="-mt-16 mb-4 flex items-end gap-0">
          <div className="relative z-10 shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white ring-2 ring-blue-200">
              {student.avatar
                ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-black text-4xl">{student.name[0]}</span>
                  </div>
              }
            </div>
          </div>
        </div>

        {/* Name + badges + meta */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            {/* Name + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{student.name}</h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                <BadgeCheck className="w-3 h-3" /> Talaba
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${XP_LEVEL_COLORS[student.xpLevel]}`}>
                {XP_LEVEL_LABELS[student.xpLevel] ?? student.xpLevel}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                {student.league} ligasi
              </span>
            </div>

            {/* Location + date */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {student.location && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {student.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" /> {joinYear}-yildan beri
              </span>
            </div>

            {/* Goal */}
            {student.goal && (
              <div className="flex items-start gap-1.5 mb-3 max-w-lg">
                <Target className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600 font-medium">{student.goal}</p>
              </div>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href!} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen,     label: "Jami kurslar",  value: student.stats.totalEnrollments, color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
            { icon: CheckCircle2, label: "Tugatilgan",    value: student.stats.completedCourses,  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { icon: Award,        label: "Sertifikatlar", value: student.stats.certificateCount,  color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
            { icon: Zap,          label: "XP ballari",    value: student.xpPoints,                color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`text-xl font-black leading-none ${color}`}>{value}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 pb-16">

          {/* LEFT ──────────────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Bio */}
            {student.bio && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Men haqimda
                </h2>
                <p className="text-slate-600 text-sm font-medium leading-7 whitespace-pre-line">{student.bio}</p>
              </div>
            )}

            {/* Skills */}
            {student.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Ko'nikmalar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, i) => (
                    <span key={skill} className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-200 hover:scale-105 ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm">O'quv statistikasi</p>
                  <p className="text-blue-200 text-xs font-medium">{joinYear}-yildan beri</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Faol kurslar",      value: student.stats.activeCourses },
                  { label: "Tugatilgan",         value: student.stats.completedCourses },
                  { label: "Sertifikatlar",      value: student.stats.certificateCount },
                  { label: "O'rganish seriyasi", value: `${student.learningStreak} kun` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-blue-200 font-medium">{label}</span>
                    <span className="font-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak + XP */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-black text-slate-700">O'rganish seriyasi</span>
                </div>
                <span className="text-lg font-black text-orange-500">{student.learningStreak} kun</span>
              </div>
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-500" />
                  <span className="text-sm font-black text-slate-700">XP ballari</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-violet-600">{student.xpPoints}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{student.xpLevel}</p>
                </div>
              </div>
            </div>

            {/* Certificates */}
            {student.certificates.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Sertifikatlar
                </h2>
                <div className="space-y-2.5">
                  {student.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">{cert.course.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {new Date(cert.issuedAt).toLocaleDateString("uz-UZ", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT ─────────────────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Active courses */}
            {student.activeCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Faol kurslar
                  <span className="ml-auto text-[11px] font-bold text-slate-400 normal-case tracking-normal bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    {student.activeCourses.length} ta
                  </span>
                </h2>
                <div className="space-y-3">
                  {student.activeCourses.map((course) => (
                    <div key={course.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                      <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                        {course.image
                          ? <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"><BookOpen className="w-5 h-5 text-blue-400" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 mb-1">{course.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <LevelBadge level={course.level} />
                          <span className="text-[11px] text-slate-400 font-medium">{course.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-[11px] font-black text-blue-600 shrink-0">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed courses */}
            {student.completedCourses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tugatilgan kurslar
                  <span className="ml-auto text-[11px] font-bold text-slate-400 normal-case tracking-normal bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    {student.completedCourses.length} ta
                  </span>
                </h2>
                <div className="space-y-3">
                  {student.completedCourses.map((course) => (
                    <div key={course.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                      <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                        {course.image
                          ? <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 mb-1">{course.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <LevelBadge level={course.level} />
                          <span className="text-[11px] text-slate-400 font-medium">{course.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-full" />
                          </div>
                          <span className="text-[11px] font-black text-emerald-600 shrink-0">100%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty */}
            {student.activeCourses.length === 0 && student.completedCourses.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 font-semibold text-sm">Hali kurslarga yozilmagan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
