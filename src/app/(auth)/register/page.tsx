"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, Lock, User, Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [subjectType, setSubjectType] = useState("PROGRAMMING");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, ...(role === "TEACHER" && { subjectType }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      // Role bo'yicha o'z paneliga yo'naltirish
      const dashboardMap: Record<string, string> = {
        ADMIN: "/admin",
        TEACHER: "/teacher",
        STUDENT: "/student",
      };
      router.push(dashboardMap[data.role] ?? "/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#eef2ff] flex flex-col lg:flex-row overflow-x-hidden">

      {/* ── LEFT: Illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 flex-col gap-8 sticky top-0 h-screen">
        <img
          src="/register.svg"
          alt="Register illustration"
          className="w-full max-w-md object-contain"
          width={500}
          height={500}
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Bugun boshlang, ertaga yetakchi bo'ling
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Bepul ro'yxatdan o'ting va 200+ kursga kirish imkoniga ega bo'ling
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-6 py-12 lg:py-8 relative overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="i.Dargoh" className="w-9 h-9 object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                i.<span className="text-green-600">Dargoh</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Yangi hisob yarating</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600" htmlFor="name">To'liq ismingiz</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="name" placeholder="Ism Sharif" type="text"
                  disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600" htmlFor="email">Email manzili</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email" placeholder="name@example.com" type="email"
                  disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600" htmlFor="password">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Platformadagi rolingiz</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRole("STUDENT")}
                  className={`h-11 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    role === "STUDENT"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}>
                  <GraduationCap className="w-4 h-4" /> Talaba
                </button>
                <button type="button" onClick={() => setRole("TEACHER")}
                  className={`h-11 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    role === "TEACHER"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}>
                  <BookOpen className="w-4 h-4" /> O'qituvchi
                </button>
              </div>
            </div>

            {/* Subject (Only for teacher) */}
            {role === "TEACHER" && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-xs font-bold text-slate-600">Qaysi fandan dars berasiz?</label>
                <div className="relative">
                  <select
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="PROGRAMMING">Dasturlash (IT)</option>
                    <option value="ENGLISH">Ingliz tili</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            <Button disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95">
              {isLoading ? "Kutilmoqda..." : "Hisob yaratish"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Akkountingiz bormi?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
              Tizimga kiring
            </Link>
          </p>

          <p className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Bosh sahifaga qaytish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
