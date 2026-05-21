"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn, GraduationCap, BookOpen, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

interface NavbarMobileProps {
  session: { role: string; name?: string } | null;
}

export function NavbarMobile({ session }: NavbarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Menyuni ochish"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed top-16 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="container px-4 py-4 space-y-1">
              {/* Nav links */}
              <Link
                href="/courses"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                Kurslar
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                <GraduationCap className="h-4 w-4 text-slate-400" />
                Kategoriyalar
              </Link>

              <div className="h-px bg-slate-100 my-2" />

              {/* Auth */}
              {session ? (
                <Link
                  href={session.role === "TEACHER" ? "/teacher" : session.role === "ADMIN" ? "/admin" : "/student"}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  Mening Panelim
                </Link>
              ) : (
                <div className="flex flex-col gap-2 pt-1 pb-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-700 font-bold gap-2">
                      <LogIn className="h-4 w-4" />
                      Kirish
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                      Ro'yxatdan o'tish
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
