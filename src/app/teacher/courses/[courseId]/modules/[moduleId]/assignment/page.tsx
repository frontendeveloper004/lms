"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import EnglishAssignmentPage from "./EnglishAssignmentClient";
import ProgrammingAssignmentPage from "./ProgrammingAssignmentClient";

export default function AssignmentRouterPage() {
  const params = useParams();
  const [subjectType, setSubjectType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubject = async () => {
      try {
        const res = await fetch("/api/teacher/profile");
        if (res.ok) {
          const data = await res.json();
          setSubjectType(data.subjectType || "PROGRAMMING");
        } else {
          setSubjectType("PROGRAMMING");
        }
      } catch (err) {
        console.error("Subject check error:", err);
        setSubjectType("PROGRAMMING");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubject();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
          Yuklanmoqda...
        </h2>
      </div>
    );
  }

  if (subjectType === "ENGLISH") {
    return <EnglishAssignmentPage />;
  }

  return <ProgrammingAssignmentPage />;
}
