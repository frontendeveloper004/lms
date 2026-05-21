// Student Dashboard — /student
// 3 stat cards + promo banner + active courses row + completed courses row + certificates row

function HorizontalCourseCardSkeleton() {
  return (
    <div className="min-w-[260px] w-[260px] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
      <div className="h-32 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-full bg-slate-200 rounded-lg" />
        <div className="h-3 w-3/4 bg-slate-100 rounded-lg" />
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-3 w-8 bg-slate-100 rounded" />
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full">
            <div className="h-2 w-1/3 bg-slate-300 rounded-full" />
          </div>
        </div>
        <div className="h-9 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

function CertCardSkeleton() {
  return (
    <div className="min-w-[220px] w-[220px] bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
      <div className="h-28 bg-gradient-to-br from-slate-200 to-slate-300" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-full bg-slate-200 rounded-lg" />
        <div className="h-8 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function StudentDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-10 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-9 w-56 bg-slate-200 rounded-xl" />
        <div className="h-4 w-72 bg-slate-100 rounded-lg" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: "w-8 h-8", color: "bg-blue-100" },
          { icon: "w-8 h-8", color: "bg-emerald-100" },
          { icon: "w-8 h-8", color: "bg-violet-100" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.color}`} />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded-full" />
              <div className="h-7 w-10 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="bg-slate-200 rounded-2xl h-28" />

      {/* Active Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 rounded-xl" />
          <div className="h-4 w-20 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <HorizontalCourseCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Completed Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 bg-slate-200 rounded-xl" />
          <div className="h-4 w-20 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2].map((i) => (
            <HorizontalCourseCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Certificates Section */}
      <div className="space-y-4">
        <div className="h-6 w-36 bg-slate-200 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <CertCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
