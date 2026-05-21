"use client";

import { LayoutDashboard, BookOpen, Users, Settings, GraduationCap, ClipboardList, MessageSquare } from "lucide-react";
import { SidebarContent } from "@/components/sidebar-shared";

export function TeacherSidebar({ handleLogout }: { handleLogout: () => void }) {
  const menuItems = [
    { href: "/teacher", label: "Umumnazorat", icon: LayoutDashboard },
    { href: "/teacher/courses", label: "Kurslarim", icon: BookOpen },
    { href: "/teacher/submissions", label: "Topshiriqlar", icon: ClipboardList },
    { href: "/teacher/students", label: "Talabalar", icon: Users },
    { href: "/teacher/messages", label: "Xabarlar", icon: MessageSquare, showMessagesBadge: true },
    { href: "/teacher/settings", label: "Profil", icon: Settings },
  ];

  const profileItems: { href: string; label: string; icon: React.ElementType }[] = [];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-col shrink-0 hidden lg:flex h-screen sticky top-0 shadow-sm">
      <SidebarContent
        handleLogout={handleLogout}
        brandName="O'qituvchi"
        roleIcon={GraduationCap}
        menuItems={menuItems}
        profileItems={profileItems}
      />
    </aside>
  );
}
