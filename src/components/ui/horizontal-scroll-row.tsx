"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollRowProps {
  children: React.ReactNode;
  className?: string;
  itemFullWidth?: boolean;
}

export function HorizontalScrollRow({ children, className = "", itemFullWidth = false }: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          aria-label="Oldingi"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={`flex overflow-x-auto gap-5 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 pb-2 ${className}`}
      >
        {children}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          aria-label="Keyingi"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
