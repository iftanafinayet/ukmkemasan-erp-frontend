import React from 'react';

export default function ReportTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
      <p className="font-black text-slate-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}
