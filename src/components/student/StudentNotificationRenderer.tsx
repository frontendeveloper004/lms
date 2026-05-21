import { NotificationWithDetails } from "@/lib/notification-service";

interface RendererProps {
  notification: NotificationWithDetails;
}

import { BookOpen, Headphones, PenTool, Type, FileText } from "lucide-react";

function getTaskIcon(taskType?: string) {
  if (!taskType) return <FileText className="w-3.5 h-3.5 inline-block mr-1 text-slate-400" />;
  if (taskType.includes("READING")) return <BookOpen className="w-3.5 h-3.5 inline-block mr-1 text-slate-400" />;
  if (taskType.includes("LISTENING")) return <Headphones className="w-3.5 h-3.5 inline-block mr-1 text-slate-400" />;
  if (taskType.includes("WRITING")) return <PenTool className="w-3.5 h-3.5 inline-block mr-1 text-slate-400" />;
  return <Type className="w-3.5 h-3.5 inline-block mr-1 text-slate-400" />;
}

function AssignmentGradedRenderer({ notification }: RendererProps) {
  const assignmentTitle = notification.assignmentTitle ?? "";
  const score = notification.score ?? 0;
  const feedback = notification.feedback;
  const courseTitle = notification.courseTitle ?? "";
  const taskType = notification.taskType;

  return (
    <div>
      <span>
        ✅ <strong>{score}/100 ball</strong>
      </span>
      <p className="text-xs text-slate-700 truncate mt-0.5 font-semibold flex items-center">
        {getTaskIcon(taskType)}
        <span>{assignmentTitle}</span>
      </p>
      {courseTitle && (
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate mt-1">KURS: {courseTitle}</p>
      )}
      {feedback && (
        <p className="text-xs text-slate-500 mt-0.5 truncate italic">"{feedback}"</p>
      )}
    </div>
  );
}

function CourseCompletedRenderer({ notification }: RendererProps) {
  const courseTitle = notification.courseTitle ?? "";

  return (
    <span>
      🎓 <strong>{courseTitle}</strong> kursini muvaffaqiyatli yakunladingiz!
    </span>
  );
}

function CommentReplyRenderer({ notification }: RendererProps) {
  const senderName = notification.sender.name;
  const courseTitle = notification.courseTitle ?? "";
  const text = notification.commentText ?? "";

  return (
    <div>
      <span>
        💬 <strong>{senderName}</strong> — izohingizga javob berdi
      </span>
      {courseTitle && (
        <p className="text-xs text-slate-500 truncate mt-0.5">{courseTitle}</p>
      )}
      {text && (
        <p className="text-xs text-slate-400 truncate mt-0.5 italic">&ldquo;{text}&rdquo;</p>
      )}
    </div>
  );
}

function CommentMentionRenderer({ notification }: RendererProps) {
  const senderName = notification.sender.name;
  const courseTitle = notification.courseTitle ?? "";
  const text = notification.commentText ?? "";

  return (
    <div>
      <span>
        🔔 <strong>{senderName}</strong> — sizni izohda eslatdi
      </span>
      {courseTitle && (
        <p className="text-xs text-slate-500 truncate mt-0.5">{courseTitle}</p>
      )}
      {text && (
        <p className="text-xs text-slate-400 truncate mt-0.5 italic">&ldquo;{text}&rdquo;</p>
      )}
    </div>
  );
}

function CommentLikedRenderer({ notification }: RendererProps) {
  const senderName = notification.sender.name;
  const courseTitle = notification.courseTitle ?? "";
  const text = notification.commentText ?? "";

  return (
    <div>
      <span>
        👍 <strong>{senderName}</strong> — izohingizni yoqtirdi
      </span>
      {courseTitle && (
        <p className="text-xs text-slate-500 truncate mt-0.5">{courseTitle}</p>
      )}
      {text && (
        <p className="text-xs text-slate-400 truncate mt-0.5 italic">&ldquo;{text}&rdquo;</p>
      )}
    </div>
  );
}

function DefaultRenderer({ notification }: RendererProps) {
  return (
    <span>
      🔔 {notification.sender.name} — {notification.type}
    </span>
  );
}

const renderers: Record<string, React.ComponentType<RendererProps>> = {
  ASSIGNMENT_GRADED: AssignmentGradedRenderer,
  COURSE_COMPLETED: CourseCompletedRenderer,
  COMMENT_REPLY: CommentReplyRenderer,
  COMMENT_MENTION: CommentMentionRenderer,
  COMMENT_LIKED: CommentLikedRenderer,
};

interface StudentNotificationRendererProps {
  notification: NotificationWithDetails;
}

export function StudentNotificationRenderer({
  notification,
}: StudentNotificationRendererProps) {
  const Renderer = renderers[notification.type] ?? DefaultRenderer;
  return <Renderer notification={notification} />;
}
