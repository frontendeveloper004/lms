"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  User, Mail, Save, Loader2, Camera, Lock,
  Eye, EyeOff, AlertTriangle, Linkedin, Github,
  Globe, Send, Plus, X, BookOpen, Award, Target,
  MapPin, ImageIcon, Flame, Trophy,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type StudentProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  location: string | null;
  goal: string | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  xpPoints: number;
  createdAt: string;
  stats: {
    enrollmentCount: number;
    certificateCount: number;
    learningStreak: number;
    completedCount: number;
    activeCount: number;
  };
};

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentSettingsClient({
  initialProfile,
}: {
  initialProfile: StudentProfile;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile>(initialProfile);

  // Avatar modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Cover photo modal
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isCoverSaving, setIsCoverSaving] = useState(false);

  // Edit profile form
  const [name, setName] = useState(initialProfile.name ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [location, setLocation] = useState(initialProfile.location ?? "");
  const [goal, setGoal] = useState(initialProfile.goal ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedinUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(initialProfile.githubUrl ?? "");
  const [telegramUrl, setTelegramUrl] = useState(initialProfile.telegramUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile.websiteUrl ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Validation errors
  const [bioError, setBioError] = useState("");
  const [linkedinError, setLinkedinError] = useState("");
  const [githubError, setGithubError] = useState("");
  const [websiteError, setWebsiteError] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>(initialProfile.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveAvatar = (url: string) => {
    setProfile((prev) => ({ ...prev, avatar: url }));
    setShowAvatarModal(false);
  };

  // Called by ImageUploader after it uploads the file and returns the URL
  const handleCoverUploaded = async (url: string) => {
    setIsCoverSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: url || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({ ...prev, coverPhoto: url }));
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

  const validateSocialUrl = (url: string): string => {
    if (url && !url.startsWith("https://")) return "URL manzil https:// bilan boshlanishi kerak";
    return "";
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) { toast.error("Bu ko'nikma allaqachon qo'shilgan."); return; }
    if (skills.length >= 15) { toast.error("Maksimal 15 ta ko'nikma qo'shish mumkin."); return; }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (bio.length > 500) { setBioError("Bio 500 belgidan oshmasligi kerak."); hasError = true; } else { setBioError(""); }
    const liErr = validateSocialUrl(linkedinUrl);
    const ghErr = validateSocialUrl(githubUrl);
    const wsErr = validateSocialUrl(websiteUrl);
    setLinkedinError(liErr);
    setGithubError(ghErr);
    setWebsiteError(wsErr);
    if (liErr || ghErr || wsErr) hasError = true;
    if (hasError) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || undefined,
          location: location || undefined,
          goal: goal || undefined,
          linkedinUrl: linkedinUrl || undefined,
          githubUrl: githubUrl || undefined,
          telegramUrl: telegramUrl || undefined,
          websiteUrl: websiteUrl || undefined,
          skills,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({
          ...prev,
          name: data.name,
          bio: data.bio,
          location: data.location,
          goal: data.goal,
          linkedinUrl: data.linkedinUrl,
          githubUrl: data.githubUrl,
          telegramUrl: data.telegramUrl,
          websiteUrl: data.websiteUrl,
          skills: data.skills,
        }));
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setPwError("Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak."); return; }
    if (newPassword !== confirmPassword) { setPwError("Parollar mos kelmaydi."); return; }
    setPwError("");
    setIsChangingPw(true);
    try {
      const res = await fetch("/api/student/password", {
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/student/account", { method: "DELETE" });
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Profile Card ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-blue-500/20 min-h-[140px]">
          {/* Cover */}
          <div className="absolute inset-0">
            {profile.coverPhoto ? (
              <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700" />
            )}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Edit cover button */}
          <button
            type="button"
            onClick={() => setShowCoverModal(true)}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black/30 hover:bg-black/50 text-white px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
          >
            <ImageIcon className="w-3 h-3" /> Cover
          </button>

          {/* Profile info */}
          <div className="relative z-10 px-6 py-5 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center shadow-md">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <User className="w-9 h-9 text-white/70" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                  aria-label="Avatarni tahrirlash"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name + badge + social links */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black tracking-tight truncate">{profile.name}</h1>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 border border-white/30 px-2.5 py-1 rounded-full">
                    Talaba
                  </span>
                </div>
                <p className="text-white/70 text-xs font-medium mb-3">
                  {profile.location ?? <span className="italic opacity-60">Joylashuv ko'rsatilmagan</span>}
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
                  {profile.telegramUrl && (
                    <a
                      href={profile.telegramUrl.startsWith("http") ? profile.telegramUrl : `https://t.me/${profile.telegramUrl.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label="Telegram"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" aria-label="Sayt">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <span className="ml-auto text-xs font-black text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl">
                    {profile.xpPoints} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            label="Kurslar"
            value={profile.stats.enrollmentCount}
            color="bg-blue-50 border border-blue-100"
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-amber-600" />}
            label="Sertifikatlar"
            value={profile.stats.certificateCount}
            color="bg-amber-50 border border-amber-100"
          />
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-600" />}
            label="Streak (kun)"
            value={profile.stats.learningStreak}
            color="bg-orange-50 border border-orange-100"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-emerald-600" />}
            label="Tugatilgan"
            value={profile.stats.completedCount}
            color="bg-emerald-50 border border-emerald-100"
          />
        </div>

        {/* ── Edit Profile Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <User className="w-4 h-4" />
            </div>
            Profilni tahrirlash
          </h2>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">To'liq ism</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="To'liq ismingiz"
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
            />
          </div>

          {/* Email read-only */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Email</label>
            <div className="flex items-center gap-3 w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed overflow-hidden">
              <Mail className="w-4 h-4 shrink-0 opacity-50" />
              <span className="truncate text-sm font-medium">{profile.email}</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">* Email manzili o'zgartirilmaydi</p>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Joylashuv</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="masalan: Toshkent, O'zbekiston"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Maqsad</label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="masalan: Full-stack dasturchi bo'lish"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">O'zim haqimda</label>
              <span className={`text-xs font-bold ${bio.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                {bio.length} / 500
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => { setBio(e.target.value); if (e.target.value.length <= 500) setBioError(""); }}
              placeholder="O'zingiz haqingizda yozing..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-medium text-sm resize-none ${bioError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"}`}
            />
            {bioError && (
              <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {bioError}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Ko'nikmalar</label>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Ko'nikma qo'shing..."
                className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 transition-colors"
                      aria-label={`${skill} ni o'chirish`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500">Ijtimoiy tarmoqlar</label>

            {/* LinkedIn */}
            <div className="space-y-1">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => { setLinkedinUrl(e.target.value); setLinkedinError(""); }}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${linkedinError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"}`}
                />
              </div>
              {linkedinError && <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {linkedinError}</p>}
            </div>

            {/* GitHub */}
            <div className="space-y-1">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setGithubError(""); }}
                  placeholder="https://github.com/yourusername"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${githubError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"}`}
                />
              </div>
              {githubError && <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {githubError}</p>}
            </div>

            {/* Telegram */}
            <div className="relative">
              <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="@username yoki https://t.me/username"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
            </div>

            {/* Website */}
            <div className="space-y-1">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => { setWebsiteUrl(e.target.value); setWebsiteError(""); }}
                  placeholder="https://yourwebsite.com"
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-1 outline-none transition-all font-semibold text-sm ${websiteError ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"}`}
                />
              </div>
              {websiteError && <p className="text-xs text-red-500 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {websiteError}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
        </form>

        {/* ── Change Password ──────────────────────────────────────────────── */}
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
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Joriy parolingiz"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Yangi parol</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 8 ta belgi"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Parolni tasdiqlang</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yangi parolni qayta kiriting"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {pwError && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {pwError}
            </p>
          )}

          <button
            type="submit"
            disabled={isChangingPw}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-black text-sm transition-colors"
          >
            {isChangingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Parolni o'zgartirish
          </button>
        </form>

        {/* ── Danger Zone ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-red-600 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            Xavfli zona
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Hisobingizni o'chirsangiz, barcha ma'lumotlaringiz (kurslar, sertifikatlar, progress) butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-black text-sm transition-colors"
          >
            Hisobni o'chirish
          </button>
        </div>

      </div>

      {/* ── Avatar Modal ──────────────────────────────────────────────────── */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Avatar yuklash</h3>
              <button type="button" onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageUploader
              value={profile.avatar ?? ""}
              onChange={handleSaveAvatar}
              uploadUrl="/api/upload/avatar"
              maxSizeLabel="2 MB"
              shape="circle"
              previewHeight="h-32"
            />
          </div>
        </div>
      )}

      {/* ── Cover Modal ───────────────────────────────────────────────────── */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Cover rasm yuklash</h3>
              <button type="button" onClick={() => setShowCoverModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageUploader
              value={profile.coverPhoto ?? ""}
              onChange={handleCoverUploaded}
              uploadUrl="/api/upload/cover"
              maxSizeLabel="5 MB"
              shape="wide"
              previewHeight="h-40"
            />
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ──────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">Hisobni o'chirishni tasdiqlang</h3>
              <p className="text-sm text-slate-500 font-medium">
                Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlaringiz butunlay o'chiriladi.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
