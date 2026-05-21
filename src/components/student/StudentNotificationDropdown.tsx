import { NotificationWithDetails } from "@/lib/notification-service";
import { StudentNotificationItem } from "./StudentNotificationItem";

interface StudentNotificationDropdownProps {
  notifications: NotificationWithDetails[];
  isLoading: boolean;
  onMarkAllRead: () => void;
  onNotificationClick: (n: NotificationWithDetails) => void;
}

export function StudentNotificationDropdown({
  notifications,
  isLoading,
  onMarkAllRead,
  onNotificationClick,
}: StudentNotificationDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">Bildirishnomalar</h3>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Barchasini o&apos;qilgan deb belgilash
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[360px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <span className="text-2xl mb-2">🔔</span>
            <p className="text-sm font-medium">Bildirishnomalar yo&apos;q</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <StudentNotificationItem
                key={notification.id}
                notification={notification}
                onClick={onNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
