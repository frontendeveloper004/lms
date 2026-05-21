"use client";

import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  children: React.ReactNode;
  brandName: string;
  icon?: React.ElementType;
  side?: "left" | "right";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  extraRight?: React.ReactNode;
}

export function MobileNav({ 
  children, 
  brandName, 
  icon: Icon = GraduationCap,
  side = "left",
  isOpen: externalOpen,
  onOpenChange,
  extraRight
}: MobileNavProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const pathname = usePathname();

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Close sidebar on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:hidden" />

      {/* Mobile Bar - Fixed */}
      <header className="h-16 px-4 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm flex items-center justify-between fixed top-0 left-0 right-0 z-40 lg:hidden">
        {side === "right" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">{brandName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {extraRight}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {side === "left" && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">{brandName}</span>
          </div>
        )}
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl shadow-slate-900/10 ${isOpen ? 'translate-x-0' : side === "left" ? '-translate-x-full' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header: Brand left, X right */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">{brandName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="h-full flex flex-col">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
