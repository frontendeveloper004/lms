"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useState } from "react";

interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  lastMessage?: { text: string; createdAt: string; senderId: string } | null;
  unreadCount?: number;
}

interface ConversationListProps {
  users: ChatUser[];
  selectedId: string | null;
  onSelect: (user: ChatUser) => void;
  currentUserId: string;
  emptyText?: string;
}

function Avatar({ user, size = 44 }: { user: { name: string; avatar: string | null }; size?: number }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatPreviewTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Hozir";
  if (diffMin < 60) return `${diffMin}d`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}s`;
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
}

export function ConversationList({
  users,
  selectedId,
  onSelect,
  currentUserId,
  emptyText = "Hech kim yo'q",
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      {/* Search */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-300 transition-colors">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none font-medium"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
            <p className="text-slate-400 text-sm font-medium">{emptyText}</p>
          </div>
        ) : (
          filtered.map((user) => {
            const isSelected = selectedId === user.id;
            const hasUnread = (user.unreadCount ?? 0) > 0;

            return (
              <button
                key={user.id}
                onClick={() => onSelect(user)}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-colors text-left active:bg-slate-100 ${
                  isSelected
                    ? "bg-blue-50 border-r-2 border-blue-600"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Avatar + online dot */}
                <div className="relative flex-shrink-0">
                  <Avatar user={user} size={44} />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={`text-sm truncate ${
                        hasUnread ? "font-black text-slate-900" : "font-bold text-slate-700"
                      }`}
                    >
                      {user.name}
                    </p>
                    {user.lastMessage && (
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                        {formatPreviewTime(user.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-xs text-slate-400 truncate font-medium">
                      {user.lastMessage ? (
                        <>
                          {user.lastMessage.senderId === currentUserId && (
                            <span className="text-slate-500">Siz: </span>
                          )}
                          {user.lastMessage.text}
                        </>
                      ) : (
                        <span className="italic">Xabar yo'q</span>
                      )}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center px-1">
                        {user.unreadCount! > 99 ? "99+" : user.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
