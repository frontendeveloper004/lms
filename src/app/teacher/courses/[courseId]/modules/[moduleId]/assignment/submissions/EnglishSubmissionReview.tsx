"use client";

import React, { useState } from "react";
import {
  CheckCircle2, Star, MessageSquare, Zap, Save,
  Eye, BookOpen, Bot, UserCheck, RefreshCw, Info,
  ChevronDown, Clock, FileText, Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTaskTypeConfig, type TaskType } from "@/lib/task-types";

import AudioPlayer from "@/components/AudioPlayer";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  filesCode: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  xpBonus: number | null;
  submittedAt: string;
  gradedAt: string | null;
  gradedBy: string;
  aiScore: number | null;
  aiFeedback: string | null;
  aiGradedAt: string | null;
  aiConfidence: number | null;
  student: Student;
}

interface Assignment {
  id: string;
  title: string;
  rubric: string;
  taskType: string;
}

interface EnglishSubmissionReviewProps {
  sub: Submission;
  assignment: Assignment | null;
  isGraded: boolean;
  gradeScore: Record<string, string>;
  gradeFeedback: Record<string, string>;
  gradeXp: Record<string, string>;
  gradeError: Record<string, string>;
  gradeSuccess: Record<string, boolean>;
  isSaving: Record<string, boolean>;
  setGradeScore: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGradeFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setGradeXp: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onGrade: (sub: Submission) => void;
}

export default function EnglishSubmissionReview({
  sub, assignment, isGraded,
  gradeScore, gradeFeedback, gradeXp, gradeError, gradeSuccess, isSaving,
  setGradeScore, setGradeFeedback, setGradeXp, onGrade,
}: EnglishSubmissionReviewProps) {
  const [showRubric, setShowRubric] = useState(false);
  const isAIGraded = sub.gradedBy === "AI";
  const taskType = (assignment?.taskType as TaskType) ?? "ENGLISH_WRITING";
  const taskConfig = getTaskTypeConfig(taskType);
  const isAudioTask = taskType === "ENGLISH_SPEAKING" || (sub.htmlCode && sub.htmlCode.includes('/uploads/submissions/speaking/'));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sub-Header / Tool Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${taskConfig.bgColor} ${taskConfig.color} ${taskConfig.borderColor}`}>
            {taskConfig.icon}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Topshiriq turi</p>
            <p className="text-sm font-black text-slate-900 mt-0.5">{taskConfig.label}</p>
          </div>
        </div>

        <button
          onClick={() => setShowRubric(!showRubric)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            showRubric 
              ? "bg-amber-50 border-amber-200 text-amber-700 shadow-inner" 
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Mezonlar
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Essay Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* Rubric Overlay (Mobile/Toggle) */}
          {showRubric && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-4 h-4" /> Baholash mezonlari
                </p>
                <button onClick={() => setShowRubric(false)} className="text-amber-400 hover:text-amber-600">
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <pre className="text-sm text-amber-900 whitespace-pre-wrap font-sans leading-relaxed italic">
                {assignment?.rubric || "Mezonlar kiritilmagan."}
              </pre>
            </div>
          )}

          {/* AI Banner */}
          {isAIGraded && (
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5 text-violet-600" />
                <p className="text-xs font-black text-violet-700 uppercase tracking-widest">AI Baholash Natijasi</p>
                {sub.aiConfidence !== null && (
                  <span className={`ml-auto text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    (sub.aiConfidence ?? 0) >= 0.9 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    (sub.aiConfidence ?? 0) >= 0.7 ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    Ishonch: {Math.round((sub.aiConfidence ?? 0) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-start gap-4">
                 <div className="px-4 py-2 bg-white border border-violet-100 rounded-xl text-center shrink-0">
                    <p className="text-2xl font-black text-violet-700">{sub.aiScore}</p>
                    <p className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Ball</p>
                 </div>
                 <div className="flex-1">
                    <p className="text-sm text-violet-800 leading-relaxed font-medium italic">
                      "{sub.aiFeedback}"
                    </p>
                 </div>
              </div>
            </div>
          )}

          {/* Essay Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:p-8 relative overflow-hidden">
             <div className="relative">
                <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100/50">
                         <Clock className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Topshirilgan vaqt</p>
                         <p className="text-xs font-bold text-slate-700 mt-1">
                           {new Date(sub.submittedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                   </div>

                   {!isAudioTask && (
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                           <Type className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">So'zlar soni</p>
                           <p className="text-xs font-bold text-slate-900 mt-1">
                             {(sub.htmlCode || "").trim().split(/\s+/).filter(Boolean).length} ta so'z
                           </p>
                        </div>
                     </div>
                   )}
                </div>

                <div 
                  className="prose prose-slate max-w-none text-slate-800"
                  style={{ 
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {isAudioTask && sub.htmlCode ? (
                     <div className="my-8">
                       <AudioPlayer src={sub.htmlCode} />
                     </div>
                  ) : (
                     sub.htmlCode || <p className="text-slate-400 italic">Talaba javob yo'llamagun.</p>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Grading Panel */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-100 overflow-y-auto p-6 lg:p-8 shrink-0">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Baholash
            </h3>

            {gradeError[sub.id] && (
              <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold animate-in shake-200 duration-300">
                {gradeError[sub.id]}
              </div>
            )}
            {gradeSuccess[sub.id] && (
              <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle2 className="w-4 h-4" /> Muvaffaqiyatli saqlandi!
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ball (0–100)</label>
                  <input
                    type="number" min={0} max={100}
                    value={gradeScore[sub.id] ?? ""}
                    onChange={(e) => setGradeScore((p) => ({ ...p, [sub.id]: e.target.value }))}
                    className="w-full h-12 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all font-black text-lg"
                    placeholder="85"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">XP Bonus</label>
                  <input
                    type="number" min={100} max={1000} step={50}
                    value={gradeXp[sub.id] ?? ""}
                    onChange={(e) => setGradeXp((p) => ({ ...p, [sub.id]: e.target.value }))}
                    className="w-full h-12 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all font-black text-lg"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fikr-mulohaza (Feedback)</label>
                <textarea
                  rows={8}
                  value={gradeFeedback[sub.id] ?? ""}
                  onChange={(e) => setGradeFeedback((p) => ({ ...p, [sub.id]: e.target.value }))}
                  className="w-full px-5 py-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all font-medium text-sm resize-none leading-relaxed"
                  placeholder="Talabaning ishi haqida batafsil fikringizni bildiring..."
                />
              </div>

              <Button
                onClick={() => onGrade(sub)}
                disabled={isSaving[sub.id]}
                className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-0 shadow-lg transition-all active:scale-[0.98] ${
                  isSaving[sub.id] ? "opacity-70 cursor-not-allowed" :
                  isAIGraded
                    ? "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                }`}
              >
                {isSaving[sub.id] ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAIGraded ? (
                  <RefreshCw className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSaving[sub.id] ? "Saqlanmoqda..." : isAIGraded ? "AI Bahosini tasdiqlash / Yangilash" : isGraded ? "Natijani yangilash" : "Baholashni yakunlash"}
              </Button>
            </div>

            {isGraded && !isSaving[sub.id] && (
               <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100">
                     <UserCheck className="w-4 h-4 text-blue-600" />
                     <p className="text-[11px] font-bold text-blue-700">Oxirgi marta baholangan: {new Date(sub.gradedAt || "").toLocaleDateString()}</p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
