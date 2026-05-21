"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, X, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { NotificationWithDetails } from "@/lib/notification-service";
import { NotificationBadge } from "@/components/teacher/NotificationBadge";
import { StudentNotificationDropdown } from "./StudentNotificationDropdown";

interface CongratsModalProps {
  courseTitle: string;
  certificateId: string;
  onClose: () => void;
}

function CongratsModal({ courseTitle, certificateId, onClose }: CongratsModalProps) {
  const router = useRouter();

  useEffect(() => {
    // Lock body scroll on mobile
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    // Fire confetti animation
    const end = Date.now() + 2500;
    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-sm w-full text-center">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Tabriklaymiz! 🎓
        </h2>

        {/* Course name */}
        <p className="text-sm text-slate-600 mb-6">
          <strong className="text-slate-900">{courseTitle}</strong> kursini
          muvaffaqiyatli yakunladingiz!
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(`/student/certificates/${certificateId}`);
            }}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-colors"
          >
            Sertifikatni Ko&apos;rish
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function StudentNotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [congratsModal, setCongratsModal] = useState<{
    courseTitle: string;
    certificateId: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // SSE — real-time notification count (replaces 30s polling)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/student/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count ?? 0);
        }
      } catch { /* ignore */ }
    };
    fetchUnreadCount();

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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/student/notifications");
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
      fetch("/api/student/notifications/unread-count")
        .then((r) => r.json())
        .then((d) => setUnreadCount(d.count ?? 0))
        .catch(() => {});
    }
  };

  const handleNotificationClick = async (
    notification: NotificationWithDetails
  ) => {
    // Mark as read via API
    if (!notification.isRead) {
      try {
        await fetch(`/api/student/notifications/${notification.id}`, {
          method: "PATCH",
        });
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently ignore
      }
    }

    setIsOpen(false);

    if (notification.type === "ASSIGNMENT_GRADED") {
      // Navigate directly to the assignment page
      if (notification.courseId && notification.assignmentId) {
        router.push(`/student/courses/${notification.courseId}/assignments/${notification.assignmentId}`);
      } else {
        router.push("/student");
      }
    } else if (notification.type === "COURSE_COMPLETED") {
      // Show congratulations modal with confetti
      // referenceId is the Certificate ID
      const courseTitle = notification.courseTitle ?? "Kurs";
      const certificateId = notification.referenceId;
      setCongratsModal({ courseTitle, certificateId });
    } else if (
      notification.type === "COMMENT_REPLY" ||
      notification.type === "COMMENT_MENTION" ||
      notification.type === "COMMENT_LIKED"
    ) {
      // Route to course lesson page with comment anchor
      if (notification.courseId && notification.commentId) {
        router.push(
          `/student/courses/${notification.courseId}/comments?comment=${notification.commentId}`
        );
      } else {
        router.push("/student");
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/student/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    }
  };

  return (
    <>
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
          <StudentNotificationDropdown
            notifications={notifications}
            isLoading={isLoading}
            onMarkAllRead={handleMarkAllRead}
            onNotificationClick={handleNotificationClick}
          />
        )}
      </div>

      {congratsModal && (
        <CongratsModal
          courseTitle={congratsModal.courseTitle}
          certificateId={congratsModal.certificateId}
          onClose={() => setCongratsModal(null)}
        />
      )}
    </>
  );
}
