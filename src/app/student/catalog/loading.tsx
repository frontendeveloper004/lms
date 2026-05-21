// Student Catalog — /student/catalog
// Search/filter bar + grid of course cards

function CatalogCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Cover */}
      <div className="h-44 bg-slate-200" />
      <div className="p-5 space-y-3">
        {/* Category + level badges */}
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        {/* Title */}
        <div className="h-5 w-full bg-slate-200 rounded-lg" />
        <div className="h-4 w-4/5 bg-slate-100 rounded-lg" />
        {/* Teacher */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-7 h-7 rounded-full bg-slate-200" />
          <div className="h-3 w-24 bg-slate-100 rounded-lg" />
        </div>
        {/* Price + enroll button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudentCatalogLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="h-4 w-64 bg-slate-100 rounded-lg" />
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-slate-200 rounded-xl" />
        <div className="h-11 w-40 bg-slate-200 rounded-xl" />
        <div className="h-11 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 rounded-full" />
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CatalogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
