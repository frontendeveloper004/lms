import Link from "next/link";
import { LogIn } from "lucide-react";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { Button } from "./ui/button";
import { NavbarMobile } from "./navbar-mobile";
import { SearchButton, NavbarScrollWrapper } from "./navbar-client";
import { CategoriesDropdown } from "./navbar-categories";

export async function Navbar() {
  const session = await getSession();

  // Fetch categories with their approved courses
  const categories = await prisma.category.findMany({
    include: {
      courses: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          title: true,
          image: true,
          price: true,
          teacher: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <NavbarScrollWrapper>
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8 gap-4" style={{ "--navbar-height": "56px" } as React.CSSProperties}>

        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="i.Dargoh" className="h-8 w-auto object-contain" />
          </Link>
          <nav className="hidden gap-1 md:flex items-center">
            <Link
              href="/courses"
              className="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
            >
              Kurslar
            </Link>
            <CategoriesDropdown categories={categories} />
          </nav>
        </div>

        {/* Center — Search (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center max-w-xs lg:max-w-sm">
          <SearchButton />
        </div>

        {/* Right — Auth + Search(mobile) + Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            {session ? (
              <Link href={session.role === "TEACHER" ? "/teacher" : session.role === "ADMIN" ? "/admin" : "/student"}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                >
                  Mening Panelim
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                  >
                    <LogIn className="h-4 w-4" />
                    Kirish
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm shadow-green-200"
                  >
                    Ro'yxatdan o'tish
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <SearchButton />
          </div>
          <NavbarMobile session={session} />
        </div>
      </div>
    </NavbarScrollWrapper>
  );
}
