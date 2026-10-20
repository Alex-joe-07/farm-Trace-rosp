import React from 'react';

export default function Card({ title, value, children, icon: Icon, badge }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            {badge}
          </span>
        )}
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      {value !== undefined && (
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}