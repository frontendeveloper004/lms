"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

interface Course {
  id: string;
  title: string;
  image: string | null;
  price: number;
  teacher: { name: string };
}

interface Category {
  id: string;
  name: string;
  courses: Course[];
}

export function CategoriesDropdown({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Only show categories that have at least 1 approved course
  const activeCategories = categories.filter((c) => c.courses.length > 0);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
          open
            ? "text-blue-600 bg-blue-50"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        }`}
      >
        Kategoriyalar
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Full-width dropdown — Coursera style */}
      {open && (
        <div
          className="fixed left-0 right-0 bg-white border-b border-slate-100 shadow-xl shadow-slate-900/8 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ top: "56px" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container max-w-screen-2xl px-4 md:px-8 py-8">
            {activeCategories.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium py-4">
                Hozircha kurslar mavjud emas
              </p>
            ) : (
              <>
                {/* Categories grid */}
                <div
                  className="grid gap-x-8 gap-y-6"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(activeCategories.length, 5)}, minmax(0, 1fr))`,
                  }}
                >
                  {activeCategories.map((cat) => (
                    <div key={cat.id}>
                      {/* Category heading */}
                      <Link
                        href={`/courses?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setOpen(false)}
                        className="block text-sm font-black text-slate-900 hover:text-blue-600 transition-colors mb-3 pb-2 border-b border-slate-100"
                      >
                        {cat.name}
                      </Link>

                      {/* Course list */}
                      <ul className="space-y-2">
                        {cat.courses.slice(0, 5).map((course) => (
                          <li key={course.id}>
                            <Link
                              href={`/courses/${course.id}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors group"
                            >
                              <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors shrink-0" />
                              <span className="truncate">{course.title}</span>
                            </Link>
                          </li>
                        ))}
                        {cat.courses.length > 5 && (
                          <li>
                            <Link
                              href={`/courses?category=${encodeURIComponent(cat.name)}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-1"
                            >
                              Barchasini ko'rish
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">
                    Jami <span className="font-black text-slate-600">{activeCategories.length}</span> kategoriya,{" "}
                    <span className="font-black text-slate-600">
                      {activeCategories.reduce((sum, c) => sum + c.courses.length, 0)}
                    </span>{" "}
                    kurs mavjud
                  </p>
                  <Link
                    href="/courses"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Barcha kurslarni ko'rish <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
