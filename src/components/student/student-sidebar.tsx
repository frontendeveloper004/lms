"use client";

import { LayoutDashboard, Compass, Settings, Trophy, GraduationCap, MessageSquare } from "lucide-react";
import { SidebarContent } from "@/components/sidebar-shared";

export { SidebarContent };

export function StudentSidebar({ handleLogout }: { handleLogout: () => void }) {
  const menuItems = [
    { href: "/student", label: "Mening panelim", icon: LayoutDashboard },
    { href: "/student/catalog", label: "Barcha kurslar", icon: Compass },
    { href: "/student/achievements", label: "Yutuqlar", icon: Trophy },
    { href: "/student/messages", label: "Xabarlar", icon: MessageSquare, showMessagesBadge: true },
    { href: "/student/settings", label: "Profil", icon: Settings },
  ];

  const profileItems: { href: string; label: string; icon: React.ElementType }[] = [];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex-col shrink-0 hidden lg:flex h-screen sticky top-0 shadow-sm">
      <SidebarContent
        handleLogout={handleLogout}
        brandName="O'quvchi"
        roleIcon={GraduationCap}
        menuItems={menuItems}
        profileItems={profileItems}
      />
    </aside>
  );
}
