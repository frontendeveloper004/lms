// Teacher Submissions — /teacher/submissions
// 3 stat cards + filter bar + grouped student accordion rows

function SubmissionRowSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Colored top bar */}
      <div className="h-1.5 bg-slate-200" />
      <div className="p-5 space-y-4">
        {/* Student info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-slate-200 rounded-lg" />
            <div className="h-3 w-44 bg-slate-100 rounded-lg" />
          </div>
          <div className="ml-auto h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-3 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-3 w-3 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
        {/* Action button */}
        <div className="flex justify-end">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function TeacherSubmissionsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-52 bg-slate-200 rounded-xl" />
        <div className="h-4 w-72 bg-slate-100 rounded-lg" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { w: "w-16", label: "w-20" },
          { w: "w-12", label: "w-24" },
          { w: "w-14", label: "w-20" },
        ].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="h-7 w-10 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="hidden md:flex gap-3">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="h-10 w-40 bg-slate-200 rounded-xl" />
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Submission rows */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <SubmissionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
