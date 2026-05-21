"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, ArrowRight, Loader2 } from "lucide-react";

// ── Announcement Bar ──────────────────────────────────────────
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (dismissed) setVisible(false);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("announcement-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-3 relative">
      <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
      <span className="tracking-wide">
        🎉 Yangi kurslar qo'shildi! Hoziroq ko'ring va o'rganishni boshlang
      </span>
      <Link
        href="/courses"
        className="underline underline-offset-2 hover:text-white/80 transition-colors whitespace-nowrap hidden sm:inline"
      >
        Ko'rish →
      </Link>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Yopish"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Search Button (triggers modal) ───────────────────────────
export function SearchButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm hover:border-slate-300 hover:bg-white transition-all group"
        aria-label="Qidirish"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Kurs qidirish...</span>
        <kbd className="ml-2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-bold text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Qidirish"
      >
        <Search className="w-4 h-4" />
      </button>

      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Search Modal ──────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (courseId: string) => {
    onClose();
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kurs, mavzu yoki kalit so'z..."
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent font-medium"
          />
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((course) => (
                <li key={course.id}>
                  <button
                    onClick={() => handleSelect(course.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {course.image ? (
                        <img src={course.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{course.title}</p>
                      <p className="text-xs text-slate-400 font-medium">{course.category?.name}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          ) : query && !loading ? (
            <div className="py-10 text-center text-slate-400 text-sm font-medium">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              "{query}" bo'yicha hech narsa topilmadi
            </div>
          ) : !query ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              Kurs nomini yozing...
            </div>
          ) : null}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1"><kbd className="border border-slate-200 rounded px-1 py-0.5 text-[9px]">↵</kbd> Ochish</span>
          <span className="flex items-center gap-1"><kbd className="border border-slate-200 rounded px-1 py-0.5 text-[9px]">Esc</kbd> Yopish</span>
        </div>
      </div>
    </div>
  );
}

// ── Scroll Shrink Wrapper ─────────────────────────────────────
export function NavbarScrollWrapper({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ "--navbar-height": scrolled ? "56px" : "56px" } as React.CSSProperties}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "shadow-md shadow-slate-900/5 bg-white/98 backdrop-blur-md border-b border-slate-100"
          : "bg-white/95 backdrop-blur border-b border-slate-100"
      }`}
    >
      {children}
    </div>
  );
}
