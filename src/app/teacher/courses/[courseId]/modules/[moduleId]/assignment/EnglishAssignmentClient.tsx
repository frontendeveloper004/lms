"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import { PremiumModal } from "@/components/ui/premium-modal";
import TaskTypeSelector from "@/components/TaskTypeSelector";
import {
  ArrowLeft, BookOpen, PenTool, Headphones, PlusCircle, Edit3, Trash2, Save, X,
  Loader2, AlertTriangle, FileText, Type, Clock, Info, Bot
} from "lucide-react";
import {
  type TaskType,
  getTaskTypeConfig,
} from "@/lib/task-types";
import AudioPlayer from "@/components/AudioPlayer";
import { Music, FileAudio, UploadCloud, ListChecks, CheckSquare, MessageSquareText, GripVertical, Languages, Target, Award, ListPlus, Layout, Hash, Timer } from "lucide-react";

interface Question {
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
  questions: Question[];
}

const ListeningQuestionBuilder = ({ 
  parts, 
  onChange 
}: { 
  parts: ListeningPart[], 
  onChange: (parts: ListeningPart[]) => void 
}) => {
  const addPart = () => {
    const newPart: ListeningPart = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Part ${parts.length + 1}`,
      questions: []
    };
    onChange([...parts, newPart]);
  };

  const removePart = (partId: string) => {
    onChange(parts.filter(p => p.id !== partId));
  };

  const addQuestion = (partId: string, type: Question["type"]) => {
    const updatedParts = parts.map(p => {
      if (p.id === partId) {
        const newQuestion: Question = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          text: "",
          options: type === "MCQ" ? ["", "", ""] : undefined,
          correctAnswer: type === "TF" ? "true" : type === "MCQ" ? 0 : ""
        };
        return { ...p, questions: [...p.questions, newQuestion] };
      }
      return p;
    });
    onChange(updatedParts);
  };

  const removeQuestion = (partId: string, questionId: string) => {
    const updatedParts = parts.map(p => {
      if (p.id === partId) {
        return { ...p, questions: p.questions.filter(q => q.id !== questionId) };
      }
      return p;
    });
    onChange(updatedParts);
  };

  const updateQuestion = (partId: string, questionId: string, updates: Partial<Question>) => {
    const updatedParts = parts.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          questions: p.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
        };
      }
      return p;
    });
    onChange(updatedParts);
  };

  const updatePartTitle = (partId: string, title: string) => {
    onChange(parts.map(p => p.id === partId ? { ...p, title } : p));
  };

  return (
    <div className="space-y-8">
      {parts.map((part, pIdx) => (
        <div key={part.id} className="bg-slate-50/50 border border-slate-200 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
              <input 
                value={part.title}
                onChange={(e) => updatePartTitle(part.id, e.target.value)}
                className="bg-transparent border-none font-black text-slate-900 text-lg focus:ring-0 p-0 w-full"
                placeholder="Part Title (e.g. Part 1: Multiple Choice)"
              />
            </div>
            <button 
              type="button"
              onClick={() => removePart(part.id)}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {part.questions.map((q, qIdx) => (
              <div key={q.id} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm relative group">
                <div className="absolute -left-3 top-6 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                  {qIdx + 1}
                </div>
                
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        q.type === 'MCQ' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        q.type === 'TF' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {q.type}
                      </span>
                    </div>
                    <textarea
                      placeholder="Savol matnini kiriting..."
                      value={q.text}
                      onChange={(e) => updateQuestion(part.id, q.id, { text: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                      rows={2}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeQuestion(part.id, q.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* MCQ Options */}
                {q.type === "MCQ" && (
                  <div className="ml-1 sm:ml-2 space-y-3">
                    {q.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuestion(part.id, q.id, { correctAnswer: oIdx })}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            q.correctAnswer === oIdx 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'border-slate-200 hover:border-indigo-400'
                          }`}
                        >
                          {q.correctAnswer === oIdx && <div className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(q.options || [])];
                            newOpts[oIdx] = e.target.value;
                            updateQuestion(part.id, q.id, { options: newOpts });
                          }}
                          className="flex-1 bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-700"
                          placeholder={`${String.fromCharCode(65 + oIdx)} variant...`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* True / False */}
                {q.type === "TF" && (
                  <div className="flex gap-4 ml-2">
                    {["true", "false"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateQuestion(part.id, q.id, { correctAnswer: val })}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          q.correctAnswer === val
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        {val === "true" ? "True" : "False"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short Answer */}
                {q.type === "SHORT_ANSWER" && (
                  <div className="space-y-3 ml-2">
                    <input
                      placeholder="To'g'ri javobni kiriting (kalit so'zlar)..."
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(part.id, q.id, { correctAnswer: e.target.value })}
                      className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-black text-indigo-600 placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                      <input 
                        placeholder="Talaba uchun ko'rsatma (masalan: Max 3 words)..."
                        value={q.hint || ""}
                        onChange={(e) => updateQuestion(part.id, q.id, { hint: e.target.value })}
                        className="bg-transparent border-none text-[10px] font-bold text-amber-700 placeholder:text-amber-400 focus:ring-0 p-0 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Question Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => addQuestion(part.id, "MCQ")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <ListChecks className="w-4 h-4" /> + Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion(part.id, "TF")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <CheckSquare className="w-4 h-4" /> + True / False
              </button>
              <button
                type="button"
                onClick={() => addQuestion(part.id, "SHORT_ANSWER")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <MessageSquareText className="w-4 h-4" /> + Short Answer
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPart}
        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-2"
      >
        <PlusCircle className="w-8 h-8" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Yangi Qism (Part) Qo'shish</span>
      </button>
    </div>
  );
};

interface WritingRubricCriterion {
  id: string;
  label: string;
  maxScore: number;
  description: string;
}

interface WritingData {
  prompt: string;
  taskType: "IELTS_TASK_1" | "IELTS_TASK_2" | "ESSAY" | "LETTER" | "FREE_WRITING";
  instructions: string;
  minWords: number;
  maxWords: number;
  timeLimit: number; // in minutes
  attachments: { name: string; url: string }[];
}

const WritingAssignmentBuilder = ({
  data,
  onChange,
  onFileUpload,
  isUploading
}: {
  data: WritingData;
  onChange: (updates: Partial<WritingData>) => void;
  onFileUpload: (file: File) => Promise<string | void>;
  isUploading: boolean;
}) => {
  const handleTaskTypeSelect = (type: WritingData["taskType"]) => {
    let updates: Partial<WritingData> = { taskType: type };
    if (type === "IELTS_TASK_2") {
      updates.minWords = 250;
      updates.timeLimit = 40;
    } else if (type === "IELTS_TASK_1") {
      updates.minWords = 150;
      updates.timeLimit = 20;
    }
    onChange(updates);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onFileUpload(file);
    if (url) {
      onChange({ attachments: [...data.attachments, { name: file.name, url }] });
    }
  };

  const removeAttachment = (url: string) => {
    onChange({ attachments: data.attachments.filter(a => a.url !== url) });
  };

  return (
    <div className="space-y-12">
      {/* Writing Prompt */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <PenTool className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Writing Prompt</h3>
        </div>
        <RichTextEditor 
          value={data.prompt} 
          onChange={(val) => onChange({ prompt: val })} 
        />
      </div>

      {/* Task Type Cards */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" /> Task Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { id: "IELTS_TASK_1", label: "IELTS Task 1", icon: "📊" },
            { id: "IELTS_TASK_2", label: "IELTS Task 2", icon: "📝" },
            { id: "ESSAY", label: "Essay", icon: "✍️" },
            { id: "LETTER", label: "Letter", icon: "✉️" },
            { id: "FREE_WRITING", label: "Free Writing", icon: "✨" }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTaskTypeSelect(type.id as WritingData["taskType"])}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${
                data.taskType === type.id 
                  ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100" 
                  : "bg-white border-slate-100 hover:border-emerald-200"
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{type.icon}</span>
              <span className={`text-[10px] font-black uppercase tracking-tight ${data.taskType === type.id ? "text-emerald-700" : "text-slate-500"}`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Word + Time Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Word Limit
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 ml-1">Min Words</span>
              <input 
                type="number"
                value={data.minWords}
                onChange={(e) => onChange({ minWords: parseInt(e.target.value) || 0 })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm text-slate-900"
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 ml-1">Max Words</span>
              <input 
                type="number"
                value={data.maxWords}
                onChange={(e) => onChange({ maxWords: parseInt(e.target.value) || 0 })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm text-slate-900"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Timer className="w-3.5 h-3.5" /> Time Limit (min)
          </label>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 ml-1">Drafting Time</span>
            <input 
              type="number"
              value={data.timeLimit}
              onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || 0 })}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
  audioUrl?: string;
  imageUrl?: string;
  questions?: string[];
  preparationTime: number; // seconds
  speakingTime: number;    // seconds
}

export interface ReadingData {
  passage: string; // HTML rich text
  vocabulary: { word: string; meaning: string }[];
  timeLimit: number; // minutes
  parts: ListeningPart[]; // Reusing the same structure as Listening
}

const SpeakingAssignmentBuilder = ({
  data,
  onChange,
  onFileUpload,
  isUploading
}: {
  data: SpeakingData;
  onChange: (updates: Partial<SpeakingData>) => void;
  onFileUpload: (file: File) => Promise<string | void>;
  isUploading: boolean;
}) => {
  const SPEAKING_MODES: { id: SpeakingType; label: string; description: string; icon: string }[] = [
    { id: "PART1", label: "Speaking Part 1", description: "Simple personal questions", icon: "👋" },
    { id: "PART2", label: "Speaking Part 2", description: "Cue card / Long answer", icon: "🃏" },
    { id: "PART3", label: "Speaking Part 3", description: "Discussion / Analytical", icon: "🗣️" },
    { id: "PRONUNCIATION", label: "Pronunciation", description: "AI analysis of specific words", icon: "🎯" },
    { id: "READ_ALOUD", label: "Read Aloud", description: "Reading text clearly", icon: "📖" },
    { id: "PICTURE_DESCRIPTION", label: "Picture Description", description: "Speak based on image", icon: "🖼️" },
    { id: "DEBATE", label: "Debate", description: "Opinion based speaking", icon: "⚖️" },
    { id: "ROLE_PLAY", label: "Role Play", description: "AI interactive dialog", icon: "🤖" },
  ];

  const handleModeSelect = (type: SpeakingType) => {
    let updates: Partial<SpeakingData> = { type };
    // Set default times based on IELTS standards or reasonable defaults
    if (type === "PART2") {
      updates.preparationTime = 60;
      updates.speakingTime = 120;
    } else {
      updates.preparationTime = 0;
      updates.speakingTime = 60;
    }
    onChange(updates);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onFileUpload(file);
    if (url) onChange({ imageUrl: url });
  };

  const handleAudioSampleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onFileUpload(file);
    if (url) onChange({ audioUrl: url });
  };

  return (
    <div className="space-y-12">
      {/* Mode Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" /> Speaking Mode
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPEAKING_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleModeSelect(mode.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group ${
                data.type === mode.id 
                  ? "bg-blue-50 border-blue-500 shadow-lg shadow-blue-100" 
                  : "bg-white border-slate-100 hover:border-blue-200"
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{mode.icon}</span>
              <span className={`text-[10px] font-black uppercase tracking-tight ${data.type === mode.id ? "text-blue-700" : "text-slate-500"}`}>
                {mode.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8 p-6 sm:p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Topic / Title</label>
          <input 
            value={data.topic || ""}
            onChange={(e) => onChange({ topic: e.target.value })}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900"
            placeholder="e.g. Describe a beautiful place you visited"
          />
        </div>

        {/* Part 2: Cue Card Details */}
        {data.type === "PART2" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cue Card Bullet Points</label>
            <div className="space-y-3">
              {(data.cueCard?.bulletPoints || ["", "", ""]).map((bp, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-xs font-black text-slate-400">
                    {idx + 1}
                  </div>
                  <input 
                    value={bp}
                    onChange={(e) => {
                      const newBPs = [...(data.cueCard?.bulletPoints || ["", "", ""])];
                      newBPs[idx] = e.target.value;
                      onChange({ cueCard: { ...data.cueCard!, bulletPoints: newBPs, topic: data.topic } });
                    }}
                    className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white font-semibold text-xs text-slate-700"
                    placeholder="e.g. Where it is located"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newBPs = [...(data.cueCard?.bulletPoints || ["", "", ""]), ""];
                  onChange({ cueCard: { ...data.cueCard!, bulletPoints: newBPs, topic: data.topic } });
                }}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline ml-12"
              >
                + Add Point
              </button>
            </div>
          </div>
        )}

        {/* Picture Description */}
        {data.type === "PICTURE_DESCRIPTION" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Image</label>
            <div className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center ${
              data.imageUrl ? "border-blue-200 bg-blue-50/10" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/5"
            }`}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              ) : data.imageUrl ? (
                <div className="space-y-4">
                  <img src={data.imageUrl} className="max-h-48 rounded-xl shadow-lg mx-auto" alt="Preview" />
                  <button type="button" onClick={() => onChange({ imageUrl: undefined })} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Change Image</button>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 mb-4">Upload a picture for description</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Button type="button" variant="outline" className="text-[9px] font-black h-8 px-4 border-2">Select Image</Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Parts 1 & 3 & Debate: Questions */}
        {(data.type === "PART1" || data.type === "PART3" || data.type === "DEBATE" || data.type === "ROLE_PLAY") && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {data.type === "ROLE_PLAY" ? "Scenario / Dialogue Starting Points" : "Questions"}
            </label>
            <div className="space-y-3">
              {(data.questions || [""]).map((q, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea 
                    value={q}
                    onChange={(e) => {
                      const newQs = [...(data.questions || [""])];
                      newQs[idx] = e.target.value;
                      onChange({ questions: newQs });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700"
                    rows={1}
                    placeholder="Enter question or prompt line..."
                  />
                  <button type="button" onClick={() => onChange({ questions: data.questions?.filter((_, i) => i !== idx) })} className="p-2 text-slate-300 hover:text-rose-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onChange({ questions: [...(data.questions || []), ""] })}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                + Add Question / Prompt
              </button>
            </div>
          </div>
        )}

        {/* Read Aloud / Pronunciation: Text */}
        {(data.type === "READ_ALOUD" || data.type === "PRONUNCIATION") && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Text / Words</label>
            <RichTextEditor 
              value={data.description || ""}
              onChange={(val) => onChange({ description: val })}
            />
          </div>
        )}

        {/* Timers */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preparation Time (sec)</label>
            <input 
              type="number"
              value={data.preparationTime}
              onChange={(e) => onChange({ preparationTime: parseInt(e.target.value) || 0 })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Speaking Time (sec)</label>
            <input 
              type="number"
              value={data.speakingTime}
              onChange={(e) => onChange({ speakingTime: parseInt(e.target.value) || 0 })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadingAssignmentBuilder = ({
  data,
  onChange
}: {
  data: ReadingData;
  onChange: (updates: Partial<ReadingData>) => void;
}) => {
  const addVocab = () => {
    onChange({ vocabulary: [...data.vocabulary, { word: "", meaning: "" }] });
  };

  const removeVocab = (index: number) => {
    onChange({ vocabulary: data.vocabulary.filter((_, i) => i !== index) });
  };

  const updateVocab = (index: number, updates: { word?: string; meaning?: string }) => {
    const newVocab = [...data.vocabulary];
    newVocab[index] = { ...newVocab[index], ...updates };
    onChange({ vocabulary: newVocab });
  };

  return (
    <div className="space-y-12">
      {/* Passage Editor */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5" /> Reading Passage
        </label>
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
          <RichTextEditor
            value={data.passage}
            onChange={(passage) => onChange({ passage })}
          />
        </div>
      </div>

      {/* Vocabulary Builder */}
      <div className="space-y-4 p-8 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Languages className="w-3.5 h-3.5" /> Vocabulary Preview (Words to Know)
          </label>
          <button
            type="button"
            onClick={addVocab}
            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
          >
            + Add Word
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.vocabulary.map((v, i) => (
            <div key={i} className="flex gap-2 group animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex-1 space-y-2">
                <input
                  value={v.word}
                  onChange={(e) => updateVocab(i, { word: e.target.value })}
                  placeholder="Word..."
                  className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-900"
                />
                <input
                  value={v.meaning}
                  onChange={(e) => updateVocab(i, { meaning: e.target.value })}
                  placeholder="Meaning..."
                  className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-white font-medium text-[10px] text-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVocab(i)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {data.vocabulary.length === 0 && (
            <div className="col-span-full py-8 text-center border-2 border-dashed border-indigo-100 rounded-2xl">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">No vocabulary words added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Questions Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5" /> Questions & Tasks
          </label>
        </div>
        <ListeningQuestionBuilder
          parts={data.parts}
          onChange={(parts) => onChange({ parts })}
        />
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Timer className="w-3.5 h-3.5" /> Time Limit (min)
          </label>
          <input
            type="number"
            value={data.timeLimit}
            onChange={(e) => onChange({ timeLimit: parseInt(e.target.value) || 0 })}
            className="w-32 h-12 px-4 rounded-xl border border-slate-200 bg-white font-black text-sm text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};

interface Assignment {
  id: string;
  title: string;
  description: string;
  rubric: string;
  taskType: string;
  starterCode: string | null;
  attachmentUrl: string | null;
  aiGradingEnabled: boolean;
  aiGradingPrompt: string | null;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export default function EnglishAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRubric, setFormRubric] = useState("");
  const [formTaskType, setFormTaskType] = useState<TaskType>("ENGLISH_READING");
  const [formContent, setFormContent] = useState(""); // For Reading passage or Listening transcript path
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string | null>(null);
  const [showTranscriptField, setShowTranscriptField] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);
  const [formAiGradingEnabled, setFormAiGradingEnabled] = useState(false);
  const [formAiGradingPrompt, setFormAiGradingPrompt] = useState("");
  const [listeningParts, setListeningParts] = useState<ListeningPart[]>([]);
  const [readingData, setReadingData] = useState<ReadingData>({
    passage: "",
    vocabulary: [],
    timeLimit: 20,
    parts: []
  });
  const [writingData, setWritingData] = useState<WritingData>({
    prompt: "",
    taskType: "IELTS_TASK_1",
    instructions: "",
    minWords: 150,
    maxWords: 500,
    timeLimit: 20,
    attachments: []
  });
  const [speakingData, setSpeakingData] = useState<SpeakingData>({
    type: "PART2",
    topic: "",
    preparationTime: 60,
    speakingTime: 120,
    cueCard: { topic: "", bulletPoints: ["", "", ""] }
  });

  const formRef = useRef<HTMLDivElement>(null);

  const fetchAssignment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [courseId, moduleId]);

  const openCreate = () => {
    setFormTitle("");
    setFormDescription("");
    setFormRubric("");
    setFormTaskType("ENGLISH_READING");
    setFormAttachmentUrl(null);
    setFormAiGradingEnabled(false);
    setFormAiGradingPrompt("");
    setWritingData({
      prompt: "",
      taskType: "IELTS_TASK_1",
      instructions: "",
      minWords: 150,
      maxWords: 500,
      timeLimit: 20,
      attachments: []
    });
    setSpeakingData({
      type: "PART2",
      topic: "",
      preparationTime: 60,
      speakingTime: 120,
      cueCard: { topic: "", bulletPoints: ["", "", ""] }
    });
    setShowTranscriptField(false);
    setError(null);
    setIsCreating(true);
    setIsEditing(false);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openEdit = () => {
    if (!assignment) return;
    setFormTitle(assignment.title);
    setFormDescription(assignment.description);
    setFormRubric(assignment.rubric);
    setFormTaskType((assignment.taskType as TaskType) || "ENGLISH_READING");
    setFormContent(typeof assignment.starterCode === "string" ? assignment.starterCode : "");
    setFormAttachmentUrl(assignment.attachmentUrl || null);
    setFormAiGradingEnabled(assignment.aiGradingEnabled);
    setFormAiGradingPrompt(assignment.aiGradingPrompt || "");
    
    // Parse listening parts if it's a multi-part structure
    if (assignment.taskType === "ENGLISH_LISTENING") {
      let parsed = null;
      if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
        parsed = assignment.starterCode;
      } else if (typeof assignment.starterCode === "string" && assignment.starterCode.startsWith("{")) {
        try { parsed = JSON.parse(assignment.starterCode); } catch (e) {}
      }
      
      if (parsed && (parsed as any).parts) {
        setListeningParts((parsed as any).parts);
        setFormContent((parsed as any).transcript || ""); // Transcript path
      } else {
        setListeningParts([]);
      }
    }
    
    // Parse writing data
    if (assignment.taskType === "ENGLISH_WRITING") {
      let parsed = null;
      if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
        parsed = assignment.starterCode;
      } else if (typeof assignment.starterCode === "string" && assignment.starterCode.startsWith("{")) {
        try { parsed = JSON.parse(assignment.starterCode); } catch (e) {}
      }
      
      if (parsed) {
        setWritingData(prev => ({ ...prev, ...parsed }));
      }
    }
    
    // Parse speaking data
    if (assignment.taskType === "ENGLISH_SPEAKING") {
      let parsed = null;
      if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
        parsed = assignment.starterCode;
      } else if (typeof assignment.starterCode === "string" && assignment.starterCode.startsWith("{")) {
        try { parsed = JSON.parse(assignment.starterCode); } catch (e) {}
      }
      
      if (parsed) {
        setSpeakingData(prev => ({ ...prev, ...parsed }));
      }
    }
    
    // Parse reading data
    if (assignment.taskType === "ENGLISH_READING") {
      let parsed = null;
      if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
        parsed = assignment.starterCode;
      } else if (typeof assignment.starterCode === "string" && assignment.starterCode.startsWith("{")) {
        try { parsed = JSON.parse(assignment.starterCode); } catch (e) {}
      }
      
      if (parsed) {
        setReadingData(prev => ({ ...prev, ...parsed }));
      }
    }

    setShowTranscriptField(!!assignment.starterCode && assignment.taskType === "ENGLISH_LISTENING");
    setError(null);
    setIsEditing(true);
    setIsCreating(false);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formTitle.trim()) { setError("Sarlavha kiritilishi shart"); return; }
    if (!formDescription.trim()) { setError("Tavsif kiritilishi shart"); return; }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`, {
        method: isCreating ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          rubric: formRubric,
          taskType: formTaskType,
          starterCode: formTaskType === "ENGLISH_LISTENING" 
            ? JSON.stringify({ 
                parts: listeningParts, 
                transcript: (showTranscriptField ? formContent : null) 
              })
            : formTaskType === "ENGLISH_WRITING"
            ? JSON.stringify(writingData)
            : formTaskType === "ENGLISH_SPEAKING"
            ? JSON.stringify(speakingData)
            : formTaskType === "ENGLISH_READING"
            ? JSON.stringify(readingData)
            : formContent, 
          attachmentUrl: formAttachmentUrl,
          aiGradingEnabled: formAiGradingEnabled,
          aiGradingPrompt: formAiGradingPrompt,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Xatolik yuz berdi");
        return;
      }
      await fetchAssignment();
      setIsCreating(false);
      setIsEditing(false);
    } catch {
      setError("Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    try {
      const res = await fetch("/api/upload/assignment-attachment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fayl yuklashda xatolik");
        return;
      }
      const data = await res.json();
      setFormAttachmentUrl(data.url);
    } catch {
      setError("Fayl yuklashda xatolik");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTranscriptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingTranscript(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    try {
      const res = await fetch("/api/upload/assignment-attachment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Transcript yuklashda xatolik");
        return;
      }
      const data = await res.json();
      setFormContent(data.url);
    } catch {
      setError("Transcript yuklashda xatolik");
    } finally {
      setIsUploadingTranscript(false);
    }
  };

  const handleWritingFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    try {
      const res = await fetch("/api/upload/assignment-attachment", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fayl yuklashda xatolik");
        return;
      }
      const data = await res.json();
      return data.url;
    } catch {
      setError("Fayl yuklashda xatolik");
    }
  };
  


  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/assignment`, { method: "DELETE" });
      if (res.ok) { setAssignment(null); setDeleteModalOpen(false); }
    } catch (err) { console.error(err); }
    finally { setIsDeleting(false); }
  };

  const inputCls =
    "w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-semibold text-sm";

  const taskConfig = assignment ? getTaskTypeConfig(assignment.taskType || "ENGLISH_READING") : null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <button
            onClick={() => router.replace(`/teacher/courses/${courseId}/modules`)}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kurs Modullariga qaytish
          </button>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            English Assignments
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Ingliz tili darsi uchun Reading, Writing yoki Listening topshiriqlarini boshqaring.
          </p>
        </div>
      </div>

      {/* ── Create / Edit Form ── */}
      {(isCreating || isEditing) && (
        <div
          ref={formRef}
          className="bg-white border-2 border-indigo-100 rounded-[2rem] shadow-xl shadow-indigo-100/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-50 bg-indigo-50/20">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              {isCreating ? <PlusCircle className="w-6 h-6 text-indigo-500" /> : <Edit3 className="w-6 h-6 text-indigo-500" />}
              {isCreating ? "Yangi topshiriq yaratish" : "Topshiriqni tahrirlash"}
            </h2>
            <button onClick={() => { setIsCreating(false); setIsEditing(false); setError(null); }} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-8 sm:space-y-10">
            {error && (
              <div className="px-6 py-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" /> {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Topshiriq Sarlavhasi</label>
              <input 
                required 
                value={formTitle} 
                onChange={(e) => setFormTitle(e.target.value)} 
                className={inputCls} 
                placeholder="Masalan: IELTS Reading: Environmental Protection" 
              />
            </div>

            {/* Task Type */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Topshiriq Yo'nalishi
              </label>
              <TaskTypeSelector 
                value={formTaskType} 
                onChange={setFormTaskType} 
                allowedCategories={["english"]} 
              />
            </div>

            {/* Specialized Content Editor / Audio Upload */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  {formTaskType === "ENGLISH_READING" && <BookOpen className="w-3.5 h-3.5" />}
                  {formTaskType === "ENGLISH_LISTENING" && <Headphones className="w-3.5 h-3.5" />}
                  {formTaskType === "ENGLISH_WRITING" && <PenTool className="w-3.5 h-3.5" />}
                  {formTaskType === "ENGLISH_READING" ? "Reading Passage (Matn)" : 
                   formTaskType === "ENGLISH_LISTENING" ? "Listening Material" : 
                   "Writing Prompt / Topic"}
                </label>

                {formTaskType === "ENGLISH_LISTENING" && (
                  <button
                    type="button"
                    onClick={() => setShowTranscriptField(!showTranscriptField)}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${
                      showTranscriptField 
                        ? "bg-amber-50 border-amber-200 text-amber-600" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {showTranscriptField ? "− Transkriptni olib tashlash" : "+ Transkript qo'shish"}
                  </button>
                )}
              </div>

              {formTaskType === "ENGLISH_LISTENING" ? (
                <div className="space-y-10">
                  {/* Audio Upload Zone (Keep existing) */}
                  <div className={`relative group border-2 border-dashed rounded-[2rem] p-6 sm:p-8 transition-all flex flex-col items-center justify-center text-center ${
                    formAttachmentUrl ? "border-indigo-200 bg-indigo-50/10" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/5"
                  }`}>
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                        <p className="text-sm font-bold text-slate-600">Audio yuklanmoqda...</p>
                      </div>
                    ) : formAttachmentUrl ? (
                      <div className="w-full space-y-4">
                        <div className="flex items-center justify-center gap-3 text-indigo-600">
                          <Music className="w-8 h-8" />
                          <p className="text-sm font-black uppercase tracking-widest">Audio muvaffaqiyatli yuklandi</p>
                        </div>
                        <AudioPlayer src={formAttachmentUrl} className="max-w-md mx-auto" />
                        <button
                          type="button"
                          onClick={() => setFormAttachmentUrl(null)}
                          className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                        >
                          Faylni o'chirish
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-1">Audio faylni tanlang</h4>
                        <p className="text-xs text-slate-400 max-w-xs mb-6">Mashq uchun MP3, WAV yoki OGG formatdagi audio faylni yuklang (max 20MB)</p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-2">Faylni tanlash</Button>
                      </>
                    )}
                  </div>

                  {/* Multi-Part Question Builder */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-indigo-600" /> Savollar va Qismlar (Parts)
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowTranscriptField(!showTranscriptField)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border ${
                          showTranscriptField 
                            ? "bg-amber-50 border-amber-200 text-amber-600" 
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        {showTranscriptField ? "− Transcript yashirish" : "+ Transcript qo'shish"}
                      </button>
                    </div>

                    <ListeningQuestionBuilder 
                      parts={listeningParts} 
                      onChange={setListeningParts} 
                    />

                    {showTranscriptField && (
                      <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Audio Transkript (PDF/DOCX)</label>
                        
                        {isUploadingTranscript ? (
                          <div className="flex flex-col items-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                            <p className="text-sm font-bold text-slate-600">Fayl yuklanmoqda...</p>
                          </div>
                        ) : formContent && formContent.startsWith("/uploads/") ? (
                          <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-2xl group transition-all">
                            <div className="flex items-center gap-3 text-teal-600">
                              <FileText className="w-6 h-6" />
                              <a href={formContent} target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase tracking-widest hover:underline">Transcript Fayli Yuklandi</a>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormContent("")}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-rose-500 hover:bg-rose-50 transition-all border border-rose-100 shadow-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:bg-slate-50 hover:border-indigo-300 flex flex-col items-center justify-center text-center">
                            <UploadCloud className="w-8 h-8 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-xs font-bold text-slate-500 mb-3 block">PDF yoki DOCX fayl yuklang (max 10MB)</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleTranscriptFileUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Button type="button" variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-2">Faylni tanlash</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {formTaskType === "ENGLISH_READING" ? (
                    <ReadingAssignmentBuilder 
                      data={readingData}
                      onChange={(updates) => setReadingData(prev => ({ ...prev, ...updates }))}
                    />
                  ) : formTaskType === "ENGLISH_WRITING" ? (
                    <WritingAssignmentBuilder 
                      data={writingData}
                      onChange={(updates) => setWritingData(prev => ({ ...prev, ...updates }))}
                      onFileUpload={handleWritingFileUpload}
                      isUploading={isUploading}
                    />
                  ) : formTaskType === "ENGLISH_SPEAKING" ? (
                    <SpeakingAssignmentBuilder 
                      data={speakingData}
                      onChange={(updates) => setSpeakingData(prev => ({ ...prev, ...updates }))}
                      onFileUpload={handleWritingFileUpload} // Reusing upload logic
                      isUploading={isUploading}
                    />
                  ) : (
                    <>
                      <RichTextEditor 
                        value={formContent} 
                        onChange={setFormContent} 
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        Insho uchun mavzu va ko'rsatmalarni batafsil yozing.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>


            {/* Instructions */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Talabalar uchun ko'rsatmalar (Instructions)
              </label>
              <RichTextEditor 
                value={formDescription} 
                onChange={setFormDescription} 
              />
            </div>

            {/* AI Grading & Rubric Config */}
            <div className="pt-8 border-t border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Baholash</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAiGradingEnabled(!formAiGradingEnabled)}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${formAiGradingEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" /> Baholash va Cheklovlar (Rubric)
                </label>
                <textarea
                  required
                  value={formAiGradingEnabled ? formAiGradingPrompt : formRubric}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (formAiGradingEnabled) setFormAiGradingPrompt(val);
                    setFormRubric(val);
                  }}
                  rows={6}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-semibold text-sm resize-none"
                  placeholder={formAiGradingEnabled 
                    ? "AI uchun ko'rsatma va mezonlarni kiriting..." 
                    : "Masalan:&#10;- Minimal 250 ta so'z&#10;- So'z boyligi va grammatika (40 ball)"}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-50">
              <Button type="button" variant="ghost" onClick={() => { setIsCreating(false); setIsEditing(false); setError(null); }} className="h-12 w-full sm:w-auto px-6 sm:px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 flex justify-center">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex justify-center">
                <Save className="w-4 h-4 shrink-0" />
                <span className="truncate">{isSaving ? "Saving..." : "Save Assignment"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : !assignment ? (
        <div className="text-center py-24 bg-white border-2 border-dashed border-indigo-100 rounded-[2.5rem] flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6 border border-indigo-100 shadow-inner">
            <BookOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Hali topshiriq yaratilmagan</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
            Ushbu modul uchun o'quvchilaringizga qiziqarli topshiriq tayyorlang.
          </p>
          {!isCreating && (
            <Button onClick={openCreate} className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] gap-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200">
              <PlusCircle className="w-5 h-5" /> Topshiriq yaratish
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-indigo-100/10 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${taskConfig?.bgColor || "bg-indigo-50"} ${taskConfig?.borderColor || "border-indigo-100"}`}>
                <span className="text-2xl">{taskConfig?.icon || "📝"}</span>
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xl tracking-tight">{assignment.title}</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${taskConfig?.bgColor} ${taskConfig?.color} ${taskConfig?.borderColor}`}>
                    {taskConfig?.label}
                  </span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Last Update: {new Date(assignment.updatedAt).toLocaleTimeString("uz-UZ")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={openEdit} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Edit3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteModalOpen(true)} className="h-12 w-12 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
            {/* Left: Content (Passage/Prompt) */}
            <div className="lg:col-span-2 p-8 space-y-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                {assignment.taskType === "ENGLISH_LISTENING" ? <Music className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {assignment.taskType === "ENGLISH_LISTENING" ? "Listening Material" : "Asosiy tarkib (Passage / Prompt)"}
              </h4>
              
              {(() => {
                // Handling Writing assignments separately for premium layout
                if (assignment.taskType === "ENGLISH_WRITING") {
                  let writingData: WritingData | null = null;
                  try {
                    if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
                      writingData = assignment.starterCode as any;
                    } else if (assignment.starterCode && typeof assignment.starterCode === "string") {
                      writingData = JSON.parse(assignment.starterCode);
                    }
                  } catch (e) {
                    console.error("Error parsing writing data in detail view", e);
                  }

                  if (!writingData || (!writingData.prompt && writingData.taskType === undefined)) {
                    return <div className="text-slate-400 italic p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">Ma'lumotlar yuklanmadi yoki noto'g'ri formatda.</div>;
                  }

                  return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <section className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                            <PenTool className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Writing Prompt</h5>
                            <p className="text-xs font-bold text-slate-900">{writingData.taskType.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="rich-content-english text-xl text-slate-800 leading-relaxed font-medium bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-sm"
                             dangerouslySetInnerHTML={{ __html: writingData.prompt }} />
                      </section>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Word Count</p>
                            <p className="text-xs font-black text-slate-900">{writingData.minWords} - {writingData.maxWords} words</p>
                          </div>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Timer className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Limit</p>
                            <p className="text-xs font-black text-slate-900">{writingData.timeLimit} minutes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Handling Listening assignments
                if (assignment.taskType === "ENGLISH_LISTENING") {
                  let listeningData: { parts: ListeningPart[]; transcript?: string | null } | null = null;
                  if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
                    listeningData = assignment.starterCode as any;
                  } else if (typeof assignment.starterCode === "string" && assignment.starterCode.startsWith("{")) {
                    try { listeningData = JSON.parse(assignment.starterCode); } catch (e) {}
                  }

                  return (
                    <div className="space-y-8">
                      {assignment.attachmentUrl ? (
                        <div className="max-w-2xl">
                          <AudioPlayer src={assignment.attachmentUrl} />
                        </div>
                      ) : (
                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                          <p className="text-slate-400 text-sm font-medium">Audio fayl biriktirilmagan</p>
                        </div>
                      )}

                      {listeningData ? (
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 flex items-center gap-2">
                            <ListChecks className="w-4 h-4" /> Savollar tuzilmasi
                          </h5>
                          {listeningData.parts.map((part) => (
                            <div key={part.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-xs font-black text-slate-700 mb-2">{part.title}</p>
                              <div className="flex flex-wrap gap-2">
                                {part.questions.map((q) => (
                                  <span key={q.id} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                    q.type === "MCQ" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    q.type === "TF" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  }`}>
                                    {q.type === "MCQ" ? "MCQ" : q.type === "TF" ? "T/F" : "Short Ans"}
                                  </span>
                                ))}
                                {part.questions.length === 0 && (
                                  <span className="text-[10px] text-slate-300 font-bold italic">Hali savollar qo'shilmagan</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {listeningData.transcript && (
                            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Transkript mavjud
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Legacy or single transcript */
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Transcript</h5>
                          {assignment.starterCode && assignment.starterCode.startsWith("/uploads/") ? (
                            <a href={assignment.starterCode} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Transcript Fayli</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Yuklab olish uchun bosing</p>
                              </div>
                            </a>
                          ) : (
                            <div className="rich-content-english text-base text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-50"
                                 dangerouslySetInnerHTML={{ __html: assignment.starterCode || "Tarkib mavjud emas." }} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handling Speaking assignments
                if (assignment.taskType === "ENGLISH_SPEAKING") {
                  let speakingData: SpeakingData | null = null;
                  try {
                    if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
                      speakingData = assignment.starterCode as any;
                    } else if (assignment.starterCode && typeof assignment.starterCode === "string") {
                      speakingData = JSON.parse(assignment.starterCode);
                    }
                  } catch (e) {}

                  if (!speakingData) return <div className="text-slate-400 italic">Ma'lumotlar yuklanmadi.</div>;

                  return (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                          <MessageSquareText className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">{speakingData.type.replace(/_/g, ' ')}</h5>
                          <p className="text-sm font-semibold text-slate-600">{speakingData.topic}</p>
                        </div>
                      </div>

                      {speakingData.imageUrl && (
                        <img src={speakingData.imageUrl} className="max-h-64 rounded-3xl border border-slate-100 shadow-sm" alt="Task" />
                      )}

                      {speakingData.type === "PART2" && speakingData.cueCard && (
                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 shadow-inner space-y-4">
                          <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">IELTS Cue Card</h6>
                          <p className="text-lg font-black text-slate-900">{speakingData.cueCard.topic}</p>
                          <ul className="space-y-2">
                             {speakingData.cueCard.bulletPoints.map((bp, i) => bp && (
                               <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {bp}
                               </li>
                             ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <Timer className="w-4 h-4 text-slate-400" />
                           <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prep Time</p>
                             <p className="text-xs font-black text-slate-900">{speakingData.preparationTime}s</p>
                           </div>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <Clock className="w-4 h-4 text-slate-400" />
                           <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Speaking Time</p>
                             <p className="text-xs font-black text-slate-900">{speakingData.speakingTime}s</p>
                           </div>
                         </div>
                      </div>
                    </div>
                  );
                }

                // Handling Reading assignments
                if (assignment.taskType === "ENGLISH_READING") {
                  let readingData: ReadingData | null = null;
                  try {
                    if (typeof assignment.starterCode === "object" && assignment.starterCode !== null) {
                      readingData = assignment.starterCode as any;
                    } else if (assignment.starterCode && typeof assignment.starterCode === "string") {
                      readingData = JSON.parse(assignment.starterCode);
                    }
                  } catch (e) {}

                  if (!readingData) return <div className="text-slate-400 italic">Ma'lumotlar yuklanmadi.</div>;

                  return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                       <section className="space-y-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                             <BookOpen className="w-5 h-5" />
                           </div>
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reading Passage</h5>
                         </div>
                         <div className="rich-content-english text-[13px] text-slate-700 leading-relaxed bg-slate-50/50 p-8 rounded-3xl border border-slate-100"
                              dangerouslySetInnerHTML={{ __html: readingData.passage }} />
                       </section>

                       {readingData.vocabulary.length > 0 && (
                         <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Vocabulary (So'zlar)</h5>
                           <div className="flex flex-wrap gap-2">
                             {readingData.vocabulary.map((v, i) => (
                               <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                 {v.word}: <span className="font-medium text-slate-400 lowercase">{v.meaning}</span>
                               </span>
                             ))}
                           </div>
                         </div>
                       )}

                       {readingData.parts.length > 0 && (
                         <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Savollar tuzilmasi</h5>
                           {readingData.parts.map((part) => (
                             <div key={part.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <p className="text-xs font-black text-slate-700 mb-2">{part.title}</p>
                               <div className="flex flex-wrap gap-2">
                                 {part.questions.map((q) => (
                                   <span key={q.id} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                     q.type === "MCQ" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                     q.type === "TF" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                     "bg-emerald-50 text-emerald-600 border-emerald-100"
                                   }`}>
                                     {q.type === "MCQ" ? "MCQ" : q.type === "TF" ? "T/F" : "Short Ans"}
                                   </span>
                                 ))}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  );
                }

                // Default: Reading or generic content
                return (
                  <div className="rich-content-english text-base text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-50 min-h-[200px]" 
                       dangerouslySetInnerHTML={{ __html: assignment.starterCode || "Tarkib mavjud emas." }} />
                );
              })()}
            </div>

            {/* Right: Instructions */}
            <div className="p-8 bg-slate-50/20">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Instructions
                </h4>
                <div className="rich-content text-sm text-slate-600 italic leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: assignment.description }} />
              </section>

            </div>
          </div>

          {/* Bottom: Rubric (Full Width) */}
          <div className="p-8 lg:p-12 bg-white border-t border-slate-50">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    Rubric & Scoring
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Baholash mezonlari</p>
                </div>
              </div>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans font-medium bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100/50 leading-relaxed shadow-inner">
                {assignment.rubric}
              </pre>
            </section>
          </div>
        </div>
      </div>
    )}

      <PremiumModal
        isOpen={deleteModalOpen}
        onClose={() => { if (!isDeleting) setDeleteModalOpen(false); }}
        title="O'CHIRISHNI TASDIQLANG"
        description="Ushbu topshiriqni butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        icon={<AlertTriangle className="w-10 h-10 text-rose-500" />}
      >
        <div className="space-y-3">
          <Button variant="destructive" type="button" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Ha, o'chirilsin"}
          </Button>
          <Button variant="ghost" type="button" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Bekor qilish
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
