// Teacher Courses — /teacher/courses
// Header + 3 section (Pending/Approved/Rejected) with horizontal course card rows

function CourseCardSkeleton() {
  return (
    <div className="min-w-[280px] w-[280px] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
      {/* Cover image */}
      <div className="h-36 bg-slate-200" />
      <div className="p-4 space-y-3">
        {/* Status + category badges */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-20 bg-slate-100 rounded-full" />
        </div>
        {/* Title */}
        <div className="h-5 w-full bg-slate-200 rounded-lg" />
        <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
        {/* Price + enrollments */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-20 bg-slate-200 rounded-lg" />
          <div className="h-4 w-16 bg-slate-100 rounded-lg" />
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 bg-slate-200 rounded-xl" />
          <div className="h-8 w-8 bg-slate-100 rounded-xl" />
          <div className="h-8 w-8 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 bg-slate-200 rounded-full" />
        <div className="h-5 w-32 bg-slate-200 rounded-lg" />
        <div className="h-5 w-8 bg-slate-100 rounded-full" />
      </div>
      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function TeacherCoursesLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Pending section */}
      <SectionSkeleton label="Kutilmoqda" />

      {/* Approved section */}
      <SectionSkeleton label="Tasdiqlangan" />

      {/* Rejected section */}
      <SectionSkeleton label="Rad etilgan" />
    </div>
  );
}
