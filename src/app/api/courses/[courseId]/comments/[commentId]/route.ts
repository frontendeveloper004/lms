import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notifyUser } from "@/app/api/messages/sse/route";

// Helper: broadcast to all course participants
async function broadcastToParticipants(
  courseId: string,
  excludeUserId: string,
  payload: object
) {
  const [course, enrollments] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId }, select: { teacherId: true } }),
    prisma.enrollment.findMany({ where: { courseId }, select: { studentId: true } }),
  ]);
  if (!course) return;
  const ids = new Set<string>([course.teacherId]);
  enrollments.forEach((e) => ids.add(e.studentId));
  ids.forEach((uid) => { if (uid !== excludeUserId) notifyUser(uid, payload); });
}

// PATCH /api/courses/[courseId]/comments/[commentId]
// Actions: edit text | toggle like | pin (teacher only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; commentId: string }> }
) {
  const { courseId, commentId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.courseComment.findUnique({
    where: { id: commentId },
    include: { course: { select: { teacherId: true } } },
  });
  if (!comment || comment.courseId !== courseId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const body = await req.json();
  const action: string = body.action; // "edit" | "like" | "pin"

  // ── Edit ──────────────────────────────────────────────────────
  if (action === "edit") {
    if (comment.authorId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const text: string = (body.text || "").trim();
    if (!text || text.length > 2000) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }
    const updated = await prisma.courseComment.update({
      where: { id: commentId },
      data: { text, isEdited: true },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
      },
    });
    const editResult = {
      ...updated,
      likedByMe: updated.likes.some((l) => l.userId === session.userId),
      likesCount: updated.likes.length,
    };
    // Broadcast edit
    broadcastToParticipants(courseId, session.userId, {
      type: "comment_updated",
      courseId,
      comment: editResult,
    });
    return NextResponse.json(editResult);
  }

  // ── Like / Unlike ─────────────────────────────────────────────
  if (action === "like") {
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: session.userId, commentId } },
    });
    if (existing) {
      // Unlike — just remove, no notification
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId: session.userId, commentId } },
      });
    } else {
      // Like — create and notify comment author (skip self-like)
      await prisma.commentLike.create({
        data: { userId: session.userId, commentId },
      });

      if (comment.authorId !== session.userId) {
        await prisma.notification.create({
          data: {
            type: "COMMENT_LIKED",
            recipientId: comment.authorId,
            senderId: session.userId,
            referenceId: commentId,
            isRead: false,
          },
        });
      }
    }
    const likesCount = await prisma.commentLike.count({ where: { commentId } });
    // Broadcast like update
    broadcastToParticipants(courseId, session.userId, {
      type: "comment_liked",
      courseId,
      commentId,
      parentId: comment.parentId,
      liked: !existing,
      likesCount,
    });
    return NextResponse.json({ liked: !existing, likesCount });
  }

  // ── Pin / Unpin (teacher only) ────────────────────────────────
  if (action === "pin") {
    if (session.userId !== comment.course.teacherId) {
      return NextResponse.json({ error: "Only the teacher can pin comments" }, { status: 403 });
    }
    const updated = await prisma.courseComment.update({
      where: { id: commentId },
      data: { isPinned: !comment.isPinned },
    });
    return NextResponse.json({ isPinned: updated.isPinned });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// DELETE /api/courses/[courseId]/comments/[commentId]
// Author or teacher can delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; commentId: string }> }
) {
  const { courseId, commentId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.courseComment.findUnique({
    where: { id: commentId },
    include: { course: { select: { teacherId: true } } },
  });
  if (!comment || comment.courseId !== courseId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const isAuthor = comment.authorId === session.userId;
  const isTeacher = comment.course.teacherId === session.userId;
  const isAdmin = session.role === "ADMIN";

  if (!isAuthor && !isTeacher && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.courseComment.delete({ where: { id: commentId } });
  // Broadcast delete
  broadcastToParticipants(courseId, session.userId, {
    type: "comment_deleted",
    courseId,
    commentId,
    parentId: comment.parentId,
  });
  return NextResponse.json({ success: true });
}
