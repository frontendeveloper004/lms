"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { NotificationWithDetails } from "@/lib/notification-service";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // SSE — real-time notification count (replaces 30s polling)
  useEffect(() => {
    // Initial fetch
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/teacher/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count ?? 0);
        }
      } catch { /* ignore */ }
    };
    fetchUnreadCount();

    // SSE listener
    const es = new EventSource("/api/messages/sse");
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "notification_new") {
        // DB'dan fresh count olish — badge va panel sinxron bo'ladi
        fetchUnreadCount();
      }
    };
    return () => es.close();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/teacher/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleBellClick = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      fetchNotifications();
      // Badge'ni ham DB'dan yangilash
      fetch("/api/teacher/notifications/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count ?? 0))
        .catch(() => {});
    }
  };

  const handleNotificationClick = async (notification: NotificationWithDetails) => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await fetch(`/api/teacher/notifications/${notification.id}/read`, {
          method: "PATCH",
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently ignore
      }
    }

    setIsOpen(false);

    // Smart routing: if we have courseId + moduleId, go directly to that submission
    const courseId = notification.courseId;
    const moduleId = (notification as any).moduleId;
    const submissionId = notification.referenceId;

    if (notification.type === "COMMENT_REPLY" || notification.type === "COMMENT_MENTION" || notification.type === "COMMENT_LIKED") {
      // Route to course comments section with anchor
      if (courseId && notification.commentId) {
        router.push(`/teacher/courses/${courseId}/comments?comment=${notification.commentId}`);
      } else {
        router.push(`/teacher/submissions`);
      }
    } else if (courseId && moduleId && submissionId) {
      router.push(
        `/teacher/courses/${courseId}/modules/${moduleId}/assignment/submissions?submissionId=${submissionId}`
      );
    } else {
      // Fallback: go to submissions list
      router.push(`/teacher/submissions`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/teacher/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Bildirishnomalar"
      >
        <div className="relative">
          <Bell className="w-6 h-6 text-slate-600" />
          <NotificationBadge count={unreadCount} />
        </div>
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
        />
      )}
    </div>
  );
}
