import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notifyUser } from "@/app/api/messages/sse/route";

// GET /api/courses/[courseId]/comments
// Returns top-level comments with replies and like counts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { commentsEnabled: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.courseComment.findMany({
      where: { courseId, parentId: null },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        likes: { select: { userId: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
            likes: { select: { userId: true } },
          },
        },
      },
    }),
    prisma.courseComment.count({ where: { courseId, parentId: null } }),
  ]);

  // Attach likedByMe flag
  const withMeta = comments.map((c) => ({
    ...c,
    likedByMe: c.likes.some((l) => l.userId === session.userId),
    likesCount: c.likes.length,
    replies: c.replies.map((r) => ({
      ...r,
      likedByMe: r.likes.some((l) => l.userId === session.userId),
      likesCount: r.likes.length,
    })),
  }));

  return NextResponse.json({
    comments: withMeta,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    commentsEnabled: course.commentsEnabled,
  });
}

// POST /api/courses/[courseId]/comments
// Create a new comment or reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { commentsEnabled: true, teacherId: true, title: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!course.commentsEnabled) {
    return NextResponse.json({ error: "Comments are disabled for this course" }, { status: 403 });
  }

  const body = await req.json();
  const text: string = (body.text || "").trim();
  const parentId: string | null = body.parentId || null;

  if (!text || text.length < 1) {
    return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Comment is too long (max 2000 chars)" }, { status: 400 });
  }

  // If reply, verify parent exists and belongs to this course
  if (parentId) {
    const parent = await prisma.courseComment.findUnique({ where: { id: parentId } });
    if (!parent || parent.courseId !== courseId) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
    // Only allow 1 level of nesting
    if (parent.parentId !== null) {
      return NextResponse.json({ error: "Cannot reply to a reply" }, { status: 400 });
    }
  }

  const comment = await prisma.courseComment.create({
    data: {
      text,
      courseId,
      authorId: session.userId,
      parentId,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true, role: true } },
    },
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  // Rule 1: Reply → notify parent comment author (COMMENT_REPLY)
  // Rule 2: @mention → notify mentioned user (COMMENT_MENTION), skip self

  const notifySet = new Set<string>(); // avoid duplicate notifications to same person

  // Rule 1 — reply notification
  if (parentId) {
    const parent = await prisma.courseComment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parent && parent.authorId !== session.userId) {
      notifySet.add(parent.authorId);
      await prisma.notification.create({
        data: {
          type: "COMMENT_REPLY",
          recipientId: parent.authorId,
          senderId: session.userId,
          referenceId: comment.id,
          isRead: false,
        },
      });
    }
  }

  // Rule 2 — @mention notification
  // Extract all @word tokens from the comment text
  const mentionRegex = /@([\wА-Яа-яёЁ'`\-]+)/gu;
  const rawMentions = [...text.matchAll(mentionRegex)].map((m) =>
    m[1].toLowerCase().replace(/['\-`]/g, "")
  );

  if (rawMentions.length > 0) {
    // Collect all participants: teacher + enrolled students
    const [teacherUser, enrollments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: course.teacherId },
        select: { id: true, name: true },
      }),
      prisma.enrollment.findMany({
        where: { courseId },
        select: { student: { select: { id: true, name: true } } },
      }),
    ]);

    const participants: { id: string; name: string }[] = [];
    if (teacherUser) participants.push(teacherUser);
    for (const e of enrollments) participants.push(e.student);

    for (const participant of participants) {
      // Skip self
      if (participant.id === session.userId) continue;
      // Skip already notified (e.g. already got COMMENT_REPLY)
      if (notifySet.has(participant.id)) continue;

      // Normalize participant name for matching
      // Split into parts and check if any @mention token matches any name part
      const nameParts = participant.name
        .toLowerCase()
        .split(/\s+/)
        .map((p) => p.replace(/['\-`]/g, ""));

      const isMentioned = rawMentions.some((mention) =>
        nameParts.some(
          (part) => part.startsWith(mention) || mention.startsWith(part)
        )
      );

      if (isMentioned) {
        notifySet.add(participant.id);
        await prisma.notification.create({
          data: {
            type: "COMMENT_MENTION",
            recipientId: participant.id,
            senderId: session.userId,
            referenceId: comment.id,
            isRead: false,
          },
        });
      }
    }
  }

  // ── Broadcast new comment to all course participants via SSE ──────────────
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { studentId: true },
  });
  const participantIds = new Set<string>([course.teacherId]);
  enrollments.forEach((e) => participantIds.add(e.studentId));

  const broadcastPayload = {
    type: "comment_new",
    courseId,
    comment: { ...comment, likedByMe: false, likesCount: 0, replies: [] },
  };
  participantIds.forEach((uid) => {
    if (uid !== session.userId) notifyUser(uid, broadcastPayload);
  });

  return NextResponse.json({ ...comment, likedByMe: false, likesCount: 0, replies: [] }, { status: 201 });
}