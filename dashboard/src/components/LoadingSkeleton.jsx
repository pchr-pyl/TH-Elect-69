import React from 'react';

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูล">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
          <div className="h-8 bg-slate-200 rounded w-64"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-80 mt-2"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="w-6 h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="h-8 bg-slate-200 rounded w-16 mt-2"></div>
            <div className="h-3 bg-slate-200 rounded w-20 mt-2"></div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-slate-200 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-64"></div>
        </div>
        <div className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 py-3">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">กำลังโหลดข้อมูล...</span>
    </div>
  );
}

export default LoadingSkeleton;
