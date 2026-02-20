import React from 'react';

function KPI_Card({ title, value, icon, subtitle, trend }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col" role="article" aria-label={title}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg" aria-hidden="true">{icon}</div>
      </div>
      <div className="mt-auto">
        <p className="text-2xl font-bold text-slate-800" aria-label={`${title}: ${value}`}>{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <p className="text-sm font-medium text-slate-600">{subtitle}</p>}
          {trend && <p className="text-xs text-slate-400">({trend})</p>}
        </div>
      </div>
    </div>
  );
}

export default KPI_Card;
