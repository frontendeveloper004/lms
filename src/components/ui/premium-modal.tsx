"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  size?: "md" | "lg" | "xl" | "2xl" | "3xl";
}

export function PremiumModal({ isOpen, onClose, title, description, children, footer, icon, size = "lg" }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative w-full bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/10 p-6 md:p-8 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh] ${
        size === "md" ? "max-w-md" :
        size === "xl" ? "max-w-xl" :
        size === "2xl" ? "max-w-2xl" :
        size === "3xl" ? "max-w-3xl" :
        "max-w-lg"
      }`}>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700 z-50"
          aria-label="Modalni yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center w-full flex-1 overflow-hidden">
          {icon && (
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 shadow-sm">
              {icon}
            </div>
          )}
          
          {title && <h2 className="text-2xl font-black tracking-tight mb-2 text-slate-900 uppercase">{title}</h2>}
          {description && (
            <p className="text-slate-500 font-medium mb-6 leading-relaxed text-sm">
              {description}
            </p>
          )}

          <div className="w-full overflow-y-auto pr-1 pb-1 custom-scrollbar flex-1 min-h-0">
            {children}
          </div>
          
          {footer && (
            <div className="w-full mt-4 pt-4 border-t border-slate-100 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
