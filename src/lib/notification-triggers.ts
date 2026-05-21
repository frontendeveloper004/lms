import prisma from '@/lib/prisma';
import { notificationService } from '@/lib/notification-service';
import { checkCourseCompletion } from '@/lib/course-completion';

/**
 * Creates a notification for the course teacher when a student submits an assignment.
 * Requirements 2.1, 2.2, 2.3, 2.4
 */
export async function createNotificationForSubmission(
  submissionId: string,
  studentId: string,
  courseId: string
): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  });

  if (!course || !course.teacherId) {
    console.warn('[Notification] Course has no teacher, skipping notification', { courseId });
    return;
  }

  await notificationService.createNotification({
    type: 'ASSIGNMENT_SUBMITTED',
    recipientId: course.teacherId,
    senderId: studentId,
    referenceId: submissionId,
  });
}

/**
 * Creates notifications when a teacher grades an assignment submission.
 * - Always creates an ASSIGNMENT_GRADED notification for the student.
 * - Calls checkCourseCompletion; if the course is now complete, creates a
 *   COURSE_COMPLETED notification (duplicate-safe).
 * All errors are caught and logged — this function is fire-and-forget safe.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4
 */
export async function createNotificationForGrading(
  submissionId: string,
  studentId: string,
  teacherId: string,
  courseId: string
): Promise<void> {
  try {
    // 1. Create ASSIGNMENT_GRADED notification for the student
    await notificationService.createNotification({
      type: 'ASSIGNMENT_GRADED',
      recipientId: studentId,
      senderId: teacherId,
      referenceId: submissionId,
    });

    // 2. Check if the course is now fully complete
    const { isComplete, certificateId } = await checkCourseCompletion(studentId, courseId);

    // 3. If complete and a certificate was issued, send COURSE_COMPLETED notification
    if (isComplete && certificateId !== null) {
      // Prevent duplicate COURSE_COMPLETED notifications
      const existing = await prisma.notification.findFirst({
        where: {
          recipientId: studentId,
          type: 'COURSE_COMPLETED' as any,
          referenceId: certificateId,
        },
      });

      if (!existing) {
        await notificationService.createNotification({
          type: 'COURSE_COMPLETED',
          recipientId: studentId,
          senderId: teacherId,
          referenceId: certificateId,
        });
      }
    }
  } catch (err) {
    console.error('[NotificationTrigger] createNotificationForGrading failed:', err);
  }
}
