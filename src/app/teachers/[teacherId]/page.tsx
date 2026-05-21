"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  User, BookOpen, Users, Calendar, Linkedin, Github,
  Youtube, Globe, Send, ExternalLink, Award, Briefcase,
  Loader2, ChevronRight, Star, Zap, BadgeCheck, GraduationCap,
  TrendingUp, ArrowLeft, Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicCourse {
  id: string;
  title: string;
  description: string;
  image: string | null;
  level: string;
  price: number;
  xpPoints: number;
  category: string;
  studentCount: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string | null;
  year: number | null;
  imageUrl: string | null;
}

interface TeacherData {
  id: string;
  name: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  specialization: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  youtubeUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  whatsappUrl: string | null;
  subjectType: string;
  teachingExperience: string | null;
  languages: string | null;
  availability: string | null;
  lessonFormat: string | null;
  universityDegree: string | null;
  teachingMaterials: string | null;
  studentResults: string | null;
  lessonPrice: number | null;
  ieltsScore: number | null;
  hasTesolTefl: boolean;
  hasTrialLesson: boolean;
  memberSince: string;
  stats: {
    courseCount: number;
    uniqueStudentCount: number;
    totalEnrollments: number;
  };
  courses: PublicCourse[];
  projects: Project[];
  certificates: Certificate[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SKILL_COLORS = [
  "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
  "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
  "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
];
const skillColor = (i: number) => SKILL_COLORS[i % SKILL_COLORS.length];

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
    ADVANCED: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    BEGINNER: "Boshlang'ich",
    INTERMEDIATE: "O'rta",
    ADVANCED: "Ilg'or",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${map[level] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {labels[level] ?? level}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params?.teacherId as string;

  const handleBack = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get("from");
    if (from) {
      router.push(from);
    } else if (window.history.length > 1 && document.referrer) {
      router.back();
    } else {
      router.push("/courses");
    }
  };

  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teachers/${teacherId}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); setIsLoading(false); return null; }
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => { if (data) setTeacher(data); setIsLoading(false); })
      .catch(() => { setNotFound(true); setIsLoading(false); });
  }, [teacherId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-violet-400" />
          <p className="text-slate-400 text-sm font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (notFound || !teacher) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
          <User className="w-9 h-9 text-slate-300" />
        </div>
        <h1 className="text-xl font-black text-slate-900">O'qituvchi topilmadi</h1>
        <p className="text-slate-400 text-sm font-medium">Bu profil mavjud emas yoki o'chirilgan.</p>
        <Link href="/courses" className="text-violet-600 text-sm font-black hover:underline flex items-center gap-1.5">
          Kurslarga qaytish <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const joinYear = new Date(teacher.memberSince).getFullYear();
  const completionRate = teacher.stats.courseCount > 0
    ? Math.round((teacher.stats.uniqueStudentCount / Math.max(teacher.stats.totalEnrollments, 1)) * 100)
    : 0;

  const socialLinks = [
    { href: teacher.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { href: teacher.githubUrl, icon: Github, label: "GitHub" },
    { href: teacher.youtubeUrl, icon: Youtube, label: "YouTube" },
    {
      href: teacher.telegramUrl
        ? teacher.telegramUrl.startsWith("http")
          ? teacher.telegramUrl
          : `https://t.me/${teacher.telegramUrl.replace("@", "")}`
        : null,
      icon: Send,
      label: "Telegram",
    },
    {
      href: teacher.whatsappUrl
        ? teacher.whatsappUrl.startsWith("http")
          ? teacher.whatsappUrl
          : `https://wa.me/${teacher.whatsappUrl.replace("+", "").replace(/\s/g, "")}`
        : null,
      icon: Phone,
      label: "WhatsApp",
    },
    { href: teacher.websiteUrl, icon: Globe, label: "Sayt" },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen bg-[#f8f7ff]">

      {/* ── HERO / COVER ─────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ aspectRatio: "16/4", maxHeight: "260px", minHeight: "160px" }}>
        {/* Cover image or gradient */}
        {teacher.coverPhoto ? (
          <img src={teacher.coverPhoto} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700" />
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="absolute top-4 left-4 flex items-center gap-2 text-xs font-black text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-xl transition-all duration-200 hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Ortga
        </button>
      </div>

      {/* ── PROFILE HEADER ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Avatar + name row — avatar overlaps cover, text is below on white bg */}
        <div className="relative flex flex-col sm:flex-row sm:items-end gap-0 mb-4">
          {/* Avatar — pulls up over cover */}
          <div className="relative shrink-0 z-10 -mt-16">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white ring-2 ring-violet-200">
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-black text-4xl">{teacher.name[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Spacer on mobile so text doesn't overlap */}
          <div className="flex-1" />
        </div>

        {/* Name + badges + specialization + social — fully on white background */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                {teacher.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-violet-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                <GraduationCap className="w-3 h-3" /> O'qituvchi
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-violet-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                <BadgeCheck className="w-3 h-3" /> Tasdiqlangan
              </span>
              {teacher.stats.uniqueStudentCount >= 50 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full shadow-sm">
                  <Star className="w-3 h-3 fill-amber-900" /> Top Mentor
                </span>
              )}
            </div>
            {teacher.specialization && (
              <p className="text-slate-500 text-sm font-semibold mb-3">{teacher.specialization}</p>
            )}
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-violet-600 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* View courses CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                document.getElementById("courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 text-sm font-black text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-5 py-2.5 rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all duration-200 hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" /> Kurslarni ko'rish
            </button>
          </div>
        </div>

        {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen, label: "Kurslar", value: teacher.stats.courseCount, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
            { icon: Users, label: "O'quvchilar", value: teacher.stats.uniqueStudentCount, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { icon: TrendingUp, label: "Yozilganlar", value: teacher.stats.totalEnrollments, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { icon: Calendar, label: "A'zo bo'lgan", value: `${joinYear}-yil`, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow`}>
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

        {/* ── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 pb-16">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Bio */}
            {teacher.bio && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-violet-500" /> Men haqimda
                </h2>
                <p className="text-slate-600 text-sm leading-7 font-medium whitespace-pre-line">{teacher.bio}</p>
              </div>
            )}

            {/* Skills */}
            {teacher.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Ko'nikmalar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.skills.map((skill, i) => (
                    <span
                      key={skill}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-default transition-all duration-200 hover:scale-105 hover:shadow-sm ${skillColor(i)}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {teacher.certificates.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Sertifikatlar
                </h2>
                <div className="space-y-3">
                  {teacher.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200">
                      {cert.imageUrl ? (
                        <img src={cert.imageUrl} alt={cert.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm leading-snug">{cert.name}</p>
                        {cert.issuer && <p className="text-xs text-slate-500 font-medium mt-0.5">{cert.issuer}</p>}
                        {cert.year && <p className="text-xs text-slate-400 font-medium">{cert.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience / Member since for Programming Teachers */}
            {teacher.subjectType !== "ENGLISH" && (
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm">LearnEdu Dasturchisi</p>
                    <p className="text-blue-200 text-xs font-medium">{joinYear}-yildan beri</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200 font-medium">Jami kurslar</span>
                    <span className="font-black">{teacher.stats.courseCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200 font-medium">O'quvchilar</span>
                    <span className="font-black">{teacher.stats.uniqueStudentCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price Card for English Teachers */}
            {teacher.subjectType === "ENGLISH" && teacher.lessonPrice && (
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-sm">Individual Darslar</p>
                    <p className="text-violet-200 text-xs font-medium">Professional o'qituvchi</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                    <span className="text-violet-200 font-medium">Dars narxi</span>
                    <span className="font-black">{teacher.lessonPrice.toLocaleString()} UZS / soat</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-violet-200 font-medium">Kollektiv kurslar</span>
                    <span className="font-black">{teacher.stats.courseCount} ta</span>
                  </div>
                </div>
              </div>
            )}



          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* English Specific Sections (Qualifications & Content) */}
            {teacher.subjectType === "ENGLISH" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Qualifications */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Malaka va Sertifikatlar
                  </h2>
                  <div className="space-y-4">
                    {teacher.ieltsScore && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">IELTS Balli</p>
                        <p className="text-lg font-black text-emerald-700">{teacher.ieltsScore}</p>
                      </div>
                    )}
                    {teacher.universityDegree && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Universitet darajasi</p>
                          <p className="text-sm font-bold text-slate-700">{teacher.universityDegree}</p>
                        </div>
                      </div>
                    )}
                    {teacher.hasTesolTefl && (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        <BadgeCheck className="w-4 h-4" /> TESOL / TEFL Sertifikati bor
                      </div>
                    )}
                  </div>
                </div>

                {/* Teaching Content */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Dars mazmuni
                  </h2>
                  <div className="space-y-4">
                    {teacher.studentResults && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Studentlar natijalari</p>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-3">
                          "{teacher.studentResults}"
                        </p>
                      </div>
                    )}
                    {teacher.teachingMaterials && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Dars materiallari</p>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                          {teacher.teachingMaterials}
                        </p>
                      </div>
                    )}
                    {teacher.hasTrialLesson && (
                      <div className="inline-flex items-center gap-2 text-amber-600 font-bold text-xs bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> Bepul birinchi dars mavjud
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="courses">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-violet-500" /> Kurslar
                </h2>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                  {teacher.stats.courseCount} ta
                </span>
              </div>

              {teacher.courses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-semibold text-sm">Hali kurslar yo'q.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teacher.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-md transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200" style={{ height: "72px" }}>
                        {course.image ? (
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-violet-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm leading-snug group-hover:text-violet-600 transition-colors line-clamp-1 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-2 leading-relaxed">{course.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <LevelBadge level={course.level} />
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                            <Users className="w-3 h-3" /> {course.studentCount}
                          </span>
                          {course.xpPoints > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-violet-600 font-bold">
                              <Star className="w-3 h-3" /> +{course.xpPoints} XP
                            </span>
                          )}
                          <span className="ml-auto font-black text-sm text-violet-600">
                            {course.price === 0 ? "Bepul" : `${course.price.toLocaleString()} UZS`}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 shrink-0 self-center transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Projects (Only for Programming) */}
            {teacher.subjectType === "PROGRAMMING" && teacher.projects.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" /> Loyihalar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teacher.projects.map((project) => (
                    <div
                      key={project.id}
                      className="group rounded-xl border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-slate-50"
                    >
                      {project.imageUrl && (
                        <div className="h-36 overflow-hidden bg-slate-200">
                          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-black text-slate-900 text-sm leading-snug">{project.title}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.url!, "_blank"); }}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{project.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
