"use client";

import { useRouter, usePathname } from "next/navigation";
import { StudentSidebar, SidebarContent } from "@/components/student/student-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { StudentNotificationBell } from "@/components/student/StudentNotificationBell";
import { GraduationCap, LayoutDashboard, Compass, Settings, Trophy, MessageSquare } from "lucide-react";

export const studentMenuItems = [
  { href: "/student", label: "Mening panelim", icon: LayoutDashboard },
  { href: "/student/catalog", label: "Barcha kurslar", icon: Compass },
  { href: "/student/ranking", label: "Reyting", icon: Trophy },
  { href: "/student/achievements", label: "Yutuqlar", icon: GraduationCap },
  { href: "/student/messages", label: "Xabarlar", icon: MessageSquare, showMessagesBadge: true },
  { href: "/student/settings", label: "Profil", icon: Settings },
];

export const studentProfileItems: { href: string; label: string; icon: React.ElementType }[] = [];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLessonPage = pathname.includes("/lessons/") || pathname.includes("/quizzes/") || pathname.includes("/assignments/");
  const isOnboardingPage = pathname === "/student/onboarding";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {!isLessonPage && !isOnboardingPage && (
        <>
          {/* Mobile Nav — bell hamburger yonida */}
          <MobileNav brandName="O'quvchi" icon={GraduationCap} side="right" extraRight={<StudentNotificationBell />}>
            <SidebarContent 
              handleLogout={handleLogout}
              brandName="O'quvchi"
              roleIcon={GraduationCap}
              menuItems={studentMenuItems}
              profileItems={studentProfileItems}
            />
          </MobileNav>

          {/* Desktop Sidebar */}
          <StudentSidebar handleLogout={handleLogout} />
        </>
      )}
      <main className="flex-1 min-h-0 overflow-x-hidden">
        {/* Desktop only: sticky header with bell */}
        {!isLessonPage && !isOnboardingPage && (
          <div className="hidden lg:flex items-center justify-end px-6 py-3 bg-white border-b border-slate-100 sticky top-0 z-40">
            <StudentNotificationBell />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
