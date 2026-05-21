import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { createNotificationForSubmission } from "@/lib/notification-triggers";
import { gradeSubmissionWithAI } from "@/lib/ai-grading";
import { createNotificationForGrading } from "@/lib/notification-triggers";
import { checkCourseCompletion } from "@/lib/course-completion";

type Params = { params: Promise<{ courseId: string; assignmentId: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const { courseId, assignmentId } = await params;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Siz kursga a'zo emassiz" }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        module: {
          include: {
            quizzes: true,
            course: { select: { id: true, teacherId: true } },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Topshiriq topilmadi" }, { status: 404 });
    }

    // Check if already graded
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: session.userId } },
    });

    if (existingSubmission?.status === "GRADED") {
      return NextResponse.json(
        { error: "Baholangan topshiriqni qayta yuborib bo'lmaydi" },
        { status: 403 }
      );
    }

    // Check quiz completion (assignment must be unlocked)
    const moduleQuizIds = assignment.module.quizzes.map((q: any) => q.id);
    if (moduleQuizIds.length > 0) {
      const completedQuizzes = await prisma.completedQuiz.findMany({
        where: { userId: session.userId, quizId: { in: moduleQuizIds } },
      });
      if (completedQuizzes.length < moduleQuizIds.length) {
        return NextResponse.json(
          { error: "Avval testni tugatish kerak" },
          { status: 403 }
        );
      }
    }

    const { htmlCode = "", cssCode = "", jsCode = "", filesCode, isMultiPart } = await req.json();

    // Validate: for multi-file tasks, filesCode must be present; for HTML_CSS_JS, at least one field
    const isEnglish = assignment.taskType.startsWith("ENGLISH_");
    const isMultiFile = !isEnglish && assignment.taskType !== "HTML_CSS_JS";
    
    if (isMultiFile) {
      if (!filesCode || typeof filesCode !== "object" || Object.keys(filesCode).length === 0) {
        return NextResponse.json({ error: "Javob bo'sh bo'lishi mumkin emas" }, { status: 400 });
      }
    } else if (isMultiPart) {
      // Multi-part listening: answers are in filesCode as a JSON string - already validated on client
      if (!filesCode || typeof filesCode !== "string") {
        return NextResponse.json({ error: "Barcha savollarga javob bering" }, { status: 400 });
      }
    } else {
      // For HTML_CSS_JS or ENGLISH essay types, content is in htmlCode
      if (!htmlCode.trim() && !cssCode.trim() && !jsCode.trim()) {
        return NextResponse.json({ error: "Javob bo'sh bo'lishi mumkin emas" }, { status: 400 });
      }
    }

    // Serialize filesCode for DB storage
    const filesCodeStr = isMultiFile && filesCode
      ? JSON.stringify(filesCode)
      : isMultiPart && typeof filesCode === "string"
        ? filesCode  // Already a JSON string from client
        : null;

    // Deterministic auto-grading for multi-part listening
    let computedScore: number | null = null;
    let computedFeedback: string | null = null;
    let listeningAutoGraded = false;
    let xpBonusToAward = 0;

    if (isMultiPart && assignment.starterCode) {
      try {
        const studentAnswers = typeof filesCode === "string" ? JSON.parse(filesCode) : filesCode;
        const teacherData = typeof assignment.starterCode === "string" ? JSON.parse(assignment.starterCode) : assignment.starterCode;

        if (teacherData && teacherData.parts) {
          let totalQuestions = 0;
          let correctAnswersCount = 0;

          teacherData.parts.forEach((part: any) => {
            part.questions.forEach((q: any) => {
              totalQuestions++;
              const studentAns = studentAnswers[q.id];
              if (studentAns !== undefined && studentAns !== null) {
                if (q.type === "SHORT_ANSWER") {
                  if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
                    correctAnswersCount++;
                  }
                } else {
                   if (String(studentAns) === String(q.correctAnswer)) {
                     correctAnswersCount++;
                   }
                }
              }
            });
          });

          computedScore = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
          computedFeedback = `Siz ${totalQuestions} ta savoldan ${correctAnswersCount} tasiga to'g'ri javob berdingiz. Avtomatik tekshiruv natijasi: ${computedScore} ball.`;
          listeningAutoGraded = true;
          
          if (computedScore === 100) xpBonusToAward = 30;
          else if (computedScore >= 80) xpBonusToAward = 20;
          else if (computedScore >= 60) xpBonusToAward = 10;
          else if (computedScore >= 40) xpBonusToAward = 5;
        }
      } catch (err) {
         console.error("Listening auto-grading error:", err);
      }
    }

    // Save submission (as GRADED if auto-graded, otherwise PENDING)
    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: session.userId } },
      create: {
        assignmentId,
        studentId: session.userId,
        htmlCode: isMultiFile ? "" : htmlCode,
        cssCode: isMultiFile ? "" : cssCode,
        jsCode: isMultiFile ? "" : jsCode,
        filesCode: filesCodeStr,
        status: listeningAutoGraded ? "GRADED" : "PENDING",
        gradedBy: listeningAutoGraded ? "SYSTEM" : "PENDING",
        score: listeningAutoGraded ? computedScore : null,
        feedback: listeningAutoGraded ? computedFeedback : null,
        xpBonus: listeningAutoGraded ? xpBonusToAward : null,
        gradedAt: listeningAutoGraded ? new Date() : null,
        submittedAt: new Date(),
      },
      update: {
        htmlCode: isMultiFile ? "" : htmlCode,
        cssCode: isMultiFile ? "" : cssCode,
        jsCode: isMultiFile ? "" : jsCode,
        filesCode: filesCodeStr,
        status: listeningAutoGraded ? "GRADED" : "PENDING",
        gradedBy: listeningAutoGraded ? "SYSTEM" : "PENDING",
        score: listeningAutoGraded ? computedScore : null,
        feedback: listeningAutoGraded ? computedFeedback : null,
        xpBonus: listeningAutoGraded ? xpBonusToAward : null,
        gradedAt: listeningAutoGraded ? new Date() : null,
        submittedAt: new Date(),
        // Reset previous AI grading if resubmitting
        aiScore: null,
        aiFeedback: null,
        aiGradedAt: null,
        aiConfidence: null,
      },
    });

    if (listeningAutoGraded) {
       // Increment XP directly
       if (xpBonusToAward > 0) {
          await prisma.user.update({
             where: { id: session.userId },
             data: { xpPoints: { increment: xpBonusToAward } },
          });
       }
       await checkCourseCompletion(session.userId, courseId);
       createNotificationForGrading(
          submission.id,
          session.userId,
          assignment.module.course.teacherId,
          courseId
       ).catch((err) => console.error("[Auto Grade] Notification failed:", err));
    }

    // Fire-and-forget: submission notification to teacher
    createNotificationForSubmission(submission.id, session.userId, courseId).catch((err) => {
      console.error("[Notification] Failed to create notification:", err);
    });

    // ── AI Auto-Grading (fire-and-forget background task) ──────────────────
    if (assignment.aiGradingEnabled && assignment.taskType !== "ENGLISH_LISTENING") {
      const teacherId = assignment.module.course.teacherId;

      // Run AI grading in background — do NOT await
      (async () => {
        try {
          const parsedFilesCode = isMultiFile ? filesCode : null;

          const aiResult = await gradeSubmissionWithAI({
            taskType: assignment.taskType,
            rubric: assignment.rubric,
            assignmentTitle: assignment.title,
            assignmentDescription: assignment.description,
            aiGradingPrompt: assignment.aiGradingPrompt,
            filesCode: parsedFilesCode,
            htmlCode: isMultiFile ? "" : htmlCode,
            cssCode: isMultiFile ? "" : cssCode,
            jsCode: isMultiFile ? "" : jsCode,
          });

          // Update submission with AI grading results
          await prisma.$transaction([
            prisma.assignmentSubmission.update({
              where: { id: submission.id },
              data: {
                // AI natijalarini saqlash
                aiScore: aiResult.score,
                aiFeedback: aiResult.feedback,
                aiGradedAt: new Date(),
                aiConfidence: aiResult.confidence,
                // Asosiy baholash maydonlarini ham AI natijasi bilan to'ldirish
                score: aiResult.score,
                feedback: aiResult.feedback,
                xpBonus: aiResult.xpBonus,
                status: "GRADED",
                gradedBy: "AI",
                gradedAt: new Date(),
                aiBreakdown: aiResult.breakdown ? JSON.stringify(aiResult.breakdown) : null,
              },
            }),
            // Student XP ni oshirish
            prisma.user.update({
              where: { id: session.userId },
              data: { xpPoints: { increment: aiResult.xpBonus } },
            }),
          ]);

          // Update progress & check for certificate after AI grading
          await checkCourseCompletion(session.userId, courseId);

          // AI baholash tugagani haqida studentga notification
          createNotificationForGrading(
            submission.id,
            session.userId,
            teacherId,
            courseId
          ).catch((err) => console.error("[AI Grade] Notification failed:", err));

          console.log(
            `[AI Grade] Submission ${submission.id} graded: score=${aiResult.score}, confidence=${aiResult.confidence}`
          );
        } catch (err) {
          console.error(`[AI Grade] Failed to grade submission ${submission.id}:`, err);
          // AI xato bo'lsa — PENDING holatida qoladi, teacher qo'lda baholaydi
        }
      })();
    }
    // ── End AI Auto-Grading ────────────────────────────────────────────────

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
