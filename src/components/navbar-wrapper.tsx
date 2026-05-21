"use client";

import { usePathname } from "next/navigation";

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide global navbar on Admin, Teacher, Student, and Auth routes
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/teacher") ||
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register")
  ) {
    return null;
  }

  return <>{children}</>;
}
