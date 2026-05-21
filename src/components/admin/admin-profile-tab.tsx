"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Users,
  BookOpen,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { AdminProfileResponse } from "@/types/profile";

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

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminProfileTab() {
  const router = useRouter();

  // Data
  const [profile, setProfile] = useState<AdminProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  // ── Fetch profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/profile")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data: AdminProfileResponse | null) => {
        if (data) setProfile(data);
        setIsLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");
    setIsChangingPw(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password changed successfully!");
      } else {
        toast.error(data.error ?? "Failed to change password.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsChangingPw(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 flex items-center justify-center">
        <p className="text-slate-400 font-medium">Failed to load profile.</p>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* ── Admin Identity Banner ────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-slate-700/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-md">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <User className="w-9 h-9 text-white/60" />
                )}
              </div>
            </div>

            {/* Name + badge + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black tracking-tight truncate">{profile.name}</h1>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 border border-white/25 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
                  <Mail className="w-3.5 h-3.5 opacity-70" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-slate-600" />}
            label="Total Users"
            value={profile.stats.totalUsers}
            color="bg-slate-100 border border-slate-200"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
            label="Approved Courses"
            value={profile.stats.approvedCourses}
            color="bg-emerald-50 border border-emerald-100"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            label="Pending Courses"
            value={profile.stats.pendingCourses}
            color="bg-amber-50 border border-amber-100"
          />
        </div>

        {/* ── Change Password Form ─────────────────────────────────────────── */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5"
        >
          <h2 className="text-base font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            Change Password
          </h2>

          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Current Password</label>
            <div className="relative">
              <input
                required
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">New Password</label>
            <div className="relative">
              <input
                required
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPwError("");
                }}
                placeholder="At least 8 characters"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Confirm New Password</label>
            <div className="relative">
              <input
                required
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPwError("");
                }}
                placeholder="Repeat new password"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 outline-none transition-all font-semibold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
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
            <Button
              type="submit"
              disabled={isChangingPw}
              className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest gap-2 border-none bg-slate-800 hover:bg-slate-900 text-white"
            >
              {isChangingPw ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Update Password
            </Button>
          </div>
        </form>

    </div>
  );
}
