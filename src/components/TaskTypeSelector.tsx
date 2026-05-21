"use client";

import { TASK_TYPES, type TaskType } from "@/lib/task-types";
import { CheckCircle2 } from "lucide-react";

interface TaskTypeSelectorProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
  disabled?: boolean;
  allowedCategories?: ("web" | "framework" | "scripting" | "systems" | "english")[];
}

const CATEGORY_LABELS: Record<string, string> = {
  web: "🌐 Web Texnologiyalar",
  framework: "⚡ Frameworklar",
  scripting: "📜 Skript Tillari",
  systems: "🖥️ Tizimli Dasturlash",
  english: "🇬🇧 English Language",
};

export default function TaskTypeSelector({
  value,
  onChange,
  disabled = false,
  allowedCategories,
}: TaskTypeSelectorProps) {
  const allCategories = ["web", "framework", "scripting", "systems", "english"] as const;
  const categories = allowedCategories || ["web", "framework", "scripting", "systems"];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const types = TASK_TYPES.filter((t) => t.category === cat);
        if (types.length === 0) return null;
        
        return (
          <div key={cat} className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">
              {CATEGORY_LABELS[cat] || cat}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {types.map((type) => {
                const isSelected = value === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(type.id as TaskType)}
                    className={`relative flex flex-col items-start gap-1 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-slate-300 hover:bg-slate-50/50"
                    } ${
                      isSelected
                        ? `${type.bgColor} ${type.borderColor} shadow-sm ring-4 ring-slate-100`
                        : "bg-white border-slate-100"
                    }`}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className={`w-4 h-4 ${type.color}`} />
                      </div>
                    )}

                    {/* Icon + label */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl filter drop-shadow-sm">{type.icon}</span>
                      <span
                        className={`text-[11px] font-black uppercase tracking-tight ${
                          isSelected ? type.color : "text-slate-800"
                        }`}
                      >
                        {type.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {type.description}
                    </p>

                    {/* File extensions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {type.files.map((f) => (
                        <span
                          key={f.name}
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border transition-colors ${
                            isSelected ? "bg-white/50 border-white/50 text-slate-600" : "bg-slate-50 border-slate-100 text-slate-400"
                          }`}
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
