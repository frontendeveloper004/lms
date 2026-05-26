"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SkipForward, ArrowRight, ArrowLeft, Sparkles,
  CheckCircle2, ChevronRight, Globe, Cpu, Gamepad2,
  Shield, Brain, Server, Palette, BookOpen, Star,
  Zap, Trophy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/lib/onboarding-questions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Track {
  id: string;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
}

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  xpPoints: number;
  image: string | null;
  category: { name: string };
  teacher: { name: string; avatar: string | null };
  reason: string;
  type: "primary" | "secondary";
}

// ── Track config ──────────────────────────────────────────────────────────────

const TRACK_ICONS: Record<string, React.ElementType> = {
  WEB_DEV: Globe,
  MOBILE_DEV: Cpu,
  GAME_DEV: Gamepad2,
  CYBER_SECURITY: Shield,
  AI_ML: Brain,
  BACKEND: Server,
  UI_UX: Palette,
};

const TRACK_COLORS: Record<string, { iconBg: string; iconText: string; accent: string; badge: string }> = {
  WEB_DEV:        { iconBg: "bg-blue-100",   iconText: "text-blue-600",   accent: "border-blue-200 bg-blue-50",   badge: "bg-blue-100 text-blue-700" },
  MOBILE_DEV:     { iconBg: "bg-purple-100", iconText: "text-purple-600", accent: "border-purple-200 bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  GAME_DEV:       { iconBg: "bg-pink-100",   iconText: "text-pink-600",   accent: "border-pink-200 bg-pink-50",   badge: "bg-pink-100 text-pink-700" },
  CYBER_SECURITY: { iconBg: "bg-red-100",    iconText: "text-red-600",    accent: "border-red-200 bg-red-50",     badge: "bg-red-100 text-red-700" },
  AI_ML:          { iconBg: "bg-cyan-100",   iconText: "text-cyan-600",   accent: "border-cyan-200 bg-cyan-50",   badge: "bg-cyan-100 text-cyan-700" },
  BACKEND:        { iconBg: "bg-green-100",  iconText: "text-green-600",  accent: "border-green-200 bg-green-50", badge: "bg-green-100 text-green-700" },
  UI_UX:          { iconBg: "bg-orange-100", iconText: "text-orange-600", accent: "border-orange-200 bg-orange-50", badge: "bg-orange-100 text-orange-700" },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function OnboardingClient() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [track, setTrack] = useState<Track | null>(null);
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [personalMessage, setPersonalMessage] = useState("");

  const TOTAL = QUESTIONS.length;

  function selectOption(idx: number) {
    setSelected(idx);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    if (currentQ < TOTAL - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(newAnswers[currentQ + 1] >= 0 ? newAnswers[currentQ + 1] : null);
    } else {
      submitAnswers(newAnswers);
    }
  }

  function handleBack() {
    if (currentQ === 0) return;
    setCurrentQ(currentQ - 1);
    setSelected(answers[currentQ - 1] >= 0 ? answers[currentQ - 1] : null);
  }

  async function handleSkip() {
    setIsLoading(true);
    try {
      await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: Array(10).fill(0), skipped: true }),
      });
      router.push("/student");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function submitAnswers(finalAnswers: number[]) {
    setCurrentQ(10);
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers, skipped: false }),
      });
      const data = await res.json();
      setTrack(data.track ?? null);
      // Faqat eng mos 3 ta kurs
      const all: RecommendedCourse[] = data.courses ?? [];
      setCourses(all.slice(0, 3));
      setPersonalMessage(data.personalMessage ?? "");
      setCurrentQ(11);
    } catch {
      router.push("/student");
    } finally {
      setIsLoading(false);
    }
  }

  const question = currentQ < TOTAL ? QUESTIONS[currentQ] : null;
  const progress = currentQ < TOTAL ? (currentQ / TOTAL) * 100 : 100;
  const tc = track ? (TRACK_COLORS[track.id] ?? TRACK_COLORS.WEB_DEV) : TRACK_COLORS.WEB_DEV;
  const TrackIcon = track ? (TRACK_ICONS[track.id] ?? Globe) : Globe;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-800 text-sm tracking-tight">
            AI <span className="text-blue-600">Yo'naltiruvchi</span>
          </span>
        </div>
        {currentQ < TOTAL && (
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <SkipForward className="w-3.5 h-3.5" />
            O'tkazib yuborish
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      {currentQ < TOTAL && (
        <div className="px-6 pt-4 pb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">{currentQ + 1} / {TOTAL} savol</span>
            <span className="text-xs font-bold text-blue-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* ── Savol ── */}
            {currentQ < TOTAL && question && (
              <motion.div
                key={`q-${currentQ}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28, ease: "easeOut" as const }}
              >
                <div className="mb-7">
                  <div className="text-4xl mb-4">{question.emoji}</div>
                  <h2 className="text-xl font-black text-slate-900 leading-snug">{question.text}</h2>
                </div>

                <div className="space-y-3">
                  {question.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      onClick={() => selectOption(idx)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 group
                        ${selected === idx
                          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all
                          ${selected === idx
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                          }`}>
                          {["A", "B", "C"][idx]}
                        </div>
                        <span className={`text-sm font-semibold leading-snug transition-colors flex-1
                          ${selected === idx ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"}`}>
                          {opt.label}
                        </span>
                        {selected === idx && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 mt-8">
                  {currentQ > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-500 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={selected === null}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm shadow-blue-200 transition-all"
                  >
                    {currentQ === TOTAL - 1 ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Natijani ko'rish
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Keyingisi
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-6">
                  {Array.from({ length: TOTAL }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300
                        ${i === currentQ
                          ? "w-5 h-1.5 bg-blue-500"
                          : answers[i] >= 0
                          ? "w-1.5 h-1.5 bg-blue-300"
                          : "w-1.5 h-1.5 bg-slate-200"
                        }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Loading ── */}
            {currentQ === 10 && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-500 border-r-blue-300"
                  />
                  <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">AI tahlil qilmoqda...</h2>
                <p className="text-slate-500 text-sm">Javoblaringiz asosida sizga mos yo'nalish aniqlanmoqda</p>
                <div className="flex items-center justify-center gap-1.5 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      className="w-2 h-2 rounded-full bg-blue-400"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Natija ── */}
            {currentQ === 11 && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Track card */}
                {track && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 160 }}
                    className={`rounded-3xl border-2 ${tc.accent} p-6 mb-5 shadow-sm`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${tc.iconBg} flex items-center justify-center shrink-0`}>
                        <TrackIcon className={`w-7 h-7 ${tc.iconText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${tc.badge}`}>
                            Sizga mos yo'nalish
                          </span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-1.5">
                          {track.emoji} {track.name}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">{track.description}</p>
                      </div>
                    </div>

                    {track.strengths?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Star className="w-3 h-3" /> Kuchli tomonlaringiz
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {track.strengths.map((s, i) => (
                            <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-sm">
                              <Zap className="w-3 h-3 text-yellow-500" /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Personal message */}
                {personalMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 mb-5"
                  >
                    <p className="text-sm text-blue-700 leading-relaxed">💬 {personalMessage}</p>
                  </motion.div>
                )}

                {/* Eng mos 3 ta kurs */}
                {courses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="mb-5"
                  >
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" /> Eng mos kurslar
                    </p>
                    <div className="space-y-2.5">
                      {courses.map((course, idx) => (
                        <CourseCard key={course.id} course={course} rank={idx + 1} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {courses.length === 0 && (
                  <div className="text-center py-8 mb-5 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Hozircha mos kurslar topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">Platforma kurslar bilan boyitilgach paydo bo'ladi</p>
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => { router.push("/student"); router.refresh(); }}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm shadow-blue-200"
                  >
                    Dashboardga o'tish <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Link
                    href="/student/catalog"
                    className="w-full h-11 flex items-center justify-center rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    Barcha kurslarni ko'rish
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({ course, rank }: { course: RecommendedCourse; rank: number }) {
  const rankColors = [
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-slate-100 text-slate-600 border-slate-200",
    "bg-orange-100 text-orange-700 border-orange-200",
  ];
  const rankEmojis = ["🥇", "🥈", "🥉"];

  return (
    <Link
      href={`/courses/${course.id}`}
      className="block rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 group"
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base shrink-0 ${rankColors[rank - 1] ?? rankColors[2]}`}>
          {rankEmojis[rank - 1] ?? rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {course.category.name}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {LEVEL_LABELS[course.level] ?? course.level}
            </span>
            {course.price === 0 && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                Bepul
              </span>
            )}
          </div>
          <p className="font-bold text-sm text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
            {course.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{course.teacher.name}</p>
          {course.reason && (
            <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 leading-relaxed">
              💡 {course.reason}
            </p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
      </div>
    </Link>
  );
}
