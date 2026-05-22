"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollError = searchParams.get("error") === "enroll";
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");

      if (redirectUrl && redirectUrl !== "/") {
        router.push(redirectUrl);
      } else {
        const dashboardMap: Record<string, string> = {
          ADMIN: "/admin",
          TEACHER: "/teacher",
          STUDENT: "/student",
        };
        router.push(dashboardMap[data.role] ?? "/");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl px-10 py-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">

      {/* Logo */}
      <div className="flex flex-col items-center gap-2">
        <img src="/logo.png" alt="Ai.Dargoh" className="h-10 object-contain" />
        <p className="text-slate-400 text-xs font-medium mt-0.5">Hisobingizga kiring</p>
      </div>

      {/* Enroll error banner */}
      {enrollError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Kursga yozilish uchun kirish kerak</p>
            <p className="text-xs text-red-500 font-medium mt-0.5">
              Hisobingizga kiring va kursga yozilishni davom ettiring.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600" htmlFor="email">
            Email manzili
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600" htmlFor="password">
            Parol
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          disabled={isLoading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          {isLoading ? "Kutilmoqda..." : "Tizimga kirish"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-400 font-medium">
          <span className="bg-white px-3">yoki</span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500">
        Akkountingiz yo&apos;qmi?{" "}
        <Link href="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">
          Ro&apos;yxatdan o&apos;ting
        </Link>
      </p>

      <p className="text-center">
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← Bosh sahifaga qaytish
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-end overflow-x-hidden relative"
      style={{
        backgroundImage: "url('/assets/fon.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* ── RIGHT: Form card ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 py-12 lg:mr-16 xl:mr-24"
        style={{ width: "560px", maxWidth: "90vw" }}
      >
        <Suspense fallback={
          <div className="w-full flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
