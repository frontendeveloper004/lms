import prisma from '@/lib/prisma';
import { notifyUser } from '@/app/api/messages/sse/route';

export interface CreateNotificationInput {
  type: string;
  recipientId: string;
  senderId: string;
  referenceId: string;
}

export interface NotificationWithDetails {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  referenceId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  courseTitle?: string;
  assignmentTitle?: string;
  taskType?: string;
  score?: number | null;
  feedback?: string | null;
  // Navigation helpers
  courseId?: string;
  moduleId?: string;
  assignmentId?: string;
  // Comment navigation
  commentId?: string;
  commentText?: string;
}

export class NotificationService {
  /**
   * Creates a new Notification record in the database.
   */
  async createNotification(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        type: input.type,
        recipientId: input.recipientId,
        senderId: input.senderId,
        referenceId: input.referenceId,
        isRead: false,
      },
    });

    // Push real-time event to recipient via SSE
    notifyUser(input.recipientId, {
      type: 'notification_new',
      notificationId: notification.id,
    });

    return notification;
  }

  /**
   * Returns the count of unread notifications for the given user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  /**
   * Returns the most recent notifications (default limit 20) with all related
   * data fetched in BATCH queries — N+1 muammosi hal qilindi.
   *
   * Eski yondashuv: har bir notification uchun alohida DB query (20 notification = 20+ query)
   * Yangi yondashuv: notification turlariga qarab guruhlash + bitta findMany per type
   */
  async getNotifications(
    userId: string,
    limit = 20
  ): Promise<NotificationWithDetails[]> {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (notifications.length === 0) return [];

    // ── Notification turlariga qarab referenceId'larni guruhlash ─────────────
    const submissionIds: string[] = [];
    const certificateIds: string[] = [];
    const commentIds: string[] = [];

    for (const n of notifications) {
      if (n.type === 'ASSIGNMENT_SUBMITTED' || n.type === 'ASSIGNMENT_GRADED') {
        submissionIds.push(n.referenceId);
      } else if (n.type === 'COURSE_COMPLETED') {
        certificateIds.push(n.referenceId);
      } else if (
        n.type === 'COMMENT_REPLY' ||
        n.type === 'COMMENT_MENTION' ||
        n.type === 'COMMENT_LIKED'
      ) {
        commentIds.push(n.referenceId);
      }
    }

    // ── Batch queries — har tur uchun bitta query ─────────────────────────────
    const [submissions, certificates, comments] = await Promise.all([
      submissionIds.length > 0
        ? prisma.assignmentSubmission.findMany({
            where: { id: { in: submissionIds } },
            select: {
              id: true,
              score: true,
              feedback: true,
              assignmentId: true,
              assignment: {
                select: {
                  id: true,
                  title: true,
                  moduleId: true,
                  taskType: true,
                  module: {
                    select: {
                      id: true,
                      course: { select: { id: true, title: true } },
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve([]),

      certificateIds.length > 0
        ? prisma.certificate.findMany({
            where: { id: { in: certificateIds } },
            select: {
              id: true,
              course: { select: { title: true } },
            },
          })
        : Promise.resolve([]),

      commentIds.length > 0
        ? prisma.courseComment.findMany({
            where: { id: { in: commentIds } },
            select: {
              id: true,
              text: true,
              course: { select: { id: true, title: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    // ── Lookup map'lar — O(1) access ──────────────────────────────────────────
    const submissionMap = new Map(submissions.map((s) => [s.id, s]));
    const certificateMap = new Map(certificates.map((c) => [c.id, c]));
    const commentMap = new Map(comments.map((c) => [c.id, c]));

    // ── Natijalarni yig'ish ───────────────────────────────────────────────────
    return notifications.map((notification) => {
      const base: NotificationWithDetails = {
        id: notification.id,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        referenceId: notification.referenceId,
        sender: {
          id: notification.sender.id,
          name: notification.sender.name,
          avatar: notification.sender.avatar,
        },
      };

      if (
        notification.type === 'ASSIGNMENT_SUBMITTED' ||
        notification.type === 'ASSIGNMENT_GRADED'
      ) {
        const submission = submissionMap.get(notification.referenceId);
        if (submission) {
          base.courseTitle = submission.assignment.module.course.title;
          base.assignmentTitle = submission.assignment.title;
          base.taskType = submission.assignment.taskType;
          base.courseId = submission.assignment.module.course.id;
          base.assignmentId = submission.assignmentId;
          base.moduleId = submission.assignment.moduleId;
          if (notification.type === 'ASSIGNMENT_GRADED') {
            base.score = submission.score;
            base.feedback = submission.feedback;
          }
        }
      } else if (notification.type === 'COURSE_COMPLETED') {
        const certificate = certificateMap.get(notification.referenceId);
        if (certificate) {
          base.courseTitle = certificate.course.title;
        }
      } else if (
        notification.type === 'COMMENT_REPLY' ||
        notification.type === 'COMMENT_MENTION' ||
        notification.type === 'COMMENT_LIKED'
      ) {
        const comment = commentMap.get(notification.referenceId);
        if (comment) {
          base.courseTitle = comment.course.title;
          base.courseId = comment.course.id;
          base.commentId = comment.id;
          base.commentText = comment.text.slice(
            0,
            notification.type === 'COMMENT_LIKED' ? 80 : 100
          );
        }
      }

      return base;
    });
  }

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Bildirishnoma topilmadi');
    }

    if (notification.recipientId !== userId) {
      throw new Error('Ruxsat etilmagan');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all unread notifications for the given user as read.
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return result.count;
  }
}

export const notificationService = new NotificationService();
