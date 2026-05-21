"use client";

import { useRouter } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SidebarContent } from "@/components/sidebar-shared";
import { NotificationBell } from "@/components/teacher/NotificationBell";
import { LayoutDashboard, BookOpen, Users, Settings, GraduationCap, ClipboardList, MessageSquare } from "lucide-react";

export const teacherMenuItems = [
  { href: "/teacher", label: "Umumnazorat", icon: LayoutDashboard },
  { href: "/teacher/courses", label: "Kurslarim", icon: BookOpen },
  { href: "/teacher/submissions", label: "Topshiriqlar", icon: ClipboardList },
  { href: "/teacher/students", label: "Talabalar", icon: Users },
  { href: "/teacher/messages", label: "Xabarlar", icon: MessageSquare, showMessagesBadge: true },
  { href: "/teacher/settings", label: "Profil", icon: Settings },
];

export const teacherProfileItems: { href: string; label: string; icon: React.ElementType }[] = [];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Mobile Nav — bell hamburger yonida */}
      <MobileNav brandName="O'qituvchi" icon={GraduationCap} side="right" extraRight={<NotificationBell />}>
        <SidebarContent 
          handleLogout={handleLogout}
          brandName="O'qituvchi"
          roleIcon={GraduationCap}
          menuItems={teacherMenuItems}
          profileItems={teacherProfileItems}
        />
      </MobileNav>

      {/* Desktop Sidebar */}
      <TeacherSidebar handleLogout={handleLogout} />

      <main className="flex-1 overflow-x-hidden">
        {/* Desktop only: sticky header with bell */}
        <div className="hidden lg:flex items-center justify-end px-6 py-3 bg-white border-b border-slate-100 sticky top-0 z-40">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
