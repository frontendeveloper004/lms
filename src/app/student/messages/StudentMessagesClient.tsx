"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, GraduationCap } from "lucide-react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  specialization?: string | null;
  lastMessage?: { text: string; createdAt: string; senderId: string } | null;
  unreadCount?: number;
}

interface StudentMessagesClientProps {
  currentUserId: string;
}

export function StudentMessagesClient({ currentUserId }: StudentMessagesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatWithId = searchParams.get("chatWith");

  const [teachers, setTeachers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<
    Map<string, { lastMessage: ChatUser["lastMessage"]; unreadCount: number }>
  >(new Map());
  const [selectedTeacher, setSelectedTeacher] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Mobile: "list" | "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const fetchData = useCallback(async () => {
    const [teachersRes, convsRes] = await Promise.all([
      fetch("/api/student/chat-teachers"),
      fetch("/api/messages/conversations"),
    ]);
    const teachersData: ChatUser[] = teachersRes.ok ? await teachersRes.json() : [];
    const convsData: {
      partner: ChatUser;
      lastMessage: ChatUser["lastMessage"];
      unreadCount: number;
    }[] = convsRes.ok ? await convsRes.json() : [];

    const convMap = new Map<
      string,
      { lastMessage: ChatUser["lastMessage"]; unreadCount: number }
    >();
    convsData.forEach((c) => {
      convMap.set(c.partner.id, {
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount,
      });
    });
    setConversations(convMap);
    setTeachers(teachersData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Auto-open chat if ?chatWith= param is present (coming back from profile)
  useEffect(() => {
    if (!chatWithId || loading || teachers.length === 0) return;
    const target = teachers.find((t) => t.id === chatWithId);
    if (target && (!selectedTeacher || selectedTeacher.id !== chatWithId)) {
      setSelectedTeacher(target);
      setMobileView("chat");
    }
  }, [chatWithId, loading, teachers, selectedTeacher]);

  const enrichedTeachers: ChatUser[] = teachers.map((t) => {
    const conv = conversations.get(t.id);
    return {
      ...t,
      lastMessage: conv?.lastMessage ?? null,
      unreadCount: conv?.unreadCount ?? 0,
    };
  });

  enrichedTeachers.sort((a, b) => {
    if (a.lastMessage && !b.lastMessage) return -1;
    if (!a.lastMessage && b.lastMessage) return 1;
    if (a.lastMessage && b.lastMessage) {
      return (
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
      );
    }
    return 0;
  });

  const handleSelectTeacher = (teacher: ChatUser) => {
    setSelectedTeacher(teacher);
    setMobileView("chat");
    setConversations((prev) => {
      const next = new Map(prev);
      const existing = next.get(teacher.id);
      if (existing) next.set(teacher.id, { ...existing, unreadCount: 0 });
      return next;
    });
  };

  const handleBack = () => {
    setMobileView("list");
    setSelectedTeacher(null);
    // Clear ?chatWith= param so auto-open effect doesn't re-trigger
    router.replace("/student/messages", { scroll: false });
  };

  const totalUnread = enrichedTeachers.reduce(
    (sum, t) => sum + (t.unreadCount ?? 0),
    0
  );

  // ── Sidebar / list panel ──────────────────────────────────────────────────
  const listPanel = (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h1 className="font-black text-slate-900 text-lg">Xabarlar</h1>
          {totalUnread > 0 && (
            <span className="ml-auto min-w-[22px] h-[22px] rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center px-1.5">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          O'qituvchilaringiz bilan muloqot
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Yuklanmoqda...</p>
          </div>
        </div>
      ) : enrichedTeachers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm font-bold">O'qituvchilar yo'q</p>
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            Biror kursga yozilgach, o'qituvchilaringiz bu yerda ko'rinadi
          </p>
        </div>
      ) : (
        <ConversationList
          users={enrichedTeachers}
          selectedId={selectedTeacher?.id ?? null}
          onSelect={handleSelectTeacher}
          currentUserId={currentUserId}
          emptyText="O'qituvchi topilmadi"
        />
      )}
    </div>
  );

  // ── Chat panel ────────────────────────────────────────────────────────────
  const chatPanel = selectedTeacher ? (
    <ChatWindow
      key={selectedTeacher.id}
      currentUserId={currentUserId}
      partner={{ ...selectedTeacher, role: "TEACHER" }}
      onBack={handleBack}
    />
  ) : (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50/50">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-blue-400" />
      </div>
      <div className="text-center">
        <p className="font-black text-slate-700 text-lg">Suhbat tanlang</p>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Chap paneldan o'qituvchini tanlang va muloqotni boshlang
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE (< lg) — full-screen single view ── */}
      <div className="lg:hidden flex flex-col h-[calc(100dvh-64px)] bg-white overflow-hidden">
        {mobileView === "list" ? (
          <div className="flex flex-col h-full">{listPanel}</div>
        ) : (
          <div className="flex flex-col h-full">{chatPanel}</div>
        )}
      </div>

      {/* ── DESKTOP (≥ lg) — side-by-side ── */}
      <div className="hidden lg:flex h-[calc(100vh-57px)] bg-white">
        {/* Left panel */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100">
          {listPanel}
        </div>
        {/* Right panel */}
        <div className="flex-1 flex flex-col">{chatPanel}</div>
      </div>
    </>
  );
}
