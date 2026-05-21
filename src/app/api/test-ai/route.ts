import { NextResponse } from "next/server";
import { gradeSubmissionWithAI } from "@/lib/ai-grading";

export async function GET() {
  try {
    // CSS topshirig'iga React kodi yuborilgan — past ball berishi kerak
    const result = await gradeSubmissionWithAI({
      taskType: "HTML_CSS_JS",
      rubric: "- CSS Grid yoki Flexbox ishlatilgan (40 ball)\n- Responsive dizayn (30 ball)\n- Rangli va chiroyli UI (30 ball)",
      assignmentTitle: "CSS asoslari — Flexbox layout",
      assignmentDescription: "Flexbox yordamida 3 ustunli layout yarating",
      aiGradingPrompt: null,
      filesCode: null,
      htmlCode: `"use client";
import { useEffect, useState } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
export function TeacherMessagesClient({ currentUserId }) {
  const [students, setStudents] = useState([]);
  return <div>{students.length === 0 ? "Talabalar yo'q" : students.map(s => <div key={s.id}>{s.name}</div>)}</div>
}`,
      cssCode: "",
      jsCode: "",
    });
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
