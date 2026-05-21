// Student Achievements — /student/achievements
// Certificates horizontal row + XP level card + stat cards + badge grid

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

function BadgeSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-200" />
      <div className="h-4 w-20 bg-slate-200 rounded-lg" />
      <div className="h-3 w-full bg-slate-100 rounded" />
      <div className="h-3 w-3/4 bg-slate-100 rounded" />
      <div className="h-8 w-full bg-slate-200 rounded-xl mt-1" />
    </div>
  );
}

export default function StudentAchievementsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-40 bg-slate-200 rounded-xl" />
        <div className="h-4 w-60 bg-slate-100 rounded-lg" />
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

      {/* Achievements Section — 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: XP card + stat cards */}
        <div className="space-y-4">
          {/* XP Level Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-4 w-20 bg-slate-200 rounded-full" />
            <div className="h-16 w-20 bg-slate-200 rounded-2xl mx-auto" />
            <div className="h-4 w-32 bg-slate-100 rounded-lg mx-auto" />
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full" />
            </div>
          </div>

          {/* 2 Stat Cards */}
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-10 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Badge Grid (2 cols, spans 2 lg cols) */}
        <div className="lg:col-span-2">
          <div className="h-6 w-28 bg-slate-200 rounded-xl mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BadgeSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
