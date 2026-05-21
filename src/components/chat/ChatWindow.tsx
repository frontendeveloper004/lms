"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, Loader2, ArrowLeft, Pencil, Trash2, Check, X } from "lucide-react";

interface Message {
  id: string;
  text: string;
  senderId: string;
  isEdited: boolean;
  deletedAt: string | null;
  reactions: string | Record<string, string[]>; // DB object yoki JSON string
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface ChatPartner {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string | null;
  role?: "TEACHER" | "STUDENT"; // for profile link
}

interface ChatWindowProps {
  currentUserId: string;
  partner: ChatPartner;
  onBack?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function formatLastSeen(dateStr: string | null) {
  if (!dateStr) return "Oxirgi marta noma'lum";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Hozirgina ko'rindi";
  if (diffMin < 60) return `${diffMin} daqiqa oldin ko'rindi`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} soat oldin ko'rindi`;
  return d.toLocaleDateString("uz-UZ");
}

const UZ_MONTHS = [
  "Yanvar","Fevral","Mart","Aprel","May","Iyun",
  "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr",
];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (same(d, today)) return "Bugun";
  if (same(d, yesterday)) return "Kecha";
  if (d.getFullYear() === today.getFullYear()) return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function parseReactions(raw: string | Record<string, string[]> | null | undefined): Record<string, string[]> {
  if (!raw) return {};
  // Agar allaqachon object bo'lsa — to'g'ridan-to'g'ri qaytaramiz
  if (typeof raw === "object") return raw as Record<string, string[]>;
  // String bo'lsa — parse qilamiz
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

function Avatar({ user, size = 36 }: { user: { name: string; avatar: string | null }; size?: number }) {
  if (user.avatar) {
    return (
      <Image src={user.avatar} alt={user.name} width={size} height={size}
        className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Reaction Picker (fixed, screen-centered) ─────────────────────────────────
const EMOJI_LIST = ["👍","❤️","😂","😮","🔥"];

function ReactionPicker({ onPick, onClose, anchorRect, isMine }: {
  onPick: (e: string) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
  isMine: boolean;
}) {
  const pickerW = 192; // 5 emoji × ~36px + padding
  const pickerH = 52;
  const style: React.CSSProperties = { position: "fixed", zIndex: 9999 };
  if (anchorRect) {
    let left = isMine ? anchorRect.right - pickerW : anchorRect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - pickerW - 8));
    const top = anchorRect.top - pickerH - 8;
    style.left = left;
    style.top = Math.max(8, top);
  }

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div style={style} className="bg-white border border-slate-200 rounded-2xl shadow-2xl px-1.5 py-1.5 flex gap-0.5">
        {EMOJI_LIST.map((e) => (
          <button key={e} onClick={() => { onPick(e); onClose(); }}
            className="text-2xl hover:scale-125 active:scale-110 transition-transform w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 leading-none">
            {e}
          </button>
        ))}
      </div>
    </>
  );
}

// ── Action Menu (fixed, clamped to screen) ────────────────────────────────────
function ActionMenu({ isMine, anchorRect, onReact, onEdit, onDelete, onClose }: {
  isMine: boolean;
  anchorRect: DOMRect | null;
  onReact: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const menuW = 150;
  const style: React.CSSProperties = { position: "fixed", zIndex: 9999 };
  if (anchorRect) {
    let left = isMine ? anchorRect.left - menuW - 8 : anchorRect.right + 8;
    // Clamp horizontally
    if (left < 8) left = anchorRect.right + 8;
    if (left + menuW > window.innerWidth - 8) left = anchorRect.left - menuW - 8;
    left = Math.max(8, left);
    style.left = left;
    style.top = Math.max(8, anchorRect.top);
  }

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div style={{ ...style, minWidth: menuW }} className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
        <button onClick={() => { onReact(); onClose(); }}
          className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
          <span className="text-base">😊</span> Reaksiya
        </button>
        {isMine && (
          <>
            <div className="h-px bg-slate-100" />
            <button onClick={() => { onEdit(); onClose(); }}
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              <Pencil className="w-3.5 h-3.5 text-slate-500" /> Tahrirlash
            </button>
            <div className="h-px bg-slate-100" />
            <button onClick={() => { onDelete(); onClose(); }}
              className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> O'chirish
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
interface BubbleProps {
  msg: Message;
  isMine: boolean;
  isFirstInBlock: boolean;
  isLastInBlock: boolean;
  currentUserId: string;
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

function MessageBubble({ msg, isMine, isFirstInBlock, isLastInBlock, currentUserId, onEdit, onDelete, onReact }: BubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Skip deleted messages entirely
  if (msg.deletedAt) return null;

  const reactions = parseReactions(msg.reactions);
  const hasReactions = Object.keys(reactions).length > 0;

  const topGap = isFirstInBlock ? "mt-3" : "mt-0.5";
  const bubbleRadius = isMine
    ? isLastInBlock ? "rounded-2xl rounded-br-sm" : "rounded-2xl"
    : isLastInBlock ? "rounded-2xl rounded-bl-sm" : "rounded-2xl";

  const handleBubbleClick = () => {
    if (bubbleRef.current) {
      setAnchorRect(bubbleRef.current.getBoundingClientRect());
    }
    setShowActions((v) => !v);
    setShowPicker(false);
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${topGap}`}>
      <div className="relative max-w-[75%] sm:max-w-[65%]">

        {/* Reaction picker — fixed position */}
        {showPicker && (
          <ReactionPicker
            onPick={(e) => onReact(msg.id, e)}
            onClose={() => setShowPicker(false)}
            anchorRect={anchorRect}
            isMine={isMine}
          />
        )}

        {/* Action menu — fixed position */}
        {showActions && (
          <ActionMenu
            isMine={isMine}
            anchorRect={anchorRect}
            onReact={() => setShowPicker(true)}
            onEdit={() => onEdit(msg)}
            onDelete={() => onDelete(msg.id)}
            onClose={() => setShowActions(false)}
          />
        )}

        {/* Bubble */}
        <div
          ref={bubbleRef}
          className={`px-3.5 py-2 ${bubbleRadius} text-sm font-medium leading-relaxed cursor-pointer select-text ${
            isMine
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-800 border border-slate-100 shadow-sm"
          }`}
          onClick={handleBubbleClick}
        >
          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            {msg.isEdited && (
              <span className={`text-[10px] ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                tahrirlangan
              </span>
            )}
            <span className={`text-[10px] leading-none ${isMine ? "text-blue-200" : "text-slate-400"}`}>
              {formatTime(msg.createdAt)}
            </span>
          </div>
        </div>

        {/* Reactions display */}
        {hasReactions && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {Object.entries(reactions).map(([emoji, users]) => {
              const iReacted = (users as string[]).includes(currentUserId);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                    iReacted
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{emoji}</span>
                  {(users as string[]).length > 1 && <span>{(users as string[]).length}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ChatWindow ───────────────────────────────────────────────────────────
export function ChatWindow({ currentUserId, partner, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnerOnline, setPartnerOnline] = useState(partner.isOnline);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?with=${partner.id}`);
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }, [partner.id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // SSE
  useEffect(() => {
    const es = new EventSource("/api/messages/sse");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "new_message") {
        const msg: Message = data.message;

        if (msg.senderId === partner.id) {
          // Partner tomonidan kelgan xabar — duplicate bo'lmasa qo'shamiz
          setMessages((prev) =>
            prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        } else if (msg.senderId === currentUserId) {
          // O'z xabarimiz SSE orqali keldi (in-memory layer)
          // Optimistic temp xabarni real ID bilan almashtirish
          setMessages((prev) => {
            // Allaqachon real ID bilan bor — duplicate, o'tkazib yuboramiz
            if (prev.find((m) => m.id === msg.id)) return prev;
            // Eng yaqin temp xabarni topib almashtirish
            const tempIdx = prev.findIndex((m) => m.id.startsWith("temp-"));
            if (tempIdx !== -1) {
              const next = [...prev];
              next[tempIdx] = msg;
              return next;
            }
            // Temp yo'q — to'g'ridan-to'g'ri qo'shamiz
            return [...prev, msg];
          });
        }
      }

      if (data.type === "message_updated") {
        const msg: Message = data.message;
        // DB dan kelgan haqiqiy holat — to'g'ridan-to'g'ri o'rnatamiz
        setMessages((prev) => prev.map((m) => m.id === msg.id ? msg : m));
      }

      if (data.type === "message_deleted") {
        setMessages((prev) =>
          prev.map((m) => m.id === data.messageId ? { ...m, deletedAt: new Date().toISOString() } : m)
        );
      }

      if (data.type === "online_status" && data.userId === partner.id) {
        setPartnerOnline(data.isOnline);
      }
    };
    return () => es.close();
  }, [partner.id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When editing, populate input
  useEffect(() => {
    if (editingMsg) {
      setText(editingMsg.text);
      inputRef.current?.focus();
    }
  }, [editingMsg]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    if (editingMsg) {
      // Edit mode — optimistic update
      const optimisticEdit: Message = { ...editingMsg, text: trimmed, isEdited: true };
      setMessages((prev) => prev.map((m) => m.id === editingMsg.id ? optimisticEdit : m));
      setEditingMsg(null);

      const res = await fetch(`/api/messages/${editingMsg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      // Agar xato bo'lsa — asl xabarni qaytaramiz
      if (!res.ok) {
        setMessages((prev) => prev.map((m) => m.id === editingMsg.id ? editingMsg : m));
        setText(trimmed);
      }
    } else {
      // Optimistic message — darhol UI ga qo'shamiz
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        text: trimmed,
        senderId: currentUserId,
        isEdited: false,
        deletedAt: null,
        reactions: "{}",
        createdAt: new Date().toISOString(),
        sender: { id: currentUserId, name: "Men", avatar: null },
      };
      setMessages((prev) => [...prev, optimistic]);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partner.id, text: trimmed }),
      });

      if (res.ok) {
        const saved: Message = await res.json();
        // Temp xabarni haqiqiy xabar bilan almashtirish
        setMessages((prev) => prev.map((m) => m.id === tempId ? saved : m));
      } else {
        // Xato — temp xabarni olib tashlaymiz, matnni qaytaramiz
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setText(trimmed);
      }
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleDelete = async (id: string) => {
    // Optimistic — darhol UI dan yashiramiz
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, deletedAt: new Date().toISOString() } : m)
    );
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    // Agar xato bo'lsa — qaytaramiz
    if (!res.ok) {
      setMessages((prev) =>
        prev.map((m) => m.id === id ? { ...m, deletedAt: null } : m)
      );
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    // Optimistic — darhol UI da ko'rsatamiz
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const reactions = parseReactions(m.reactions);
        const users: string[] = reactions[emoji] ?? [];
        const alreadyReacted = users.includes(currentUserId);

        let updated: Record<string, string[]>;
        if (alreadyReacted) {
          const filtered = users.filter((u) => u !== currentUserId);
          updated = { ...reactions };
          if (filtered.length === 0) delete updated[emoji];
          else updated[emoji] = filtered;
        } else {
          // Boshqa emoji lardan olib tashlaymiz
          updated = Object.fromEntries(
            Object.entries(reactions)
              .map(([k, v]) => [k, (v as string[]).filter((u) => u !== currentUserId)])
              .filter(([, v]) => (v as string[]).length > 0)
          );
          updated[emoji] = [...(updated[emoji] ?? []), currentUserId];
        }
        return { ...m, reactions: JSON.stringify(updated) };
      })
    );

    // API ga yuboramiz — SSE orqali real natija keladi
    await fetch(`/api/messages/${id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  };

  const cancelEdit = () => {
    setEditingMsg(null);
    setText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && editingMsg) { cancelEdit(); return; }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Group by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === key) last.messages.push(msg);
    else groupedMessages.push({ date: key, messages: [msg] });
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
        {onBack && (
          <button onClick={onBack}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0 -ml-1"
            aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        {/* Avatar + name — clickable profile link */}
        {(() => {
          const from = encodeURIComponent(`${pathname}?chatWith=${partner.id}`);
          const profileHref = partner.role === "TEACHER"
            ? `/teachers/${partner.id}?from=${from}`
            : partner.role === "STUDENT"
            ? `/students/${partner.id}?from=${from}`
            : null;

          const inner = (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <Avatar user={partner} size={42} />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${partnerOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
              </div>
              <div className="min-w-0">
                <p className={`font-black text-slate-900 text-sm truncate ${profileHref ? "hover:text-blue-600 transition-colors" : ""}`}>
                  {partner.name}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  {partnerOnline ? <span className="text-emerald-500">Onlayn</span> : formatLastSeen(partner.lastSeen)}
                </p>
              </div>
            </div>
          );

          return profileHref ? (
            <Link href={profileHref} className="flex-1 min-w-0">
              {inner}
            </Link>
          ) : (
            <div className="flex-1 min-w-0">{inner}</div>
          );
        })()}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : messages.length === 0 || messages.every((m) => m.deletedAt) ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Avatar user={partner} size={40} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{partner.name} bilan suhbat boshlang</p>
            <p className="text-slate-400 text-xs">Birinchi xabaringizni yuboring</p>
          </div>
        ) : (
          groupedMessages.map((group) => {
            // Guruhda ko'rinadigan (o'chirilmagan) xabarlar bormi?
            const visibleMsgs = group.messages.filter((m) => !m.deletedAt);
            if (visibleMsgs.length === 0) return null; // Bo'sh kun — ko'rsatmaymiz

            return (
              <div key={group.date}>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-bold text-slate-400 px-2">
                    {formatDateLabel(group.messages[0].createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                {group.messages.map((msg, idx) => {
                  const isMine = msg.senderId === currentUserId;
                  const prev = group.messages[idx - 1];
                  const next = group.messages[idx + 1];
                  const isFirstInBlock = !prev || prev.senderId !== msg.senderId;
                  const isLastInBlock = !next || next.senderId !== msg.senderId;
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isMine={isMine}
                      isFirstInBlock={isFirstInBlock}
                      isLastInBlock={isLastInBlock}
                      currentUserId={currentUserId}
                      onEdit={setEditingMsg}
                      onDelete={handleDelete}
                      onReact={handleReact}
                    />
                  );
                })}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Edit banner */}
      {editingMsg && (
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-t border-blue-100">
          <Pencil className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-blue-600">Xabarni tahrirlash</p>
            <p className="text-xs text-slate-500 truncate">{editingMsg.text}</p>
          </div>
          <button onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={editingMsg ? "Yangi matn kiriting..." : "Xabar yozing..."}
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 resize-none outline-none py-1 font-medium leading-relaxed"
            style={{ lineHeight: "1.5", minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
            aria-label="Yuborish"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : editingMsg ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
