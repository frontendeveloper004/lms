"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Info, LayoutList, TextQuote, Sparkles, 
  ChevronRight, BrainCircuit 
} from "lucide-react";

interface AccessibilityPanelProps {
  simplifiedText: string;
  visualSummary: string[];
  onClose: () => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  simplifiedText,
  visualSummary,
  onClose
}) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] border-l border-slate-100 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">AI Imkoniyatlar Markazi</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500" /> Eshitishda nuqsoni borlar uchun adaptatsiya
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Simplified Text */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <TextQuote className="w-4 h-4" />
            <h3 className="text-sm font-black uppercase tracking-wider">Soddalashtirilgan matn</h3>
          </div>
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 leading-relaxed text-slate-700 font-medium">
            {simplifiedText}
          </div>
        </section>

        {/* Visual Summary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutList className="w-4 h-4" />
            <h3 className="text-sm font-black uppercase tracking-wider">Vizual konspekt</h3>
          </div>
          <div className="space-y-3">
            {visualSummary.map((point, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black shrink-0 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-start gap-4">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Imo-ishora Avatar</p>
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Video pleyerning pastki chap burchagida ASL glossalarini ko'rsatuvchi avatar faollashtirildi.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <button 
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          Tushunarli
        </button>
      </div>
    </motion.div>
  );
};
