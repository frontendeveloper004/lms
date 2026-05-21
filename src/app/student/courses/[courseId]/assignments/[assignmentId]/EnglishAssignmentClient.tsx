"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Lock, Clock, CheckCircle2,
  HelpCircle, Menu, Star, Zap, MessageSquare, Send, RefreshCw,
  X, ChevronDown, Bot, UserCheck, Info, ChevronRight, LayoutDashboard,
  FileText, Music, FileAudio, BookOpen, Headphones, PenTool, Type,
  ListChecks, CheckSquare, ChevronLeft, Languages, Clock as ClockIcon
} from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";
import AudioPlayer from "@/components/AudioPlayer";
import confetti from "canvas-confetti";

// ── Multi-Part Listening Types ──────────────────────────────────────────────
interface ListeningQuestion {
  id: string;
  type: "MCQ" | "TF" | "SHORT_ANSWER";
  text: string;
  options?: string[];
  correctAnswer: string | number;
  hint?: string;
}

interface ListeningPart {
  id: string;
  title: string;
  questions: ListeningQuestion[];
}

interface ListeningData {
  parts: ListeningPart[];
  transcript?: string | null;
}

export type SpeakingType = 
  | "PART1" 
  | "PART2" 
  | "PART3" 
  | "PRONUNCIATION" 
  | "READ_ALOUD" 
  | "PICTURE_DESCRIPTION" 
  | "DEBATE" 
  | "ROLE_PLAY";

export interface SpeakingData {
  type: SpeakingType;
  topic: string;
  description?: string;
  cueCard?: {
    topic: string;
    bulletPoints: string[];
  };
  audioUrl?: string; // sample audio from teacher
  imageUrl?: string;
  questions?: string[];
  preparationTime: number; // seconds
  speakingTime: number;    // seconds
}

export interface ReadingData {
  passage: string;
  vocabulary: { word: string; meaning: string }[];
  timeLimit: number;
  parts: ListeningPart[];
}

