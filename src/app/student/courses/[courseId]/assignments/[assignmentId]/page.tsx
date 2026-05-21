"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProgrammingAssignmentClient from "./ProgrammingAssignmentClient";
import EnglishAssignmentClient from "./EnglishAssignmentClient";

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const assignmentId = params.assignmentId as string;

  const [course, setCourse] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [currRes, assignRes] = await Promise.all([
        fetch(`/api/student/courses/${courseId}/curriculum`),
        fetch(`/api/student/courses/${courseId}/assignments/${assignmentId}`),
      ]);

      if (!currRes.ok || !assignRes.ok) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
        return;
      }

      const curriculumData = await currRes.json();
      const assignmentData = await assignRes.json();

      setCourse(curriculumData);
      setAssignment(assignmentData.assignment);
      setSubmission(assignmentData.submission);
    } catch (err) {
      console.error(err);
      setError("Server bilan aloqa uzildi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, assignmentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 animate-pulse">
           <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
        <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !assignment || !course) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-6 text-center gap-5">
        <p className="text-lg font-black text-slate-900">{error || "Topshiriq topilmadi."}</p>
        <button
          onClick={() => router.push("/student")}
          className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100"
        >
          Mening darslarimga qaytish
        </button>
      </div>
    );
  }

  // Determine subjectType from new API path: assignment.module.course.teacher.subjectType
  const subjectType = assignment.module?.course?.teacher?.subjectType || "PROGRAMMING";

  // Determine status from curriculum
  let assignmentStatus: any = "unlocked";
  for (const mod of course.modules) {
    if (mod.assignment?.id === assignmentId) {
      assignmentStatus = mod.assignment.status;
      break;
    }
  }

  if (subjectType === "ENGLISH") {
    return (
      <EnglishAssignmentClient
        courseId={courseId}
        assignmentId={assignmentId}
        course={course}
        assignment={assignment}
        submission={submission}
        assignmentStatus={assignmentStatus}
        onRefresh={fetchData}
      />
    );
  }

  return (
    <ProgrammingAssignmentClient
      courseId={courseId}
      assignmentId={assignmentId}
      course={course}
      assignment={assignment}
      submission={submission}
      assignmentStatus={assignmentStatus}
      onRefresh={fetchData}
    />
  );
}
