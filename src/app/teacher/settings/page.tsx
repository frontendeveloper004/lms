"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/ui/premium-modal";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  User, Mail, Shield, Save, Loader2, Camera, Lock, BookOpen, Users,
  Eye, EyeOff, ExternalLink, AlertTriangle, Linkedin, Github,
  Youtube, Globe, Send, Plus, X, Briefcase, Award, ImageIcon, Tag,
  Clock, Languages, GraduationCap as Degree, CheckCircle2, DollarSign,
  Video, Phone,
} from "lucide-react";
import type { TeacherProfileResponse, TeacherProject, TeacherCertificate } from "@/types/profile";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Course Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };
  const cls = map[status] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherSettingsPage() {
  const router = useRouter();

  // Data
  const [profile, setProfile] = useState<TeacherProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  // Cover photo
  const [coverInput, setCoverInput] = useState("");
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isCoverSaving, setIsCoverSaving] = useState(false);

  // Edit profile form
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [bioError, setBioError] = useState("");
  const [specError, setSpecError] = useState("");
  const [linkedinError, setLinkedinError] = useState("");
  const [githubError, setGithubError] = useState("");
  const [youtubeError, setYoutubeError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
 
  // Advanced teacher fields
  const [experience, setExperience] = useState("");
  const [langs, setLangs] = useState("");
  const [availability, setAvailability] = useState("");
  const [lessonFormat, setLessonFormat] = useState("Online");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [degree, setDegree] = useState("");
  const [materials, setMaterials] = useState("");
  const [results, setResults] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [ieltsScore, setIeltsScore] = useState<number | string>("");
  const [hasTesol, setHasTesol] = useState(false);
  const [hasTrial, setHasTrial] = useState(false);

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Projects
  const [projects, setProjects] = useState<TeacherProject[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<TeacherProject | null>(null);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", url: "", imageUrl: "" });
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Certificates
  const [certificates, setCertificates] = useState<TeacherCertificate[]>([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<TeacherCertificate | null>(null);
  const [certForm, setCertForm] = useState({ name: "", issuer: "", year: "", imageUrl: "" });
  const [isSavingCert, setIsSavingCert] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/teacher/profile")
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) { window.location.href = "/login"; return null; }
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.error ?? "Unknown error"}`);
        return data;
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setName(data.name ?? "");
        setSpecialization(data.specialization ?? "");
        setBio(data.bio ?? "");
        setLinkedinUrl(data.linkedinUrl ?? "");
        setGithubUrl(data.githubUrl ?? "");
        setYoutubeUrl(data.youtubeUrl ?? "");
        setTelegramUrl(data.telegramUrl ?? "");
        setWebsiteUrl(data.websiteUrl ?? "");
        setSkills(Array.isArray(data.skills) ? data.skills : []);
 
        // Advanced
        setExperience(data.teachingExperience ?? "");
        setLangs(data.languages ?? "");
        setAvailability(data.availability ?? "");
        setLessonFormat(data.lessonFormat ?? "Online");
        setWhatsappUrl(data.whatsappUrl ?? "");
        setDegree(data.universityDegree ?? "");
        setMaterials(data.teachingMaterials ?? "");
        setResults(data.studentResults ?? "");
        setPrice(data.lessonPrice ?? "");
        setIeltsScore(data.ieltsScore ?? "");
        setHasTesol(data.hasTesolTefl ?? false);
        setHasTrial(data.hasTrialLesson ?? false);
 
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load teacher profile:", err);
        setIsLoading(false);
      });
  }, []);

  // ── Fetch projects & certificates ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/teacher/projects")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/teacher/certificates")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Save avatar ─────────────────────────────────────────────────────────────
  const handleSaveAvatar = async (url: string) => {
    // ImageUploader already uploaded the file and saved to DB via /api/upload/avatar
    // Just update local state
    setProfile((prev) => (prev ? { ...prev, avatar: url } : prev));
    setShowAvatarModal(false);
  };

  // ── Save cover photo ────────────────────────────────────────────────────────
  const handleSaveCover = async (url: string) => {
    // After ImageUploader uploads, we still need to save coverPhoto to DB via PATCH
    setIsCoverSaving(true);
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: url || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, coverPhoto: data.coverPhoto } : prev));
        setShowCoverModal(false);
        toast.success("Cover rasm yangilandi!");
      } else {
        toast.error(data.error ?? "Cover rasmni yangilashda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsCoverSaving(false);
    }
  };

  // ── Add skill ───────────────────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) { toast.error("Bu ko'nikma allaqachon qo'shilgan."); return; }
    if (skills.length >= 15) { toast.error("Maksimal 15 ta ko'nikma qo'shish mumkin."); return; }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  // ── Save project ────────────────────────────────────────────────────────────
  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) { toast.error("Loyiha nomi kiritilishi shart."); return; }
    setIsSavingProject(true);
    try {
      const method = editingProject ? "PATCH" : "POST";
      const url = editingProject ? `/api/teacher/projects/${editingProject.id}` : "/api/teacher/projects";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      const data = await res.json();
      if (res.ok) {
        if (editingProject) {
          setProjects((prev) => prev.map((p) => p.id === editingProject.id ? data : p));
        } else {
          setProjects((prev) => [...prev, data]);
        }
        setShowProjectModal(false);
        setEditingProject(null);
        setProjectForm({ title: "", description: "", url: "", imageUrl: "" });
        toast.success(editingProject ? "Loyiha yangilandi!" : "Loyiha qo'shildi!");
      } else {
        toast.error(data.error ?? "Xatolik yuz berdi.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Loyiha o'chirildi.");
      } else {
        toast.error("O'chirishda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    }
  };

  // ── Save certificate ────────────────────────────────────────────────────────
  const handleSaveCert = async () => {
    if (!certForm.name.trim()) { toast.error("Sertifikat nomi kiritilishi shart."); return; }
    setIsSavingCert(true);
    try {
      const method = editingCert ? "PATCH" : "POST";
      const url = editingCert ? `/api/teacher/certificates/${editingCert.id}` : "/api/teacher/certificates";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...certForm, year: certForm.year ? parseInt(certForm.year) : null }),
      });
      const data = await res.json();
      if (res.ok) {
        if (editingCert) {
          setCertificates((prev) => prev.map((c) => c.id === editingCert.id ? data : c));
        } else {
          setCertificates((prev) => [...prev, data]);
        }
        setShowCertModal(false);
        setEditingCert(null);
        setCertForm({ name: "", issuer: "", year: "", imageUrl: "" });
        toast.success(editingCert ? "Sertifikat yangilandi!" : "Sertifikat qo'shildi!");
      } else {
        toast.error(data.error ?? "Xatolik yuz berdi.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsSavingCert(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/certificates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCertificates((prev) => prev.filter((c) => c.id !== id));
        toast.success("Sertifikat o'chirildi.");
      } else {
        toast.error("O'chirishda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    }
  };

  // ── Validate social URL ─────────────────────────────────────────────────────
  const validateSocialUrl = (url: string): string => {
    if (url && !url.startsWith("https://")) return "URL manzil https:// bilan boshlanishi kerak";
    return "";
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (bio.length > 500) { setBioError("Bio 500 belgidan oshmasligi kerak."); hasError = true; } else { setBioError(""); }
    if (specialization.length > 100) { setSpecError("Mutaxassislik 100 belgidan oshmasligi kerak."); hasError = true; } else { setSpecError(""); }
    const liErr = validateSocialUrl(linkedinUrl);
    const ghErr = validateSocialUrl(githubUrl);
    const ytErr = validateSocialUrl(youtubeUrl);
    const wsErr = validateSocialUrl(websiteUrl);
    setLinkedinError(liErr);
    setGithubError(ghErr);
    setYoutubeError(ytErr);
    setWebsiteError(wsErr);
    if (liErr || ghErr || ytErr || wsErr) hasError = true;
    if (hasError) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, specialization, bio,
          linkedinUrl, githubUrl, youtubeUrl, telegramUrl, whatsappUrl, websiteUrl,
          skills,
          teachingExperience: experience,
          languages: langs,
          availability,
          lessonFormat,
          universityDegree: degree,
          teachingMaterials: materials,
          studentResults: results,
          lessonPrice: price === "" ? null : Number(price),
          ieltsScore: ieltsScore === "" ? null : Number(ieltsScore),
          hasTesolTefl: hasTesol,
          hasTrialLesson: hasTrial,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => prev ? {
          ...prev,
          name: data.name,
          bio: data.bio,
          specialization: data.specialization,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          youtubeUrl: data.youtubeUrl,
          telegramUrl: data.telegramUrl,
          websiteUrl: data.websiteUrl,
          skills: data.skills,
        } : prev);
        toast.success("Profil muvaffaqiyatli yangilandi!");
      } else {
        toast.error(data.error ?? "Profilni yangilashda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setPwError("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak."); return; }
    if (newPassword !== confirmPassword) { setPwError("Parollar mos kelmaydi."); return; }
    setPwError("");
    setIsChangingPw(true);
    try {
      const res = await fetch("/api/teacher/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Parol muvaffaqiyatli o'zgartirildi!");
      } else {
        toast.error(data.error ?? "Parolni o'zgartirishda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsChangingPw(false);
    }
  };

  // ── Delete account ──────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/teacher/account", { method: "DELETE" });
      if (res.ok) {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      } else {
        toast.error("Hisobni o'chirishda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-slate-300" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center gap-3">
        <p className="text-slate-400 font-medium">Profil yuklanmadi.</p>
        <p className="text-slate-300 text-xs">Iltimos, qayta login qiling yoki sahifani yangilang.</p>
        <a href="/login" className="text-blue-600 text-sm font-bold hover:underline">Login sahifasiga o'tish</a>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Professional Card ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-violet-500/20 min-h-[140px]">
          {/* Cover — to'liq cardni qoplaydi */}
          <div className="absolute inset-0">
            {profile.coverPhoto ? (
              <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-700" />
            )}
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Edit cover button */}
          <button
            type="button"
            onClick={() => { setCoverInput(profile.coverPhoto ?? ""); setShowCoverModal(true); }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black/30 hover:bg-black/50 text-white px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
          >
            <ImageIcon className="w-3 h-3" /> Cover
          </button>

          {/* Profile info — content ustida */}
          <div className="relative z-10 px-6 py-5 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center shadow-md">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <User className="w-9 h-9 text-white/70" />
                  )}
                </div>
                <button type="button" onClick={() => { setAvatarInput(profile.avatar ?? ""); setShowAvatarModal(true); }} className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white text-violet-600 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all" aria-label="Avatarni tahrirlash">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Name + badge + specialization + social links */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black tracking-tight truncate">{profile.name}</h1>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 border border-white/30 px-2.5 py-1 rounded-full">O'qituvchi</span>
                </div>
                <p className="text-white/80 text-sm font-medium mb-3">
                  {profile.specialization ?? (
                    <span className="italic opacity-60">
                      {profile.subjectType === "ENGLISH" ? "Daraja (IELTS/CEFR) ko'rsatilmagan" : "Mutaxassislik ko'rsatilmagan"}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="LinkedIn">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="GitHub">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.youtubeUrl && (
                    <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="YouTube">
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {profile.telegramUrl && (
                    <a href={profile.telegramUrl.startsWith("http") ? profile.telegramUrl : `https://t.me/${profile.telegramUrl.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Telegram">
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Sayt">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {/* Public profile link */}
                  <Link href={`/teachers/${profile.id}`} target="_blank" className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-all">
                    <ExternalLink className="w-3 h-3" /> Profilni ko'rish
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<BookOpen className="w-5 h-5 text-violet-600" />} label="Kurslar" value={profile.stats.courseCount} color="bg-violet-50 border border-violet-100" />
          <StatCard icon={<Users className="w-5 h-5 text-purple-600" />} label="Talabalar" value={profile.stats.uniqueStudentCount} color="bg-purple-50 border border-purple-100" />
        </div>

        {/* ── My Courses ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-600" />
            </div>
            Mening kurslarim
          </h2>
          {profile.courses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-400 font-semibold text-sm">Hali kurslar yo'q.</p>
              <p className="text-slate-300 text-xs mt-1">Boshlash uchun birinchi kursingizni yarating!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-violet-100 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={course.status} />
                    <Link href={`/teacher/courses/${course.id}`} className="flex items-center gap-1.5 text-xs font-black text-violet-600 hover:text-violet-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Boshqarish <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Edit Profile Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <User className="w-4 h-4" />
            </div>
            Asosiy ma'lumotlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> To'liq ism</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="To'liq ismingiz" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
              <div className="flex items-center gap-3 w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed overflow-hidden">
                <span className="truncate text-sm font-medium">{profile.email}</span>
                <Lock className="w-3 h-3 ml-auto opacity-30" />
              </div>
            </div>
          </div>
 
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {profile.subjectType === "ENGLISH" ? "Sertifikat darajasi (IELTS/CEFR)" : "Mutaxassislik"}
              </label>
              <span className={`text-[10px] font-bold ${specialization.length > 100 ? "text-red-500" : "text-slate-400"}`}>{specialization.length} / 100</span>
            </div>
            <input value={specialization} onChange={(e) => { setSpecialization(e.target.value); if (e.target.value.length <= 100) setSpecError(""); }}
              placeholder={profile.subjectType === "ENGLISH" ? "masalan: IELTS 8.0 yoki CEFR C1" : "masalan: Full-Stack dasturlash"}
              className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${specError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
            {specError && <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {specError}</p>}
          </div>
          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Eye className="w-3 h-3" /> O'zim haqimda</label>
              <span className={`text-[10px] font-bold ${bio.length > 500 ? "text-red-500" : "text-slate-400"}`}>{bio.length} / 500</span>
            </div>
            <textarea value={bio} onChange={(e) => { setBio(e.target.value); if (e.target.value.length <= 500) setBioError(""); }} placeholder="O'zingiz haqingizda yozing..." rows={4} className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-medium text-sm resize-none ${bioError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
            {bioError && <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {bioError}</p>}
          </div>
 
          {/* English Specific Sections */}
          {profile.subjectType === "ENGLISH" && (
            <>
              {/* Professional Profile Section */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-violet-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center"><User className="w-3 h-3" /></div>
                  Professional Profil
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Tajriba</label>
                    <input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="masalan: 4 yillik tajriba" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Languages className="w-3 h-3" /> Tillar</label>
                    <input value={langs} onChange={(e) => setLangs(e.target.value)} placeholder="masalan: Uzb - Native, Eng - C1" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Ish vaqti (Availability)</label>
                    <input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="masalan: Dush-Juma / 18:00 - 22:00" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Dars formati</label>
                    <select value={lessonFormat} onChange={(e) => setLessonFormat(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm appearance-none">
                      <option value="Online">Faqat Online</option>
                      <option value="Offline">Faqat Oflayn</option>
                      <option value="Both">Ikkala format ham</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Qualifications Section */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center"><Degree className="w-3 h-3" /></div>
                  Malaka va Sertifikatlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Degree className="w-3 h-3" /> Universitet darajasi</label>
                    <input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="masalan: Bachelor of Philology" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> IELTS Score</label>
                    <input type="number" step="0.5" min="0" max="9" value={ieltsScore} onChange={(e) => setIeltsScore(e.target.value ?? "")} placeholder="masalan: 8.0" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={hasTesol} onChange={(e) => setHasTesol(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">TESOL / TEFL Sertifikati bor</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Teaching Content Section */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center"><BookOpen className="w-3 h-3 text-amber-600" /></div>
                  Dars mazmuni va Narxlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><DollarSign className="w-3 h-3" /> Dars narxi / soat</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="masalan: 120000" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                  <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={hasTrial} onChange={(e) => setHasTrial(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">Bepul birinchi dars (Trial Lesson)</span>
                    </label>
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Award className="w-3 h-3" /> Student natijalari</label>
                    <textarea value={results} onChange={(e) => setResults(e.target.value)} placeholder="masalan: 20+ student IELTS 7+ natija ko'rsatgan" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-medium text-sm resize-none" />
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Dars materiallari</label>
                    <textarea value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="masalan: PDF, Slides, Video darslar" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-medium text-sm resize-none" />
                  </div>
                </div>
              </div>
            </>
          )}

 
          {/* Outreach Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center"><Phone className="w-3 h-3" /></div>
              Aloqa va Ijtimoiy tarmoqlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Linkedin className="w-3 h-3 text-[#0077b5]" /> LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" value={linkedinUrl} onChange={(e) => { setLinkedinUrl(e.target.value); setLinkedinError(""); }} placeholder="https://linkedin.com/..." className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${linkedinError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Github className="w-3 h-3 text-slate-900" /> {profile.subjectType === "ENGLISH" ? "Sertifikat (PDF link)" : "GitHub"}</label>
                <div className="relative">
                  {profile.subjectType === "ENGLISH" ? <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> : <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                  <input type="url" value={githubUrl} onChange={(e) => { setGithubUrl(e.target.value); setGithubError(""); }} placeholder="https://..." className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${githubError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Youtube className="w-3 h-3 text-[#ff0000]" /> YouTube (Intro video)</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" value={youtubeUrl} onChange={(e) => { setYoutubeUrl(e.target.value); setYoutubeError(""); }} placeholder="https://youtube.com/..." className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${youtubeError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Send className="w-3 h-3 text-[#0088cc]" /> Telegram</label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} placeholder="@username" className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                </div>
              </div>
              {profile.subjectType === "ENGLISH" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#25d366]" /> WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)} placeholder="+998..." className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Globe className="w-3 h-3 text-indigo-500" /> Shaxsiy sayt</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" value={websiteUrl} onChange={(e) => { setWebsiteUrl(e.target.value); setWebsiteError(""); }} placeholder="https://..." className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${websiteError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"}`} />
                </div>
              </div>
            </div>
          </div>
 
          {/* Skills */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" /> Ko'nikmalar ({skills.length}/15)
            </label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                placeholder="masalan: React, IELTS, Academic Writing..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm"
              />
              <Button type="button" onClick={handleAddSkill} className="h-10 px-4 rounded-xl font-black text-xs border-none gap-1">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-violet-400 hover:text-violet-700 transition-colors ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
 
          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <Button type="submit" disabled={isSaving || bio.length > 500 || specialization.length > 100} className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-none shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              O'zgarishlarni saqlash
            </Button>
          </div>
        </form>

        {/* ── Projects (Only for Programming) ─────────────────────────────── */}
        {profile.subjectType !== "ENGLISH" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                Loyihalar
              </h2>
              <Button type="button" onClick={() => { setEditingProject(null); setProjectForm({ title: "", description: "", url: "", imageUrl: "" }); setShowProjectModal(true); }} disabled={projects.length >= 6} className="h-9 px-4 rounded-xl font-black text-xs border-none gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Qo'shish
              </Button>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-slate-400 font-semibold text-sm">Hali loyihalar yo'q.</p>
                <p className="text-slate-300 text-xs mt-1">O'z loyihalaringizni qo'shing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 transition-all">
                    <div className="flex items-start gap-3">
                      {project.imageUrl && (
                        <img src={project.imageUrl} alt={project.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{project.title}</p>
                        {project.description && <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-2">{project.description}</p>}
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> Havola
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button type="button" onClick={() => { setEditingProject(project); setProjectForm({ title: project.title, description: project.description ?? "", url: project.url ?? "", imageUrl: project.imageUrl ?? "" }); setShowProjectModal(true); }}
                        className="flex-1 text-xs font-black text-slate-600 hover:text-violet-600 transition-colors py-1.5 rounded-lg hover:bg-violet-50 border border-slate-200 hover:border-violet-200">
                        Tahrirlash
                      </button>
                      <button type="button" onClick={() => handleDeleteProject(project.id)}
                        className="flex-1 text-xs font-black text-slate-400 hover:text-red-500 transition-colors py-1.5 rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200">
                        O'chirish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Certificates ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              Sertifikatlar
            </h2>
            <Button type="button" onClick={() => { setEditingCert(null); setCertForm({ name: "", issuer: "", year: "", imageUrl: "" }); setShowCertModal(true); }} disabled={certificates.length >= 10} className="h-9 px-4 rounded-xl font-black text-xs border-none gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Qo'shish
            </Button>
          </div>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3">
                <Award className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-slate-400 font-semibold text-sm">Hali sertifikatlar yo'q.</p>
              <p className="text-slate-300 text-xs mt-1">O'z sertifikatlaringizni qo'shing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-amber-100 transition-all">
                  <div className="flex items-start gap-3">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-amber-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{cert.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {cert.issuer}{cert.issuer && cert.year ? " · " : ""}{cert.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button type="button" onClick={() => { setEditingCert(cert); setCertForm({ name: cert.name, issuer: cert.issuer ?? "", year: cert.year?.toString() ?? "", imageUrl: cert.imageUrl ?? "" }); setShowCertModal(true); }}
                      className="flex-1 text-xs font-black text-slate-600 hover:text-violet-600 transition-colors py-1.5 rounded-lg hover:bg-violet-50 border border-slate-200 hover:border-violet-200">
                      Tahrirlash
                    </button>
                    <button type="button" onClick={() => handleDeleteCert(cert.id)}
                      className="flex-1 text-xs font-black text-slate-400 hover:text-red-500 transition-colors py-1.5 rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200">
                      O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Change Password Form ─────────────────────────────────────────── */}
        <form onSubmit={handleChangePassword} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            Parolni o'zgartirish
          </h2>
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Joriy parol</label>
            <div className="relative">
              <input required type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Joriy parolni kiriting" className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showCurrent ? "Parolni yashirish" : "Parolni ko'rsatish"}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Yangi parol</label>
            <div className="relative">
              <input required type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPwError(""); }} placeholder="Kamida 8 ta belgi" className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showNew ? "Parolni yashirish" : "Parolni ko'rsatish"}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Yangi parolni tasdiqlang</label>
            <div className="relative">
              <input required type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }} placeholder="Yangi parolni qaytaring" className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showConfirm ? "Parolni yashirish" : "Parolni ko'rsatish"}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {pwError && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {pwError}
            </p>
          )}
          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <Button type="submit" disabled={isChangingPw} className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 border-none">
              {isChangingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Parolni yangilash
            </Button>
          </div>
        </form>

        {/* ── Danger Zone ──────────────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-red-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4" /> Xavfli hudud
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm">
              Hisobingizni butunlay o'chirish. Bu amalni ortga qaytarib bo'lmaydi va barcha kurslaringiz yo'qoladi.
            </p>
          </div>
          <Button variant="outline" type="button" onClick={() => setShowDeleteModal(true)} className="text-red-500 border-red-200 hover:bg-red-500 hover:text-white rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest bg-white shrink-0">
            Hisobni o'chirish
          </Button>
        </div>

      </div>

      {/* ── Avatar Modal ─────────────────────────────────────────────────────── */}
      <PremiumModal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)} title="AVATARNI YANGILASH" description="Gallereyangizdan profil rasmingizni yuklang." icon={<Camera className="w-7 h-7 text-violet-600" />}>
        <div className="space-y-4">
          <ImageUploader
            value={avatarInput}
            onChange={(url) => {
              setAvatarInput(url);
              handleSaveAvatar(url);
            }}
            uploadUrl="/api/upload/avatar"
            maxSizeLabel="2 MB"
            aspectHint="1:1 tavsiya etiladi"
            previewHeight="h-48"
            shape="square"
          />
          <Button type="button" onClick={() => setShowAvatarModal(false)} variant="ghost" className="w-full h-10 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400">
            Yopish
          </Button>
        </div>
      </PremiumModal>

      {/* ── Cover Photo Modal ─────────────────────────────────────────────────── */}
      <PremiumModal isOpen={showCoverModal} onClose={() => setShowCoverModal(false)} title="COVER RASMNI YANGILASH" description="Profil sahifangiz uchun banner rasm yuklang." icon={<ImageIcon className="w-7 h-7 text-violet-600" />}>
        <div className="space-y-4">
          <ImageUploader
            value={coverInput}
            onChange={(url) => {
              setCoverInput(url);
            }}
            uploadUrl="/api/upload/teacher-cover"
            maxSizeLabel="3 MB"
            aspectHint="16:4 tavsiya etiladi"
            previewHeight="h-32"
            shape="wide"
          />
          <div className="flex gap-3">
            {coverInput && (
              <Button type="button" variant="outline" onClick={() => handleSaveCover("")} disabled={isCoverSaving} className="flex-1 h-11 rounded-xl font-black text-xs uppercase tracking-widest text-red-500 border-red-200 hover:bg-red-50">
                O'chirish
              </Button>
            )}
            <Button type="button" onClick={() => handleSaveCover(coverInput)} disabled={isCoverSaving || !coverInput} className="flex-1 h-11 rounded-xl font-black text-xs uppercase tracking-widest border-none">
              {isCoverSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Saqlash"}
            </Button>
          </div>
        </div>
      </PremiumModal>

      {/* ── Project Modal ─────────────────────────────────────────────────────── */}
      <PremiumModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title={editingProject ? "LOYIHANI TAHRIRLASH" : "LOYIHA QO'SHISH"} description="O'z loyihangiz haqida ma'lumot kiriting." icon={<Briefcase className="w-7 h-7 text-blue-600" />}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Loyiha nomi *</label>
            <input value={projectForm.title} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} placeholder="masalan: E-commerce sayt" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Tavsif</label>
            <textarea value={projectForm.description} onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))} placeholder="Loyiha haqida qisqacha..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-medium text-sm resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Havola URL</label>
            <input type="url" value={projectForm.url} onChange={(e) => setProjectForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://github.com/..." className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Loyiha rasmi</label>
            <ImageUploader
              value={projectForm.imageUrl}
              onChange={(url) => setProjectForm((p) => ({ ...p, imageUrl: url }))}
              uploadUrl="/api/upload/image?folder=projects"
              maxSizeLabel="3 MB"
              previewHeight="h-36"
              shape="wide"
            />
          </div>
          <Button type="button" onClick={handleSaveProject} disabled={isSavingProject} className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest border-none">
            {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProject ? "Yangilash" : "Qo'shish"}
          </Button>
        </div>
      </PremiumModal>

      {/* ── Certificate Modal ─────────────────────────────────────────────────── */}
      <PremiumModal isOpen={showCertModal} onClose={() => setShowCertModal(false)} title={editingCert ? "SERTIFIKATNI TAHRIRLASH" : "SERTIFIKAT QO'SHISH"} description="Sertifikat ma'lumotlarini kiriting." icon={<Award className="w-7 h-7 text-amber-500" />}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Sertifikat nomi *</label>
            <input value={certForm.name} onChange={(e) => setCertForm((c) => ({ ...c, name: e.target.value }))} placeholder="masalan: AWS Certified Developer" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Beruvchi tashkilot</label>
            <input value={certForm.issuer} onChange={(e) => setCertForm((c) => ({ ...c, issuer: e.target.value }))} placeholder="masalan: Amazon Web Services" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Yil</label>
            <input type="number" value={certForm.year} onChange={(e) => setCertForm((c) => ({ ...c, year: e.target.value }))} placeholder="2024" min="1990" max="2099" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20 outline-none transition-all font-semibold text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Sertifikat rasmi</label>
            <ImageUploader
              value={certForm.imageUrl}
              onChange={(url) => setCertForm((c) => ({ ...c, imageUrl: url }))}
              uploadUrl="/api/upload/image?folder=certificates"
              maxSizeLabel="3 MB"
              previewHeight="h-32"
              shape="wide"
            />
          </div>
          <Button type="button" onClick={handleSaveCert} disabled={isSavingCert} className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest border-none">
            {isSavingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCert ? "Yangilash" : "Qo'shish"}
          </Button>
        </div>
      </PremiumModal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      <PremiumModal isOpen={showDeleteModal} onClose={() => { if (!isDeleting) setShowDeleteModal(false); }} title="HISOBNI O'CHIRISH" description="Hisobingizni butunlay o'chirishni xohlaysizmi? Barcha kurslaringiz va ma'lumotlaringiz yo'qoladi." icon={<Shield className="w-7 h-7 text-red-500" />}>
        <div className="space-y-3">
          <Button variant="destructive" type="button" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-0" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ha, hisobimni o'chirish"}
          </Button>
          <Button variant="ghost" type="button" className="w-full h-12 rounded-2xl font-black text-slate-500 hover:text-slate-900 text-xs uppercase tracking-widest" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Bekor qilish
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
