import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "sonner";

import { Navbar } from "@/components/navbar";
import { NavbarWrapper } from "@/components/navbar-wrapper";
import { FooterWrapper } from "@/components/footer-wrapper";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Ai.Dargoh - Zamonaviy Ta'lim Platformasi",
  description: "Dasturlash, dizayn va boshqa zamonaviy kasblarni biz bilan o'rganing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <Toaster position="top-right" richColors />
        <div className="flex min-h-screen flex-col">
          <NavbarWrapper>
            <Navbar />
          </NavbarWrapper>
          <main className="flex-1">
            {children}
          </main>
          <FooterWrapper />
        </div>
      </body>
    </html>
  );
}
