"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageCircle, ThumbsUp, Reply, Pin, Trash2,
  Edit2, Check, X, ChevronDown, Loader2, Send,
  ShieldCheck, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/ui/premium-modal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommentAuthor {
  id: string;
  name: string;
  avatar: string | null;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

interface CommentData {
  id: string;
  text: string;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
  author: CommentAuthor;
  likedByMe: boolean;
  likesCount: number;
  replies: ReplyData[];
}

interface ReplyData {
  id: string;
  text: string;
  isEdited: boolean;
  createdAt: string;
  author: CommentAuthor;
  likedByMe: boolean;
  likesCount: number;
}

interface CourseCommentsProps {
  courseId: string;
  currentUserId: string;
  currentUserRole: "STUDENT" | "TEACHER" | "ADMIN";
  teacherId: string;
  /** If true, show toggle switch (teacher view) */
  showToggle?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Hozirgina";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return new Date(dateStr).toLocaleDateString("uz-UZ");
}

function Avatar({ author, size = "md" }: { author: CommentAuthor; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const colors: Record<string, string> = {
    TEACHER: "bg-blue-600",
    ADMIN: "bg-violet-600",
    STUDENT: "bg-slate-400",
  };
  return (
    <div className={`${sz} rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-black ${colors[author.role]}`}>
      {author.avatar
        ? <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
        : author.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function CourseCommentsInner({
  courseId,
  currentUserId,
  currentUserRole,
  teacherId,
  showToggle = false,
}: CourseCommentsProps) {
  const searchParams = useSearchParams();
  const highlightCommentId = searchParams.get("comment");

  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [newText, setNewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Delete confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    commentId: string;
    isReply: boolean;
    parentId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const highlightRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch comments ──────────────────────────────────────────────────────────
  const fetchComments = useCallback(async (p = 1, append = false) => {
    if (p === 1) setIsLoading(true); else setIsLoadingMore(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/comments?page=${p}`);
      if (!res.ok) return;
      const data = await res.json();
      setCommentsEnabled(data.commentsEnabled);
      setTotalPages(data.totalPages);
      setPage(p);
      if (append) {
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [courseId]);

  useEffect(() => { fetchComments(1); }, [fetchComments]);

  // ── SSE — real-time comment updates ────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource("/api/messages/sse");

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      // Only handle events for this course
      if (data.courseId && data.courseId !== courseId) return;

      if (data.type === "comment_new") {
        const incoming = data.comment;
        if (!incoming) return;
        if (incoming.parentId) {
          // It's a reply — add to parent
          setComments((prev) =>
            prev.map((c) =>
              c.id === incoming.parentId
                ? { ...c, replies: [...c.replies, { ...incoming, likedByMe: false }] }
                : c
            )
          );
          setExpandedReplies((prev) => new Set([...prev, incoming.parentId]));
        } else {
          // Top-level comment — prepend
          setComments((prev) => {
            if (prev.find((c) => c.id === incoming.id)) return prev;
            return [{ ...incoming, likedByMe: false, replies: incoming.replies ?? [] }, ...prev];
          });
        }
      }

      if (data.type === "comment_updated") {
        const updated = data.comment;
        if (!updated) return;
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === updated.id) return { ...c, text: updated.text, isEdited: true };
            // Check replies
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === updated.id ? { ...r, text: updated.text, isEdited: true } : r
              ),
            };
          })
        );
      }

      if (data.type === "comment_liked") {
        const { commentId: cid, parentId, likesCount } = data;
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    replies: c.replies.map((r) =>
                      r.id === cid ? { ...r, likesCount } : r
                    ),
                  }
                : c
            )
          );
        } else {
          setComments((prev) =>
            prev.map((c) => (c.id === cid ? { ...c, likesCount } : c))
          );
        }
      }

      if (data.type === "comment_deleted") {
        const { commentId: cid, parentId } = data;
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: c.replies.filter((r) => r.id !== cid) }
                : c
            )
          );
        } else {
          setComments((prev) => prev.filter((c) => c.id !== cid));
        }
      }
    };

    return () => es.close();
  }, [courseId]);

  // Scroll to highlighted comment
  useEffect(() => {
    if (highlightCommentId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [highlightCommentId, comments]);

  // ── Toggle comments (teacher) ───────────────────────────────────────────────
  const handleToggle = async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/comments-toggle`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setCommentsEnabled(data.commentsEnabled);
      }
    } catch { /* ignore */ }
  };

  // ── Post comment ────────────────────────────────────────────────────────────
  const handlePost = async () => {
    const text = newText.trim();
    if (!text || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setNewText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Post reply ──────────────────────────────────────────────────────────────
  const handleReply = async (parentId: string) => {
    const text = replyText.trim();
    if (!text || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentId }),
      });
      if (res.ok) {
        const reply = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...c.replies, reply] }
              : c
          )
        );
        setReplyText("");
        setReplyingTo(null);
        setExpandedReplies((prev) => new Set([...prev, parentId]));
      }
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleLike = async (commentId: string, isReply = false, parentId?: string) => {
    const res = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like" }),
    });
    if (!res.ok) return;
    const data = await res.json();

    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? { ...r, likedByMe: data.liked, likesCount: data.likesCount }
                    : r
                ),
              }
            : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likedByMe: data.liked, likesCount: data.likesCount }
            : c
        )
      );
    }
  };

  // ── Pin ─────────────────────────────────────────────────────────────────────
  const handlePin = async (commentId: string) => {
    const res = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pin" }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isPinned: data.isPinned } : c))
    );
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (commentId: string, isReply = false, parentId?: string) => {
    const text = editText.trim();
    if (!text) return;
    const res = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text }),
    });
    if (!res.ok) return;
    const updated = await res.json();

    if (isReply && parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, text: updated.text, isEdited: true } : r
                ),
              }
            : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, text: updated.text, isEdited: true } : c
        )
      );
    }
    setEditingId(null);
    setEditText("");
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (commentId: string, isReply = false, parentId?: string) => {
    setDeleteTarget({ commentId, isReply, parentId });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { commentId, isReply, parentId } = deleteTarget;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) return;

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const isTeacher = currentUserId === teacherId;

  // ── Render single comment/reply ─────────────────────────────────────────────
  const renderComment = (
    comment: CommentData | ReplyData,
    isReply = false,
    parentId?: string
  ) => {
    const isHighlighted = comment.id === highlightCommentId;
    const isOwner = comment.author.id === currentUserId;
    const canDelete = isOwner || isTeacher || currentUserRole === "ADMIN";
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        id={`comment-${comment.id}`}
        ref={isHighlighted ? highlightRef : undefined}
        className={`flex gap-3 group transition-colors duration-500 ${
          isHighlighted ? "bg-blue-50 rounded-xl px-3 py-2 -mx-3" : ""
        } ${isReply ? "ml-10 mt-3" : ""}`}
      >
        <Avatar author={comment.author} size={isReply ? "sm" : "md"} />

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-black text-slate-900">{comment.author.name}</span>
            {comment.author.role === "TEACHER" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100">
                <ShieldCheck className="w-3 h-3" /> O&apos;qituvchi
              </span>
            )}
            {!isReply && (comment as CommentData).isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100">
                <Pin className="w-3 h-3" /> Mustahkamlangan
              </span>
            )}
            {comment.isEdited && (
              <span className="text-[10px] text-slate-400">(tahrirlangan)</span>
            )}
            <span className="text-[11px] text-slate-400 ml-auto">{relativeTime(comment.createdAt)}</span>
          </div>

          {/* Text or edit form */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-8 px-3 rounded-lg text-xs font-black gap-1"
                  onClick={() => handleEdit(comment.id, isReply, parentId)}>
                  <Check className="w-3 h-3" /> Saqlash
                </Button>
                <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs font-black gap-1"
                  onClick={() => { setEditingId(null); setEditText(""); }}>
                  <X className="w-3 h-3" /> Bekor
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
          )}

          {/* Actions — always visible, compact on mobile */}
          {!isEditing && (
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
              {/* Like */}
              <button
                onClick={() => handleLike(comment.id, isReply, parentId)}
                className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                  comment.likedByMe ? "text-blue-600" : "text-slate-400 hover:text-blue-600"
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${comment.likedByMe ? "fill-blue-600" : ""}`} />
                {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
              </button>

              {/* Reply (only on top-level) */}
              {!isReply && commentsEnabled && (
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText("");
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Javob</span>
                </button>
              )}

              {/* Reply button inside a reply — routes to parent */}
              {isReply && commentsEnabled && parentId && (
                <button
                  onClick={() => {
                    setReplyingTo(replyingTo === parentId ? null : parentId);
                    setReplyText(`@${comment.author.name} `);
                    setExpandedReplies((prev) => new Set([...prev, parentId]));
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Javob</span>
                </button>
              )}

              {/* Pin (teacher only, top-level only) */}
              {!isReply && isTeacher && (
                <button
                  onClick={() => handlePin(comment.id)}
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                    (comment as CommentData).isPinned
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-slate-400 hover:text-amber-500"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {(comment as CommentData).isPinned ? "Mustahkamdan chiqar" : "Mustahkamlash"}
                  </span>
                </button>
              )}

              {/* Edit (own comment) */}
              {isOwner && (
                <button
                  onClick={() => { setEditingId(comment.id); setEditText(comment.text); }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tahrir</span>
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id, isReply, parentId)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">O&apos;chirish</span>
                </button>
              )}
            </div>
          )}

          {/* Reply input */}
          {!isReply && replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Javob yozing..."
                className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply(comment.id);
                }}
              />
              <div className="flex flex-col gap-1.5">
                <Button size="sm" className="h-8 w-8 p-0 rounded-lg"
                  disabled={!replyText.trim() || isSubmittingReply}
                  onClick={() => handleReply(comment.id)}>
                  {isSubmittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {!isReply && (comment as CommentData).replies.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() =>
                  setExpandedReplies((prev) => {
                    const next = new Set(prev);
                    if (next.has(comment.id)) next.delete(comment.id);
                    else next.add(comment.id);
                    return next;
                  })
                }
                className="flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.has(comment.id) ? "rotate-180" : ""}`} />
                {expandedReplies.has(comment.id)
                  ? "Javoblarni yashirish"
                  : `${(comment as CommentData).replies.length} ta javob`}
              </button>

              {expandedReplies.has(comment.id) && (
                <div className="mt-1 space-y-1">
                  {(comment as CommentData).replies.map((reply) =>
                    renderComment(reply, true, comment.id)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="font-black text-slate-900 text-base">Izohlar</h2>
          {!commentsEnabled && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black">
              O&apos;chirilgan
            </span>
          )}
        </div>

        {/* Teacher toggle */}
        {showToggle && (
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              commentsEnabled ? "bg-blue-600" : "bg-slate-200"
            }`}
            title={commentsEnabled ? "Izohlarni o'chirish" : "Izohlarni yoqish"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                commentsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        )}
      </div>

      {/* New comment input */}
      {commentsEnabled && (
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Izoh yozing... (@ism bilan eslatish mumkin)"
              className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost();
              }}
            />
            <Button
              className="self-end h-10 px-4 rounded-xl font-black text-xs gap-1.5"
              disabled={!newText.trim() || isSubmitting}
              onClick={handlePost}
            >
              {isSubmitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Send className="w-4 h-4" /> Yuborish</>}
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Ctrl+Enter — tez yuborish</p>
        </div>
      )}

      {/* Comments list */}
      <div className="px-6 py-4 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {commentsEnabled
                ? "Hali izoh yo'q. Birinchi bo'lib yozing!"
                : "Izohlar o'chirilgan."}
            </p>
          </div>
        ) : (
          comments.map((c) => renderComment(c))
        )}

        {/* Load more */}
        {page < totalPages && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              className="h-9 px-5 rounded-xl text-xs font-black gap-2"
              disabled={isLoadingMore}
              onClick={() => fetchComments(page + 1, true)}
            >
              {isLoadingMore
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><ChevronDown className="w-4 h-4" /> Ko&apos;proq yuklash</>}
            </Button>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      <PremiumModal
        isOpen={!!deleteTarget}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        title="Izohni o'chirish"
        description="Ushbu izohni o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi."
        icon={<AlertTriangle className="w-8 h-8 text-red-500" />}
      >
        <div className="space-y-3">
          <Button
            type="button"
            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white border-0"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Trash2 className="w-4 h-4 mr-2" /> Ha, o&apos;chirish</>}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full h-11 rounded-2xl font-black text-slate-500 hover:text-slate-900 text-xs uppercase tracking-widest"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Bekor qilish
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}

// ── Public export wrapped in Suspense ─────────────────────────────────────────
export function CourseComments(props: CourseCommentsProps) {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    }>
      <CourseCommentsInner {...props} />
    </Suspense>
  );
}
