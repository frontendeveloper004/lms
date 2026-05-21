// Teacher Students — /teacher/students
// Header + search + desktop table / mobile cards

function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      {/* Student name + email */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </td>
      {/* Courses */}
      <td className="py-4 px-4">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
      </td>
      {/* Join date */}
      <td className="py-4 px-4">
        <div className="h-4 w-24 bg-slate-100 rounded-lg" />
      </td>
      {/* Action */}
      <td className="py-4 px-4">
        <div className="h-8 w-20 bg-slate-200 rounded-xl" />
      </td>
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="h-1.5 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded-lg" />
            <div className="h-3 w-36 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-slate-100 rounded-lg" />
          <div className="h-8 w-20 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function TeacherStudentsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-40 bg-slate-200 rounded-xl" />
            <div className="h-6 w-10 bg-slate-100 rounded-full" />
          </div>
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Search */}
      <div className="h-11 w-full max-w-sm bg-slate-200 rounded-xl" />

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="py-3 px-4 text-left">
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </th>
              <th className="py-3 px-4 text-left">
                <div className="h-3 w-12 bg-slate-200 rounded" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <MobileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
