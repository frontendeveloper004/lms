import { NotificationWithDetails } from "@/lib/notification-service";
import { formatRelativeTime } from "@/lib/notification-utils";
import { StudentNotificationRenderer } from "./StudentNotificationRenderer";

interface StudentNotificationItemProps {
  notification: NotificationWithDetails;
  onClick: (n: NotificationWithDetails) => void;
}

export function StudentNotificationItem({
  notification,
  onClick,
}: StudentNotificationItemProps) {
  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full text-left px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0 ${
        isUnread
          ? "bg-blue-50 border-l-2 border-l-blue-500"
          : "bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 text-sm font-black text-slate-900">
          <StudentNotificationRenderer notification={notification} />
        </div>
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 mt-0.5">
          {formatRelativeTime(new Date(notification.createdAt))}
        </span>
      </div>
      {isUnread && (
        <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
