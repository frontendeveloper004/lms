"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MessagesBadge } from "@/components/chat/MessagesBadge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  showMessagesBadge?: boolean;
}

interface SidebarContentProps {
  handleLogout: () => void;
  brandName: string;
  roleIcon: React.ElementType;
  menuItems: NavItem[];
  profileItems: NavItem[];
}

export function SidebarContent({
  handleLogout,
  brandName,
  roleIcon: RoleIcon,
  menuItems,
  profileItems,
}: SidebarContentProps) {
  const pathname = usePathname();

  const renderLink = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/student" &&
        item.href !== "/teacher" &&
        pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
          isActive
            ? "text-blue-600 bg-blue-50"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
        )}
        <item.icon
          className={`w-5 h-5 transition-colors ${
            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
          }`}
        />
        {item.label}
        {item.showMessagesBadge && <MessagesBadge />}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 lg:pt-6">
      {/* Brand — desktop only */}
      <div className="mb-6 px-4 items-center gap-3 hidden lg:flex">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
          <RoleIcon className="w-6 h-6" />
        </div>
        <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">
          {brandName}
        </span>
      </div>

      {/* Main menu items — top */}
      <nav className="space-y-1">
        {menuItems.map(renderLink)}
      </nav>

      {/* Profile items + Chiqish — pinned to bottom */}
      <div className="mt-auto pb-8">
        {profileItems.length > 0 && (
          <nav className="space-y-1 mb-2">
            {profileItems.map(renderLink)}
          </nav>
        )}
        <div className="h-px bg-slate-100 my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-bold h-11 px-4"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" /> Chiqish
        </Button>
      </div>
    </div>
  );
}