const ReadingAssignmentView = ({
  data,
  isSubmitted,
  isGraded,
  answers,
  setAnswers,
  submitError,
  submitSuccess,
  isSubmitting,
  isPollingAI,
  onSubmit
}: {
  data: ReadingData;
  isSubmitted: boolean;
  isGraded: boolean;
  answers: Record<string, string | number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  submitError: string | null;
  submitSuccess: boolean;
  isSubmitting: boolean;
  isPollingAI: boolean;
  onSubmit: () => void;
}) => {
   const [highlights, setHighlights] = useState<{ text: string; color: string }[]>([]);
   const [timeLeft, setTimeLeft] = useState(data.timeLimit * 60);
   const [currentPartIdx, setCurrentPartIdx] = useState(0);
   const [mobileTab, setMobileTab] = useState<"passage" | "questions">("passage");
   const [passageHtml, setPassageHtml] = useState(data.passage);
   const containerRef = useRef<HTMLDivElement>(null);

  // Timer Persistence Logic
  useEffect(() => {
    if (isSubmitted || isGraded) return;

    const storageKey = `reading_start_time_${data.parts[0]?.questions[0]?.id || 'default'}`;
    let startTime = localStorage.getItem(storageKey);
    
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(storageKey, startTime);
    }

    const startTimestamp = parseInt(startTime);
    const totalSeconds = data.timeLimit * 60;
    
    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        onSubmit();
        localStorage.removeItem(storageKey);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, isGraded, data.timeLimit, onSubmit]);

  // Highlighting Persistence Logic
  useEffect(() => {
    const key = `reading_passage_${data.parts[0]?.questions[0]?.id || 'default'}`;
    const savedHtml = localStorage.getItem(key);
    if (savedHtml) {
      setPassageHtml(savedHtml);
    } else {
      setPassageHtml(data.passage);
    }
  }, [data.passage, data.parts]);

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const container = containerRef.current;
    if (!container || !container.contains(selection.anchorNode)) return;

    try {
      const range = selection.getRangeAt(0);
      const mark = document.createElement('mark');
      mark.className = "bg-amber-200/80 cursor-pointer hover:bg-amber-300 transition-colors rounded-sm px-0.5";
      mark.title = "O'chirish uchun bosing";
      range.surroundContents(mark);
      
      const newHtml = container.innerHTML;
      setPassageHtml(newHtml);
      localStorage.setItem(`reading_passage_${data.parts[0]?.questions[0]?.id || 'default'}`, newHtml);
      selection.removeAllRanges();
    } catch (e) {
      // If selection is complex, fallback or ignore
      console.warn("Complex selection cannot be highlighted easily", e);
    }
  };

  const handlePassageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'MARK') {
      const mark = target;
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        
        // Find the top-level container to get the correct innerHTML
        const container = containerRef.current;
        if (container) {
          const newHtml = container.innerHTML;
          setPassageHtml(newHtml);
          localStorage.setItem(`reading_passage_${data.parts[0]?.questions[0]?.id || 'default'}`, newHtml);
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const totalParts = data.parts.length;
  const currentPart = data.parts[currentPartIdx];

  return (
    <div className="relative w-full flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-180px)] lg:min-h-[500px] mb-8">
      {/* Mobile Tab Switcher (Inside reading view) */}
      <div className="lg:hidden sticky top-0 z-[30] bg-white/80 backdrop-blur-md border-b border-slate-100 p-2 flex justify-center shrink-0">
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          <button 
            onClick={() => setMobileTab("passage")}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === "passage" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
          >
            Matn
          </button>
          <button 
            onClick={() => setMobileTab("questions")}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === "questions" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
          >
            Savollar
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Pane: Passage */}
        <div className={`flex-1 flex flex-col relative group ${mobileTab === "passage" ? "flex" : "hidden lg:flex"}`}>
          <div className="py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100/50">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Passage</h3>
            </div>
            <button
              onClick={handleHighlight}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <Star className="w-3.5 h-3.5" /> Highlighting
            </button>
          </div>

          <div 
            ref={containerRef}
            onClick={handlePassageClick}
            className="flex-1 overflow-y-auto custom-scrollbar-premium selection:bg-amber-200"
          >
            <div 
              className="rich-content-english prose prose-slate max-w-none prose-sm lg:prose-base !text-slate-700 font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: passageHtml }}
            />
          </div>
        </div>

        {/* Right Pane: Questions & Progress */}
        <div className={`w-full lg:w-[450px] flex flex-col gap-6 shrink-0 ${mobileTab === "questions" ? "flex" : "hidden lg:flex"}`}>
          {/* Timer Card */}
          {!isSubmitted && !isGraded && (
            <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white p-5 flex items-center justify-between overflow-hidden relative shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  timeLeft < 300 ? 'bg-rose-100 border-rose-200 text-rose-600 animate-pulse' : 'bg-blue-100 border-blue-200 text-blue-600'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Time Left</p>
                  <p className={`text-xl font-black tabular-nums tracking-tight ${timeLeft < 300 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center relative">
                <svg className="w-12 h-12 absolute -rotate-90">
                  <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" className={timeLeft < 300 ? 'text-rose-100' : 'text-blue-100'} />
                  <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={131.94} strokeDashoffset={131.94 * (1 - timeLeft / (data.timeLimit * 60))} className={timeLeft < 300 ? 'text-rose-500' : 'text-blue-500'} />
                </svg>
                <span className="text-[10px] font-bold text-slate-400">{Math.round((timeLeft / (data.timeLimit * 60)) * 100)}%</span>
              </div>
            </div>
          )}

          {/* Questions Area */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-6">
            {currentPart ? (
              <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Type className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">{currentPart.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentPart.questions.length} questions</p>
                  </div>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar-premium pr-2">
                  {currentPart.questions.map((q, qIdx) => (
                    <div key={q.id} className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 shrink-0">
                          {qIdx + 1}
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-snug">{q.text}</p>
                      </div>

                      {q.type === "MCQ" && (
                        <div className="grid grid-cols-1 gap-2 ml-9">
                          {q.options?.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              disabled={isGraded || isSubmitted}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                                answers[q.id] === oIdx ? "bg-indigo-50/50 border-indigo-500 shadow-sm" : "bg-white border-slate-50 hover:border-indigo-200"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                                answers[q.id] === oIdx ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-100 text-slate-400"
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <span className={`text-[12px] font-bold ${answers[q.id] === oIdx ? "text-indigo-700" : "text-slate-600"}`}>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === "TF" && (
                        <div className="flex flex-wrap gap-2 ml-9">
                          {["true", "false", "not_given"].map((val) => (
                            <button
                              key={val}
                              disabled={isGraded || isSubmitted}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                              className={`px-4 py-2 rounded-xl border-2 transition-all font-black text-[9px] uppercase tracking-widest ${
                                answers[q.id] === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-50 text-slate-400 hover:border-indigo-200"
                              }`}
                            >
                              {val.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === "SHORT_ANSWER" && (
                        <div className="ml-9">
                          <input
                            disabled={isGraded || isSubmitted}
                            value={(answers[q.id] as string) || ""}
                            onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Type your answer..."
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
                  <button onClick={() => setCurrentPartIdx(i => Math.max(0, i - 1))} disabled={currentPartIdx === 0}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-40"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalParts }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentPartIdx ? 'w-4 bg-indigo-600' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {currentPartIdx < totalParts - 1 ? (
                    <button onClick={() => setCurrentPartIdx(i => Math.min(totalParts - 1, i + 1))}
                      className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"><ChevronRight className="w-5 h-5" /></button>
                  ) : <div className="w-[46px]" />}
                </div>
              </div>
            ) : null}

            {/* Submit Action Block inside Questions Area */}
            {!isGraded && (
              <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0">
                {submitError && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 relative z-50">{submitError}</div>}
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting || isPollingAI || isSubmitted}
                  className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isPollingAI || isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isSubmitted ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {isPollingAI ? "Wait..." : isSubmitted ? "Submitted" : "Submit Reading Task"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeakingAssignmentView = ({
  data,
  isSubmitted,
  isGraded,
  onFinish,
  isSubmitting
}: {
  data: SpeakingData;
  isSubmitted: boolean;
  isGraded: boolean;
  onFinish: (audioBlob: Blob) => void;
  isSubmitting: boolean;
}) => {
  const [phase, setPhase] = useState<"IDLE" | "PREPARING" | "SPEAKING" | "FINISHED">("IDLE");
  const [timeLeft, setTimeLeft] = useState(data.preparationTime);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((phase === "PREPARING" || phase === "SPEAKING") && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (phase === "PREPARING") startSpeaking();
      else if (phase === "SPEAKING") stopSpeaking();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const startPreparing = () => {
    if (data.preparationTime > 0) {
      setPhase("PREPARING");
      setTimeLeft(data.preparationTime);
    } else {
      startSpeaking();
    }
  };

  const startSpeaking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const localAudioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          localAudioChunks.push(e.data);
          setAudioChunks(prev => [...prev, e.data]); // Keep state updated just in case
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(localAudioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };
      setRecorder(mediaRecorder);
      mediaRecorder.start();
      setPhase("SPEAKING");
      setTimeLeft(data.speakingTime);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Mikrofonga ruxsat berilmagan!");
    }
  };

  const stopSpeaking = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setPhase("FINISHED");
  };

  const handleFinish = () => {
    if (audioBlob) onFinish(audioBlob);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Task Header Information */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
             <Bot className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 leading-tight">{data.topic}</h4>
            <span className="inline-block mt-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest">
              {data.type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Content based on type */}
        <div className="space-y-6 pt-4 border-t border-slate-50">
          {data.imageUrl && (
            <img src={data.imageUrl} className="max-h-80 rounded-3xl mx-auto border border-slate-200 shadow-lg" alt="Task" />
          )}
          
          {data.type === "PART2" && data.cueCard && (
            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
              <p className="text-lg font-black text-slate-900 mb-4">{data.cueCard.topic}</p>
              <ul className="space-y-3">
                {data.cueCard.bulletPoints.map((bp, i) => bp && (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" /> {bp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(data.type === "READ_ALOUD" || data.type === "PRONUNCIATION") && data.description && (
            <div className="rich-content-english prose prose-slate max-w-none text-xl font-medium leading-relaxed bg-slate-50 p-8 rounded-[2rem]" 
                 dangerouslySetInnerHTML={{ __html: data.description }} />
          )}

          {(data.type === "PART1" || data.type === "PART3" || data.type === "DEBATE" || data.type === "ROLE_PLAY") && data.questions && (
            <div className="space-y-4">
               {data.questions.map((q, i) => (
                 <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm italic text-slate-700 font-medium">
                   <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                   {q}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Area: Timers & Controls */}
      {!isSubmitted && !isGraded && (
        <div className="bg-white rounded-[2.5rem] border-4 border-blue-50 p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          {/* Animated background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse" />
          
          {phase === "IDLE" && (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 mb-4">
                <Clock className="w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">Tayyor bo'lganingizda "Boshlash" tugmasini bosing. {data.preparationTime > 0 ? `${data.preparationTime} soniya tayyorgarlik vaqti bor.` : "Vaqt darhol boshlanadi."}</p>
              <Button onClick={startPreparing} className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-100">
                Topshiriqni boshlash
              </Button>
            </div>
          )}

          {(phase === "PREPARING" || phase === "SPEAKING") && (
            <div className="space-y-10 py-6">
               <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${phase === "PREPARING" ? "text-amber-400" : "text-rose-500"} transition-all duration-1000`} 
                            style={{ strokeDasharray: 553, strokeDashoffset: 553 - (553 * timeLeft) / (phase === "PREPARING" ? data.preparationTime : data.speakingTime) }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{timeLeft}s</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${phase === "PREPARING" ? "text-amber-500" : "text-rose-500 animate-pulse"}`}>
                      {phase === "PREPARING" ? "PREPARATION" : "SPEAKING..."}
                    </p>
                  </div>
               </div>

               {phase === "PREPARING" && (
                 <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto uppercase tracking-widest">Savollarni diqqat bilan ko'rib chiqing ва o'z javobingizni rejalashtiring.</p>
               )}
               
               {phase === "SPEAKING" && (
                 <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <Button onClick={stopSpeaking} variant="destructive" className="h-14 px-10 rounded-xl font-black text-xs uppercase tracking-widest">Yozishni to'xtatish</Button>
                 </div>
               )}
            </div>
          )}

          {phase === "FINISHED" && (
            <div className="space-y-8 py-6">
               <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-lg shadow-emerald-50">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                 <h5 className="text-lg font-black text-slate-900 uppercase tracking-widest">Yozib olindi!</h5>
                 <p className="text-xs font-bold text-slate-400">Javobingiz muvaffaqiyatli saqlandi. Endi uni baholash uchun yuborishingiz mumkin.</p>
               </div>
               {audioBlob && (
                 <div className="max-w-md mx-auto">
                    <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10" />
                 </div>
               )}
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button variant="ghost" onClick={() => setPhase("IDLE")} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Qayta yozish</Button>
                 <Button disabled={isSubmitting} onClick={handleFinish} className="h-14 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                   {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Topshiriqni yuborish</>}
                 </Button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type AssignmentStatus = "locked" | "unlocked" | "submitted" | "graded";

interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric: string;
  taskType: string;
  starterCode: string | null;
  attachmentUrl: string | null;
  allowResubmit: boolean;
  aiGradingEnabled: boolean;
}

interface Submission {
  id: string;
  htmlCode: string; // Used for English Essay/Answer text
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
  aiConfidence: number | null;
  aiBreakdown?: any; // JSON with criteria scores
}

interface CurriculumAssignment {
  type: "assignment";
  id: string;
  title: string;
  status: AssignmentStatus;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  orderIdx: number;
  lessons: any[];
  quizzes: any[];
  assignment: CurriculumAssignment | null;
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface EnglishAssignmentClientProps {
  courseId: string;
  assignmentId: string;
  course: Course;
  assignment: Assignment;
  submission: Submission | null;
  assignmentStatus: AssignmentStatus;
  onRefresh: () => void;
}

export default function EnglishAssignmentClient({
  courseId,
  assignmentId,
  course,
  assignment: initialAssignment,
  submission: initialSubmission,
  assignmentStatus,
  onRefresh
}: EnglishAssignmentClientProps) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(initialAssignment);
  const [submission, setSubmission] = useState(initialSubmission);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  // English state
  const [essay, setEssay] = useState(initialSubmission?.htmlCode || "");
  const [showTranscript, setShowTranscript] = useState(false);

  // Multi-part listening state
  const listeningData: ListeningData | null = useMemo(() => {
    if (assignment.taskType !== "ENGLISH_LISTENING") return null;
    const raw = assignment.starterCode;
    if (!raw) return null;
    
    if (typeof raw === "object" && (raw as any).parts) {
      return raw as ListeningData;
    }
    
    if (typeof raw === "string" && raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.parts ? parsed as ListeningData : null;
      } catch { return null; }
    }
    
    return null;
  }, [assignment]);

  const readingData: ReadingData | null = useMemo(() => {
    if (assignment.taskType !== "ENGLISH_READING") return null;
    const raw = assignment.starterCode;
    if (!raw) return null;
    
    if (typeof raw === "object" && (raw as any).passage) {
      return raw as ReadingData;
    }
    
    if (typeof raw === "string" && raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.passage ? parsed as ReadingData : null;
      } catch { return null; }
    }
    
    return null;
  }, [assignment]);

  const isMultiPart = !!listeningData || !!readingData;
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  // answers: { [questionId]: string | number }
  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    if (initialSubmission?.filesCode) {
      try { return JSON.parse(initialSubmission.filesCode); } catch { return {}; }
    }
    return {};
  });

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // AI Polling state
  const [isPollingAI, setIsPollingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [nextItemUrl, setNextItemUrl] = useState<string | null>(null);
  const [celebrationData, setCelebrationData] = useState<{ certificateId: string } | null>(null);
  const [pendingCelebration, setPendingCelebration] = useState<string | null>(null);

  // Curriculum logic for Previous / Next buttons
  const allItems = React.useMemo(() => {
    return course?.modules
      ?.slice()
      .sort((a: any, b: any) => a.orderIdx - b.orderIdx)
      .flatMap((m: any) => {
        const lessons = (m.lessons || []).slice().sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((l: any) => ({ type: "lesson" as const, id: l.id, data: l }));
        const quizzes = (m.quizzes || []).slice().sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((q: any) => ({ type: "quiz" as const, id: q.id, data: q }));
        const assignmentItems = m.assignment ? [{ type: "assignment" as const, id: m.assignment.id, data: m.assignment }] : [];
        return [...lessons, ...quizzes, ...assignmentItems];
      }) || [];
  }, [course]);

  const currentIdx = allItems.findIndex((i: any) => i.type === "assignment" && i.id === assignmentId);
  const prevItem = currentIdx > 0 ? allItems[currentIdx - 1] : null;
  const nextItem = currentIdx >= 0 && currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null;

  const getUrl = (item: any) => {
    if (!item) return null;
    if (item.type === "lesson") return `/student/courses/${courseId}/lessons/${item.id}`;
    if (item.type === "quiz") return `/student/courses/${courseId}/quizzes/${item.id}`;
    if (item.type === "assignment") return `/student/courses/${courseId}/assignments/${item.id}`;
    return null;
  };
  
  const prevItemUrl = getUrl(prevItem);
  const calculatedNextItemUrl = getUrl(nextItem);

  const showLockedToast = (msg: string) => {
    setLockedToast(msg);
    setTimeout(() => setLockedToast(null), 2500);
  };

  useEffect(() => {
    setAssignment(initialAssignment);
    setSubmission(initialSubmission);
    setEssay(initialSubmission?.htmlCode || "");
  }, [initialAssignment, initialSubmission]);

  // AI Polling Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPollingAI) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.submission?.status === "GRADED" && data.submission?.gradedBy === "AI") {
              setSubmission(data.submission);
              setIsPollingAI(false);
              setSubmitSuccess(false);

              // Refetch curriculum to check if course is newly completed
              const curRes = await fetch(`/api/student/courses/${courseId}/curriculum`);
              if (curRes.ok) {
                const curData = await curRes.json();
                if (curData.earnedCertificateId) {
                  setPendingCelebration(curData.earnedCertificateId);
                }
              }
              setShowAIModal(true);
              onRefresh();
            }
          }
        } catch (err) {
          console.error("AI polling error", err);
        }
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isPollingAI, courseId, assignmentId, onRefresh]);

  const handleSubmit = async () => {
    // For multi-part assignments, check that all questions are answered
    if (isMultiPart) {
      const currentData = listeningData || readingData;
      if (currentData) {
        const allQuestions = currentData.parts.flatMap(p => p.questions);
        const unanswered = allQuestions.filter(q => {
          const ans = answers[q.id];
          return ans === undefined || ans === "";
        });
        if (unanswered.length > 0) {
          setSubmitError(`Barcha savollarga javob bering (${unanswered.length} ta javob qoldi)`);
          return;
        }
      }
    } else if (!essay.trim()) {
      setSubmitError("Javob bo'sh bo'lishi mumkin emas");
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `/api/student/courses/${courseId}/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isMultiPart
              ? { htmlCode: readingData ? "[multi-part-reading]" : "[multi-part-listening]", filesCode: JSON.stringify(answers), isMultiPart: true }
              : { htmlCode: essay }
          ),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Xatolik yuz berdi");
        alert(data.error || "Xatolik yuz berdi");
        return;
      }

      const updatedSubmission = await res.json();
      setSubmission(updatedSubmission);
      setSubmitSuccess(true);
      onRefresh();

      // Get updated curriculum to check course completion newly
      const updatedRes = await fetch(`/api/student/courses/${courseId}/curriculum`);
      if (updatedRes.ok) {
        const updatedCourse = await updatedRes.json();

        if (assignment?.aiGradingEnabled && assignment?.taskType !== "ENGLISH_LISTENING" && updatedSubmission.status !== "GRADED") {
          setNextItemUrl(calculatedNextItemUrl || "/student");
          setIsPollingAI(true);
        } else {
          if (updatedCourse.earnedCertificateId) {
            setCelebrationData({ certificateId: updatedCourse.earnedCertificateId });
            const end = Date.now() + 2500;
            const frame = () => {
              confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
              confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'] });
              if (Date.now() < end) requestAnimationFrame(frame);
            };
            frame();
          } else {
            setTimeout(() => {
              router.push(calculatedNextItemUrl || "/student");
            }, 1000);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError("Tarmoq xatosi yoki serverda muammo: " + err.message);
      alert("Xatolik: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => {
    if (!course) return null;
    const activeModuleId = course.modules.find((m) => m.assignment?.id === assignmentId)?.id;
    const [openModuleId, setOpenModuleId] = React.useState<string | null>(activeModuleId ?? null);

    return (
      <div className={`flex flex-col h-full bg-white ${mobile ? "" : "border-r border-slate-100"}`}>
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{course.title}</h2>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {course.modules?.sort((a, b) => a.orderIdx - b.orderIdx).map((mod) => {
            const isOpen = openModuleId === mod.id;
            const hasActive = mod.assignment?.id === assignmentId;
            return (
              <div key={mod.id} className="mb-2">
                <button onClick={() => setOpenModuleId(isOpen ? null : mod.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${hasActive ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{mod.orderIdx}-MODUL</p>
                    <p className={`text-xs font-black ${hasActive ? "text-indigo-700" : "text-slate-700"}`}>{mod.title}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-1">
                    {mod.lessons?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((lesson: any) => {
                      const isLocked = lesson.isLocked;
                      return (
                        <button key={lesson.id} onClick={() => { if (isLocked) { showLockedToast("Avval oldingi darsni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/lessons/${lesson.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 group"}`}>
                          <div className="shrink-0">{isLocked ? <Lock className="w-4 h-4 text-slate-400" /> : lesson.isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-indigo-400" />}</div>
                          <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900">{lesson.title}</span>
                        </button>
                      );
                    })}
                    {mod.quizzes?.sort((a: any, b: any) => a.orderIdx - b.orderIdx).map((quiz: any) => {
                       const isLocked = quiz.isLocked;
                       return (
                         <button key={quiz.id} onClick={() => { if (isLocked) { showLockedToast("Avval barcha darslarni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/quizzes/${quiz.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 group"}`}>
                            {isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" /> : quiz.isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-500" />}
                            <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900">Test: {quiz.title}</span>
                         </button>
                       );
                    })}
                    {mod.assignment && (
                      <button onClick={() => { if (mod.assignment!.isLocked) { showLockedToast("Avval testni tugatish kerak"); return; } setSidebarOpen(false); router.push(`/student/courses/${courseId}/assignments/${mod.assignment!.id}`); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left ${mod.assignment.isLocked ? "opacity-50 cursor-not-allowed" : mod.assignment.id === assignmentId ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "hover:bg-slate-50 group"}`}>
                        {mod.assignment.isLocked ? <Lock className="w-4 h-4 shrink-0 text-slate-400" /> : mod.assignment.status === "graded" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : mod.assignment.status === "submitted" ? <Clock className="w-4 h-4 shrink-0 text-amber-500" /> : <PenTool className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-400" />}
                        <span className={`text-[12px] font-bold ${mod.assignment.id === assignmentId ? "text-white" : "text-slate-600 group-hover:text-slate-900"}`}>Topshiriq: {mod.assignment.title}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isGraded = assignmentStatus === "graded" || submission?.status === "GRADED";
  const isSubmitted = assignmentStatus === "submitted" || submission?.status === "PENDING";
  
  // Icon based on English task type
  const getTaskIcon = () => {
    const type = assignment.taskType;
    if (type.includes("READING")) return <BookOpen className="w-5 h-5 text-indigo-600" />;
    if (type.includes("LISTENING")) return <Headphones className="w-5 h-5 text-teal-600" />;
    if (type.includes("WRITING")) return <PenTool className="w-5 h-5 text-amber-600" />;
    if (type.includes("SPEAKING")) return <MessageSquare className="w-5 h-5 text-blue-600" />;
    return <Type className="w-5 h-5 text-indigo-600" />;
  };

  const speakingData: SpeakingData | null = useMemo(() => {
    if (assignment.taskType !== "ENGLISH_SPEAKING") return null;
    const raw = assignment.starterCode;
    if (!raw) return null;
    try {
      if (typeof raw === "string") return JSON.parse(raw);
      return raw as any;
    } catch { return null; }
  }, [assignment]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <aside className="hidden lg:flex w-80 flex-col shrink-0 h-full overflow-hidden">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-80 lg:hidden shadow-2xl animate-in slide-in-from-right-2 duration-200">
            <Sidebar mobile />
          </div>
        </>
      )}

      {lockedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          {lockedToast}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 min-w-0">
             <button onClick={() => router.push("/student")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shrink-0">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="min-w-0">
                <div className="flex items-center gap-2 mt-0.5">
                   {getTaskIcon()}
                   <h1 className="text-sm font-black text-slate-900 truncate tracking-tight">{assignment.title}</h1>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             {isGraded && submission?.score !== null && (
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-black border border-emerald-100 text-xs shadow-sm">
                 <Star className="w-4 h-4" /> {submission?.score}/100 ball
               </div>
             )}
             {isSubmitted && !isGraded && (
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-black border border-amber-100 text-xs">
                 <Clock className="w-4 h-4" /> Tekshirilmoqda
               </div>
             )}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
               {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
           <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
              
              {/* Task Content: Reading / Writing / Listening */}
                <div className="space-y-6">
                  {/* Content Passage / Prompt (Now for Writing tasks specially, Reading handled by its view) */}
                  {assignment.taskType === "ENGLISH_WRITING" && assignment.starterCode && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <PenTool className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Mavzu (Writing Prompt)</h3>
                        </div>
                        <div className="rich-content-english prose prose-slate max-w-none prose-sm lg:prose-base !text-slate-700 font-medium leading-relaxed bg-slate-50/50 p-8 rounded-[2rem] border border-slate-50" 
                             dangerouslySetInnerHTML={{ __html: (() => {
                               if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
                                 return (assignment.starterCode as any).prompt || (assignment.starterCode as any).transcript || "";
                               }
                               return assignment.starterCode || "";
                             })() }} />
                      </div>
                    </div>
                  )}

                  {/* Speaking Section */}
                  {assignment.taskType === "ENGLISH_SPEAKING" && speakingData && (
                    <SpeakingAssignmentView 
                      data={speakingData}
                      isSubmitted={isSubmitted}
                      isGraded={isGraded}
                      isSubmitting={isSubmitting}
                      onFinish={async (blob) => {
                        const formData = new FormData();
                        formData.append("file", blob, "speaking-answer.webm");
                        formData.append("courseId", courseId);
                        
                        try {
                          setIsSubmitting(true);
                          setSubmitError(null);
                          // 1. Upload audio
                          const uploadRes = await fetch("/api/student/upload/assignment-speaking", {
                            method: "POST",
                            body: formData,
                          });
                          if (!uploadRes.ok) throw new Error("Audio yuklashda xatolik");
                          const { url } = await uploadRes.json();
                          
                          // 2. Submit assignment with audio URL
                          const submitRes = await fetch(
                            `/api/student/courses/${courseId}/assignments/${assignmentId}/submit`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ htmlCode: url, isSpeaking: true }), // Reuse htmlCode to store the audio URL
                            }
                          );
                          if (!submitRes.ok) throw new Error("Yuborishda xatolik");
                          
                          const updatedSubmission = await submitRes.json();
                          setSubmission(updatedSubmission);
                          setSubmitSuccess(true);
                          setIsPollingAI(true); // Always poll AI for speaking
                          onRefresh();
                        } catch (err: any) {
                          setSubmitError(err.message);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                    />
                  )}

                  {/* Reading View */}
                  {readingData && (
                    <ReadingAssignmentView
                      data={readingData}
                      isSubmitted={isSubmitted}
                      isGraded={isGraded}
                      answers={answers}
                      setAnswers={setAnswers}
                      submitError={submitError}
                      submitSuccess={submitSuccess}
                      isSubmitting={isSubmitting}
                      isPollingAI={isPollingAI}
                      onSubmit={handleSubmit}
                    />
                  )}

                  {/* Listening Section */}
                  {!readingData && assignment.taskType === "ENGLISH_LISTENING" && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10 space-y-6 lg:space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100">
                          <Headphones className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="text-xs font-black text-teal-600 uppercase tracking-[0.2em]">Listening Material</h3>
                      </div>

                      {/* Audio Player (always visible) */}
                      <div className="bg-slate-50/80 rounded-[2rem] border border-slate-100 p-4 sm:p-6">
                        {assignment.attachmentUrl ? (
                          <AudioPlayer src={assignment.attachmentUrl} />
                        ) : (
                          <div className="p-6 lg:p-8 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                            <Music className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-400">Audio material biriktirilmagan</p>
                          </div>
                        )}
                      </div>

                      {/* Multi-Part Transcript File */}
                      {isMultiPart && listeningData && listeningData.transcript && typeof listeningData.transcript === "string" && listeningData.transcript.startsWith("/uploads/") && (
                        <div className="space-y-3">
                           <a href={listeningData.transcript} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-300 transition-all group">
                             <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                               <FileText className="w-5 h-5" />
                             </div>
                             <div className="text-left">
                               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Transcript Fayli</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Faylni yuklab olish / Ko'rish</p>
                             </div>
                           </a>
                        </div>
                      )}

                      {/* Transcript toggle (for non-multi-part) */}
                      {!isMultiPart && assignment.starterCode && typeof assignment.starterCode === "string" && !assignment.starterCode.startsWith("{") && (
                        <div className="space-y-3">
                          {assignment.starterCode.startsWith("/uploads/") ? (
                            <a href={assignment.starterCode} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-300 transition-all group">
                              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Transcript PDF</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Faylni yuklab olish</p>
                              </div>
                            </a>
                          ) : (
                            <>
                              <button onClick={() => setShowTranscript(!showTranscript)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ showTranscript ? "bg-teal-100 text-teal-700" : "bg-white border border-slate-200 text-slate-500 hover:border-teal-300" }`}>
                                <FileAudio className="w-4 h-4" /> {showTranscript ? "Transkriptni yashirish" : "Transkriptni ko'rsatish"}
                              </button>
                              {showTranscript && <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-600 text-sm leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: assignment.starterCode }} />}
                            </>
                          )}
                        </div>
                      )}

                      {/* ── Multi-Part Stepped Questions ── */}
                      {isMultiPart && listeningData && (() => {
                        const part = listeningData.parts[currentPartIdx];
                        if (!part) return null;
                        const totalParts = listeningData.parts.length;
                        const answeredInPart = part.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== "").length;

                        return (
                          <div className="space-y-6">
                            {/* Part Header / Progress */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {listeningData.parts.map((p, i) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setCurrentPartIdx(i)}
                                    disabled={isGraded || isSubmitted}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                      i === currentPartIdx
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                        : listeningData.parts[i].questions.every(q => answers[q.id] !== undefined && answers[q.id] !== "")
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                          : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300"
                                    }`}
                                  >
                                    {listeningData.parts[i].questions.every(q => answers[q.id] !== undefined && answers[q.id] !== "") && i !== currentPartIdx ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : null}
                                    {i + 1}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{answeredInPart}/{part.questions.length} javob</p>
                            </div>

                            {/* Part title */}
                            <div className="px-6 py-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Section {currentPartIdx + 1} of {totalParts}</p>
                              <h4 className="font-black text-indigo-900 text-base">{part.title}</h4>
                            </div>

                            {/* Questions */}
                            <div className="space-y-5">
                              {part.questions.map((q, qIdx) => (
                                <div key={q.id} className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-100 relative">
                                  <div className="absolute -left-2 top-5 sm:-left-3 sm:top-6 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-200">{qIdx + 1}</div>
                                  <div className="flex items-center gap-2 pl-3 sm:pl-0">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                      q.type === "MCQ" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                      q.type === "TF" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    }`}>{q.type === "MCQ" ? "Multiple Choice" : q.type === "TF" ? "True / False" : "Short Answer"}</span>
                                    {isGraded && (
                                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                        String(answers[q.id]) === String(q.correctAnswer)
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-rose-50 text-rose-600 border-rose-100"
                                      }`}>
                                        {String(answers[q.id]) === String(q.correctAnswer) ? "✓ To'g'ri" : "✗ Noto'g'ri"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{q.text}</p>

                                  {/* MCQ */}
                                  {q.type === "MCQ" && (
                                    <div className="space-y-2">
                                      {q.options?.map((opt, oIdx) => (
                                        <button
                                          key={oIdx}
                                          disabled={isGraded || isSubmitted}
                                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all border-2 ${
                                            answers[q.id] === oIdx
                                              ? isGraded
                                                ? oIdx === q.correctAnswer
                                                  ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                                  : "bg-rose-50 border-rose-400 text-rose-800"
                                                : "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                              : isGraded && oIdx === q.correctAnswer
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                                          }`}
                                        >
                                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 border-current">{String.fromCharCode(65 + oIdx)}</span>
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* True / False */}
                                  {q.type === "TF" && (
                                    <div className="flex gap-4">
                                      {["true", "false"].map(val => (
                                        <button
                                          key={val}
                                          disabled={isGraded || isSubmitted}
                                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                                          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest border-2 transition-all ${
                                            answers[q.id] === val
                                              ? isGraded
                                                ? val === String(q.correctAnswer)
                                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                                  : "bg-rose-500 border-rose-500 text-white"
                                                : "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                                              : isGraded && val === String(q.correctAnswer)
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                                          }`}
                                        >
                                          {val === "true" ? "True ✓" : "False ✗"}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* Short Answer */}
                                  {q.type === "SHORT_ANSWER" && (
                                    <div className="space-y-2">
                                      {q.hint && (
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                          <Info className="w-3 h-3" /> {q.hint}
                                        </p>
                                      )}
                                      <input
                                        disabled={isGraded || isSubmitted}
                                        value={(answers[q.id] as string) || ""}
                                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Javobingizni kiriting..."
                                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                                      />
                                      {isGraded && (
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                          To'g'ri javob: {q.correctAnswer}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Part Navigation */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <button
                                onClick={() => setCurrentPartIdx(i => Math.max(0, i - 1))}
                                disabled={currentPartIdx === 0}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:border-indigo-300 transition-all disabled:opacity-40"
                              >
                                <ChevronLeft className="w-4 h-4" /> Oldingi
                              </button>
                              {currentPartIdx < totalParts - 1 ? (
                                <button
                                  onClick={() => setCurrentPartIdx(i => Math.min(totalParts - 1, i + 1))}
                                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                  Keyingi <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Barcha qismlar tayyor
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Instructions Card (Hide for Writing tasks as per user request) */}
                  {assignment.taskType !== "ENGLISH_WRITING" && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Info className="w-5 h-5 text-indigo-600" />
                         </div>
                         <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Topshiriq ko'rsatmalari (Instructions)</h3>
                      </div>
                      <div className="rich-content-english prose prose-slate max-w-none prose-sm lg:prose-base !text-slate-700 font-medium leading-relaxed" 
                           dangerouslySetInnerHTML={{ __html: assignment.description }} />
                    </div>
                  )}

              {/* Your Answer Section Area — only show essay area for Writing and Reading tasks */}
              {!isMultiPart && (assignment.taskType === "ENGLISH_WRITING" || assignment.taskType === "ENGLISH_READING") && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Sizning javobingiz</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Essay yoki topshiriq javobini shu yerga yozing</p>
                    </div>
                    {!isGraded && (
                       <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100 uppercase tracking-widest transition-all">
                          {essay.split(/\s+/).filter(Boolean).length} so'z
                       </div>
                    )}
                 </div>

                 <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    readOnly={isGraded}
                    placeholder="Javobingizni shu yerga yozing..."
                    className="w-full min-h-[300px] lg:min-h-[400px] p-6 lg:p-10 rounded-[2rem] bg-slate-50 border border-slate-100 text-slate-800 text-sm lg:text-base leading-relaxed font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all resize-none"
                 />

                 {!isGraded && (
                   <div className="pt-4 space-y-4">
                      {submitError && <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2"><Info className="w-4 h-4" /> {submitError}</div>}
                      {submitSuccess && <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Muaffaqiyatli yuborildi!</div>}
                      
                      {isSubmitted && !assignment.allowResubmit ? (
                         <div className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 text-center text-xs font-black uppercase tracking-[0.2em] border border-slate-200">
                             <Lock className="w-4 h-4 inline mr-2" /> Qayta topshirish mumkin emas
                         </div>
                      ) : (
                         <Button onClick={handleSubmit} disabled={isSubmitting || isPollingAI} className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:hover:scale-100">
                             {isPollingAI ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : isSubmitted ? <RefreshCw className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-3" />}
                             {isPollingAI ? "AI tekshirmoqda..." : isSubmitting ? "Yuborilmoqda..." : isSubmitted ? "Qayta topshirish" : "Topshiriqni topshirish"}
                         </Button>
                      )}
                   </div>
                 )}
              </div>
              )}

              {/* Submit button for multi-part listening */}
              {isMultiPart && !isGraded && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6 lg:p-8 space-y-4">
                {submitError && <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2"><Info className="w-4 h-4" /> {submitError}</div>}
                {submitSuccess && <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Muaffaqiyatli yuborildi!</div>}
                {isSubmitted && !assignment.allowResubmit ? (
                  <div className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 text-center text-xs font-black uppercase tracking-[0.2em] border border-slate-200">
                    <Lock className="w-4 h-4 inline mr-2" /> Qayta topshirish mumkin emas
                  </div>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting || isPollingAI} className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70">
                    {isPollingAI ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : isSubmitted ? <RefreshCw className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-3" />}
                    {isPollingAI ? "AI tekshirmoqda..." : isSubmitting ? "Yuborilmoqda..." : isSubmitted ? "Qayta topshirish" : "Topshiriqni topshirish"}
                  </Button>
                )}
              </div>
              )}

                  {/* Rubric Block - Hide for Reading as it's usually inside or redundant */}
                  {true && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="p-8 lg:p-12 space-y-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.5rem] bg-amber-50 flex items-center justify-center border border-amber-100">
                            <Star className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Baholash mezonlari (Scoring Rubric)</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nimalarga e'tibor beriladi</p>
                          </div>
                        </div>
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans font-medium bg-slate-50/50 p-8 rounded-3xl border border-slate-100/50 leading-relaxed italic">
                          {assignment.rubric}
                        </pre>
                      </div>
                    </div>
                  )}

               {/* Previous Score Feedack (If graded but on main page) */}
               {isGraded && submission && (
                  <div className="bg-white rounded-[2.5rem] border-2 border-indigo-100 p-6 sm:p-8 lg:p-10 shadow-2xl shadow-indigo-50 space-y-8 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />
                     
                     <div className="flex items-center gap-3 relative">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Baholash natijasi</h3>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative">
                        <div className="bg-indigo-50/50 rounded-[2rem] p-6 text-center border border-indigo-50">
                           <p className="text-3xl lg:text-4xl font-black text-indigo-900 mb-1">{submission.score}</p>
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">/ 100 Ball</p>
                        </div>
                        <div className="bg-emerald-50/50 rounded-[2rem] p-6 text-center border border-emerald-50">
                           <p className="text-3xl lg:text-4xl font-black text-emerald-600 mb-1">+{submission.xpBonus}</p>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">XP Bonus</p>
                        </div>
                     </div>

                     {submission.feedback && (
                        <div className="bg-slate-50 rounded-3xl p-6 lg:p-8 border border-slate-100 relative">
                           <p className="italic font-medium leading-relaxed text-slate-700 text-sm lg:text-base">"{submission.feedback}"</p>
                           <p className="not-italic mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                              <span className="w-4 h-[2px] bg-slate-300 rounded-full" />
                              {submission.gradedBy === "AI" ? "AI Mentor" : "O'qituvchi yoxud Avto-Tizim"}
                           </p>
                           {submission.aiBreakdown && assignment.taskType === "ENGLISH_WRITING" && (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                               {(typeof submission.aiBreakdown === "string" ? JSON.parse(submission.aiBreakdown) : submission.aiBreakdown).map((item: any, i: number) => (
                                 <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2">
                                   <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.criterion}</span>
                                     <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${item.score >= 80 ? 'bg-emerald-50 text-emerald-600' : item.score >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                       {item.score}
                                     </span>
                                   </div>
                                   <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{item.explanation}</p>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                     )}
                  </div>
               )}

               {/* Bottom Navigation Buttons */}
               {true ? (
                <div className="flex items-center justify-between pt-8 pb-12 mt-auto text-slate-400">
                  <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    disabled={!prevItem}
                    onClick={() => prevItemUrl && router.push(prevItemUrl)}>
                    <ChevronLeft className="w-4 h-4" /> Oldingi
                  </Button>

                  <Button variant="outline" className="h-10 px-5 rounded-xl gap-2 font-bold text-sm bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800"
                    disabled={!nextItem}
                    onClick={() => {
                      if (!nextItem) return;
                      if (nextItem.data?.isLocked) { showLockedToast("Avval topshiriqni yakunlang"); return; }
                      if (calculatedNextItemUrl) router.push(calculatedNextItemUrl);
                    }}>
                    {nextItem?.type === 'quiz' ? "Testga o'tish" : nextItem?.type === 'assignment' ? "Topshiriqqa o'tish" : 'Keyingi dars'} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
               ) : (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-[70] shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2 font-bold text-sm bg-white border-slate-200 text-slate-600"
                      disabled={!prevItem}
                      onClick={() => prevItemUrl && router.push(prevItemUrl)}>
                      <ChevronLeft className="w-4 h-4" /> Oldingi
                    </Button>
                    <Button className="flex-1 h-12 rounded-xl gap-2 font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                      disabled={!nextItem}
                      onClick={() => {
                        if (!nextItem) return;
                        if (nextItem.data?.isLocked) { showLockedToast("Avval topshiriqni yakunlang"); return; }
                        if (calculatedNextItemUrl) router.push(calculatedNextItemUrl);
                      }}>
                      {nextItem?.type === 'quiz' ? "Testga o'tish" : nextItem?.type === 'assignment' ? "Topshiriqqa o'tish" : 'Keyingi dars'} <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
               )}

            </div>
          </div>
         </main>
      </div>

      {/* AI Modal (Same premium look) */}
      <PremiumModal isOpen={showAIModal} onClose={() => {}} title="Baholash Natijasi" icon={<Bot className="w-8 h-8 text-indigo-600" />} size="xl" footer={
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <Button onClick={() => setShowAIModal(false)} variant="outline" className="w-full sm:flex-1 h-12 sm:h-14 rounded-2xl text-slate-500 font-bold border-slate-200 hover:bg-slate-50 transition-all">Yopish</Button>
           <Button onClick={() => { setShowAIModal(false); if (nextItemUrl) router.push(nextItemUrl); }} className="w-full sm:flex-[2] h-12 sm:h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
              {nextItemUrl === "/student" ? "Panelga qaytish" : "Keyingi darsga o'tish"} <ChevronRight className="w-4 h-4 ml-2" />
           </Button>
        </div>
      }>
        <div className="text-left space-y-8">
           {submission?.aiConfidence !== null && (
             <div className="flex justify-center flex-col items-center gap-2">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${ (submission?.aiConfidence ?? 0) >= 0.9 ? "bg-emerald-500" : (submission?.aiConfidence ?? 0) >= 0.7 ? "bg-amber-500" : "bg-red-500" }`} style={{ width: `${(submission?.aiConfidence ?? 0) * 100}%` }} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tekshiruv aniqligi: {Math.round((submission?.aiConfidence ?? 0) * 100)}%</p>
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl text-center border border-slate-100 flex flex-col justify-center">
                 <p className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">{submission?.score}</p>
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">/ 100 Ball</p>
              </div>
              <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl text-center border border-slate-100 flex flex-col justify-center">
                 <p className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">+{submission?.xpBonus}</p>
                 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">XP Bonus</p>
              </div>
           </div>

           {submission?.feedback && (
             <div className="p-6 sm:p-8 bg-indigo-50 border border-indigo-100 rounded-3xl relative">
                <div className="absolute -top-3 -left-2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-indigo-50 z-10">
                   <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed italic">"{submission.feedback}"</p>
             </div>
           )}

           <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Batafsil tahlil (Breakdown)</p>
              {submission?.aiBreakdown ? (
                <div className="space-y-3">
                  {(typeof submission.aiBreakdown === "string" ? JSON.parse(submission.aiBreakdown) : submission.aiBreakdown).map((item: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{item.criterion}</span>
                        <span className="text-xs font-black text-indigo-600">{item.score} / 100</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{assignment.rubric}</pre>
              )}
           </div>
        </div>
      </PremiumModal>

      {/* ── Celebration Modal ── */}
      {celebrationData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white border border-slate-100 rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl animate-in zoom-in slide-in-from-bottom-6 duration-400">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mx-auto flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black mb-2 text-slate-900">Tabriklaymiz! 🎉</h2>
              <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed">
                Siz <strong className="text-slate-900">{course.title}</strong> kursini muvaffaqiyatli yakunladingiz!
              </p>
              <div className="flex flex-col gap-3">
                <Button className="w-full h-11 font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm shadow-amber-200 text-sm"
                  onClick={() => router.push(`/student/certificates/${celebrationData.certificateId}`)}>
                  Sertifikatni Ko'rish
                </Button>
                <Button variant="outline" className="w-full h-11 font-bold rounded-xl text-sm"
                  onClick={() => router.push('/student')}>
                  O'quv xonasi
                </Button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
